
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Document {
  id: string;
  file_name: string;
  uploaded_at: string;
}

interface DocumentListProps {
  onSelect: (documentId: string, documentName: string) => void;
  selectedDocumentId?: string;
}

export const DocumentList = ({ onSelect, selectedDocumentId }: DocumentListProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!user) return;

    try {
      // Get the document to find storage path
      const { data: document, error: fetchError } = await supabase
        .from("documents")
        .select("storage_path")
        .eq("id", documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete document chunks first (foreign key constraints)
      const { error: chunksError } = await supabase
        .from("document_chunks")
        .delete()
        .eq("document_id", documentId);

      if (chunksError) throw chunksError;

      // Delete the document record
      const { error: docError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (docError) throw docError;

      // Delete the file from storage
      if (document?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([document.storage_path]);

        if (storageError) throw storageError;
      }

      toast.success("Document deleted successfully");
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // If the deleted document was selected, clear selection
      if (selectedDocumentId === documentId) {
        onSelect("", "");
      }
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setDeleteId(null);
    }
  };

  // Subscribe to document changes using Supabase realtime
  useEffect(() => {
    if (!user) return;

    fetchDocuments();

    const channel = supabase
      .channel("document-changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "documents" 
        },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>Manage your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center p-3 border rounded-md">
                <Skeleton className="h-10 w-10 rounded-md mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Documents</CardTitle>
        <CardDescription>Manage your uploaded documents</CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload a document to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
                  selectedDocumentId === doc.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onSelect(doc.id, doc.file_name)}
              >
                <div className="flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{doc.file_name}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <AlertDialog open={deleteId === doc.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(doc.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this document? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
