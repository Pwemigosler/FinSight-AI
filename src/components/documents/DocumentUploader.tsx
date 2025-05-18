
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

export const DocumentUploader = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("You must be logged in to upload documents");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const documentId = uuidv4();
      const filePath = `${user.id}/${documentId}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      // Create document record in database
      const { error: dbError } = await supabase.from("documents").insert({
        id: documentId,
        user_id: user.id,
        file_name: file.name,
        storage_path: filePath,
      });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Start document processing
      setProcessing(true);
      const { error: processingError } = await supabase.functions.invoke(
        "processDocument",
        {
          body: {
            documentId,
            filePath,
          },
        }
      );

      if (processingError) {
        throw new Error(`Processing error: ${processingError.message}`);
      }

      toast.success("Document uploaded and processed successfully");
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setUploading(false);
      setProcessing(false);
      // Reset file input
      e.target.value = "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload a PDF document to analyze with AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          {uploading || processing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-gray-500">
                {uploading ? "Uploading..." : "Processing document..."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <FileText size={48} className="mx-auto text-gray-400" />
              </div>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="relative">
          <Button
            disabled={uploading || processing}
            className="flex items-center space-x-2"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            disabled={uploading || processing}
          />
        </div>
      </CardFooter>
    </Card>
  );
};
