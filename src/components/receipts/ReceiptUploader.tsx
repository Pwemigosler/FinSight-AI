
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, Upload, File, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadReceipt } from "@/services/receiptService";

interface ReceiptUploaderProps {
  transactionId: string;
  onUploadComplete?: (success: boolean) => void;
}

const ReceiptUploader = ({ transactionId, onUploadComplete }: ReceiptUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const result = await uploadReceipt(file, transactionId);
      
      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive"
        });
        onUploadComplete?.(false);
      } else {
        toast({
          title: "Receipt uploaded",
          description: "Your receipt has been successfully uploaded",
        });
        setFile(null);
        onUploadComplete?.(true);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: `An unexpected error occurred: ${(error as Error).message}`,
        variant: "destructive"
      });
      onUploadComplete?.(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <Label 
            htmlFor="receipt-file" 
            className="cursor-pointer bg-finsight-purple text-white py-2 px-4 rounded-md hover:bg-finsight-purple/90 inline-block"
          >
            <Upload className="h-4 w-4 inline-block mr-2" />
            Select Receipt
          </Label>
          <Input
            id="receipt-file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          JPG, PNG or PDF, max 5MB
        </p>
      </div>

      {file && (
        <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <File className="h-5 w-5 text-finsight-blue" />
            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            <span className="text-xs text-gray-500">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            size="sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
