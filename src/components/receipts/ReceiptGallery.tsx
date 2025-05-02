
import { useState, useEffect } from "react";
import { ReceiptInfo } from "@/types/chat";
import { getReceiptsByTransactionId, getReceiptInfo } from "@/services/receiptService";
import { Receipt, FileX, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptGalleryProps {
  transactionId: string;
  refreshTrigger?: number;
}

const ReceiptGallery = ({ transactionId, refreshTrigger = 0 }: ReceiptGalleryProps) => {
  const [receipts, setReceipts] = useState<ReceiptInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptInfo | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      setIsLoading(true);
      try {
        const receiptData = await getReceiptsByTransactionId(transactionId);
        const receiptsWithUrls = await Promise.all(
          receiptData.map(receipt => getReceiptInfo(receipt))
        );
        setReceipts(receiptsWithUrls);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReceipts();
  }, [transactionId, refreshTrigger]);

  const openReceipt = (receipt: ReceiptInfo) => {
    setSelectedReceipt(receipt);
    if (receipt.full_url) {
      window.open(receipt.full_url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-finsight-purple" />
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-8">
        <FileX className="h-12 w-12 text-gray-400 mx-auto" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
        <p className="mt-1 text-sm text-gray-500">
          No receipts have been uploaded for this transaction yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
      {receipts.map((receipt) => (
        <div 
          key={receipt.id} 
          className="border rounded-md p-3 flex flex-col items-center hover:bg-gray-50 cursor-pointer"
          onClick={() => openReceipt(receipt)}
        >
          {receipt.file_type && receipt.file_type.includes('pdf') ? (
            <div className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded">
              <Receipt className="h-12 w-12 text-finsight-purple" />
            </div>
          ) : (
            receipt.full_url ? (
              <img 
                src={receipt.full_url} 
                alt={receipt.file_name}
                className="h-24 w-24 object-cover rounded"
              />
            ) : (
              <div className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded">
                <Receipt className="h-12 w-12 text-finsight-purple" />
              </div>
            )
          )}
          
          <div className="mt-2 text-center">
            <p className="text-xs font-medium truncate w-full">
              {receipt.file_name}
            </p>
            <Button size="sm" variant="ghost" className="mt-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReceiptGallery;
