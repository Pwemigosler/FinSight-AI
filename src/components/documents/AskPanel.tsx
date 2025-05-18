
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { SendHorizonal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AskPanelProps {
  documentId: string;
  documentName: string;
}

interface Source {
  content: string;
}

interface AskResponse {
  answer: string;
  sources: Source[];
  document: string;
}

export const AskPanel = ({ documentId, documentName }: AskPanelProps) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);

  const handleAsk = async () => {
    if (!user || !documentId || !question.trim()) {
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke<AskResponse>("askDocument", {
        body: {
          question: question.trim(),
          documentId,
        },
      });

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No response from server");
      
      setResponse(data);
    } catch (error: any) {
      console.error("Error asking question:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{documentName || "Select a document"}</CardTitle>
        <CardDescription>
          Ask questions about your document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {response && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Answer:</h4>
            <div className="bg-gray-50 p-4 rounded-md border">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{response.answer}</p>
              </div>
            </div>
            
            <h4 className="text-sm font-medium mt-4 mb-2">Sources:</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {response.sources.map((source, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-md border text-sm">
                    <p className="text-gray-600 whitespace-pre-wrap">{source.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <Separator className="my-4" />
          </div>
        )}

        <div className="relative">
          <Textarea
            placeholder={
              !documentId
                ? "Select a document first"
                : "Ask a question about your document..."
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!documentId || loading}
            className="pr-10 min-h-[100px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2"
            disabled={!documentId || !question.trim() || loading}
            onClick={handleAsk}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <span>
          {documentId
            ? "Ask questions about the selected document."
            : "Select a document to get started."}
        </span>
      </CardFooter>
    </Card>
  );
};
