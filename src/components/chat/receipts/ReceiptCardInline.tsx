
import { ReceiptInfo } from "@/types/chat";
import { Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptCardInlineProps {
  receipt: ReceiptInfo;
}

const ReceiptCardInline = ({ receipt }: ReceiptCardInlineProps) => {
  const openReceipt = () => {
    if (receipt.full_url) {
      window.open(receipt.full_url, "_blank");
    }
  };

  return (
    <div className="bg-blue-50 rounded-md p-3 mb-2">
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <Receipt className="h-4 w-4 text-finsight-blue" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm text-blue-700 truncate max-w-[200px]">
              {receipt.file_name}
            </h4>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2 text-xs"
              onClick={openReceipt}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Transaction ID: {receipt.transaction_id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptCardInline;
