
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { question, documentId } = await req.json();
    
    if (!question || !documentId) {
      return new Response(
        JSON.stringify({
          error: 'Question and document ID are required',
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

    // Initialize Supabase client with service role key to bypass RLS
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
      .select('id, file_name')
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

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: openaiKey,
    });
    const openai = new OpenAIApi(configuration);
    
    // Generate embeddings for the question
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: question.trim(),
    });
    
    const [{ embedding }] = embeddingResponse.data.data;

    // Find relevant document chunks based on vector similarity
    const { data: chunks, error: chunksError } = await supabase.rpc(
      'match_document_chunks',
      {
        query_embedding: embedding,
        match_document_id: documentId,
        match_user_id: user.id,
        match_threshold: 0.5,
        match_count: 5,
      }
    );
    
    if (chunksError) {
      // Use direct vector search query as fallback
      const { data: fallbackChunks, error: fallbackError } = await supabase
        .from('document_chunks')
        .select('content')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .limit(5);
        
      if (fallbackError || !fallbackChunks.length) {
        return new Response(
          JSON.stringify({ error: 'No document chunks found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      chunks = fallbackChunks;
    }

    // Create context from chunks
    const context = chunks.map(chunk => chunk.content).join("\n\n");
    
    // Generate completion with context
    const prompt = `
    You are an AI assistant helping with document questions. Please answer the following question based only on the provided context.
    
    CONTEXT:
    ${context}
    
    QUESTION:
    ${question}
    
    ANSWER:
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that answers questions based only on the provided document context."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.0,
      max_tokens: 500,
    });

    const answer = completion.data.choices[0].message?.content.trim();

    return new Response(
      JSON.stringify({
        answer,
        sources: chunks.map(chunk => ({ content: chunk.content })),
        document: document.file_name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
