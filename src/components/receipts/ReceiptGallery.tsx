
import { useState, useEffect } from "react";
import { getReceiptsByTransactionId, getReceiptInfo, deleteReceipt } from "@/services/receiptService";
import { Receipt } from "@/types/receipt";
import { ReceiptInfo } from "@/types/chat";
import { FileText, Download, Trash2, Receipt as ReceiptIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReceiptGalleryProps {
  transactionId: string;
  refreshTrigger?: number;
}

const ReceiptGallery = ({ transactionId, refreshTrigger = 0 }: ReceiptGalleryProps) => {
  const [receipts, setReceipts] = useState<ReceiptInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptInfo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchReceipts = async () => {
      setIsLoading(true);
      try {
        const receiptData = await getReceiptsByTransactionId(transactionId);
        
        // Get signed URLs for each receipt
        const receiptsWithUrls = await Promise.all(
          receiptData.map(async receipt => await getReceiptInfo(receipt))
        );
        
        setReceipts(receiptsWithUrls);
      } catch (error) {
        console.error("Error fetching receipts:", error);
        toast.error("Failed to load receipts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, [transactionId, refreshTrigger]);

  const handlePreview = (receipt: ReceiptInfo) => {
    setSelectedReceipt(receipt);
    setIsPreviewDialogOpen(true);
  };

  const handleDownload = (receipt: ReceiptInfo) => {
    if (receipt.full_url) {
      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = receipt.full_url;
      link.download = receipt.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (receipt: ReceiptInfo) => {
    setSelectedReceipt(receipt);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReceipt) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteReceipt(selectedReceipt.id);
      
      if (result.success) {
        toast.success("Receipt deleted successfully");
        setReceipts(receipts.filter(r => r.id !== selectedReceipt.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(`Failed to delete receipt: ${result.message}`);
      }
    } catch (error) {
      toast.error(`An error occurred: ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPreviewContent = () => {
    if (!selectedReceipt) return null;
    
    if (selectedReceipt.file_type?.includes('pdf')) {
      return (
        <div className="w-full h-96 border rounded">
          <iframe 
            src={`${selectedReceipt.full_url}#view=FitH`}
            className="w-full h-full"
            title={selectedReceipt.file_name}
          />
        </div>
      );
    }
    
    if (selectedReceipt.file_type?.includes('image')) {
      return (
        <div className="w-full flex justify-center">
          <img 
            src={selectedReceipt.full_url || ''} 
            alt={selectedReceipt.file_name}
            className="max-h-[80vh] object-contain"
          />
        </div>
      );
    }
    
    return (
      <div className="p-8 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto" />
        <p className="mt-2">Preview not available for this file type</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-finsight-purple" />
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-8">
        <ReceiptIcon className="h-12 w-12 text-gray-300 mx-auto" />
        <p className="mt-2 text-gray-500">No receipts found for this transaction</p>
        <p className="text-sm text-gray-400">Upload a receipt using the Upload tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="border rounded-md overflow-hidden bg-gray-50"
          >
            {/* Receipt preview thumbnail */}
            <div 
              className="h-32 cursor-pointer"
              onClick={() => handlePreview(receipt)}
            >
              {receipt.file_type?.includes('image') && receipt.full_url ? (
                <img
                  src={receipt.full_url}
                  alt={receipt.file_name}
                  className="h-full w-full object-contain bg-white"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Receipt details */}
            <div className="p-2 bg-white">
              <div className="text-sm font-medium truncate">{receipt.file_name}</div>
              <div className="text-xs text-gray-500 mb-2">
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 0,
                }).format(receipt.file_size / 1024)} KB
              </div>
              
              {/* Actions */}
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => handlePreview(receipt)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownload(receipt)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-none text-red-600"
                  onClick={() => handleDelete(receipt)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{selectedReceipt?.file_name}</DialogTitle>
          </DialogHeader>
          {renderPreviewContent()}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
            {selectedReceipt && (
              <Button 
                variant="outline"
                onClick={() => handleDownload(selectedReceipt)}
                className="bg-finsight-purple text-white hover:bg-finsight-purple/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Receipt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptGallery;
