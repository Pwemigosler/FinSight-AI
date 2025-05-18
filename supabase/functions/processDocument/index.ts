
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";
import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import * as pdfjs from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request parameters
    const { documentId, filePath } = await req.json();
    
    if (!documentId || !filePath) {
      return new Response(
        JSON.stringify({
          error: 'Document ID and file path are required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const openaiKey = Deno.env.get("OPENAI_API_KEY") as string;

    if (!supabaseUrl || !supabaseServiceKey || !openaiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT to get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get document to ensure it belongs to the user
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();
      
    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found or access denied' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Download the file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('documents')
      .download(filePath);
      
    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the PDF document
    const pdfData = new Uint8Array(await fileData.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
    
    // Extract text content by page
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    // Split content into chunks of approximately 1000 characters
    const chunkSize = 1000;
    const chunks = [];
    let currentChunk = '';
    
    // Split by paragraph first
    const paragraphs = fullText.split('\n\n');
    
    for (const paragraph of paragraphs) {
      // If the paragraph is too long, split it further
      if (paragraph.length > chunkSize) {
        // Split by sentences as best as possible
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length <= chunkSize) {
            currentChunk += sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
          }
        }
      } else {
        // Add paragraph to current chunk if it fits
        if (currentChunk.length + paragraph.length <= chunkSize) {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        } else {
          chunks.push(currentChunk.trim());
          currentChunk = paragraph;
        }
      }
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: openaiKey,
    });
    const openai = new OpenAIApi(configuration);
    
    // Process chunks in batches to avoid rate limiting
    const batchSize = 5;
    const processedChunks = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Generate embeddings for each chunk in the batch
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: batch,
      });
      
      const embeddings = embeddingResponse.data.data;
      
      // Prepare data for insertion
      const chunkData = batch.map((content, index) => ({
        user_id: user.id,
        document_id: documentId,
        content,
        embedding: embeddings[index].embedding,
      }));
      
      // Insert chunks into database
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(chunkData);
        
      if (insertError) {
        console.error("Error inserting chunks:", insertError);
      }
      
      processedChunks.push(...chunkData);
    }
    
    return new Response(
      JSON.stringify({
        message: 'Document processed successfully',
        chunkCount: processedChunks.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
