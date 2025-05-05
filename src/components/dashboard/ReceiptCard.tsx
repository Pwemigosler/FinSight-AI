
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowUpRight, Receipt, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRecentReceipts } from "@/services/receiptService";
import { ReceiptInfo } from "@/types/chat";

const ReceiptCard = () => {
  const [recentReceipts, setRecentReceipts] = useState<ReceiptInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const receipts = await getRecentReceipts(3);
        setRecentReceipts(receipts);
      } catch (error) {
        console.error("Error fetching recent receipts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const navigateToReceipts = () => {
    navigate("/chat", { state: { activeTab: "receipts" } });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-ptcustom-blue" />
            Recent Receipts
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-ptcustom-blue"
            onClick={navigateToReceipts}
          >
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-ptcustom-blue" />
          </div>
        ) : recentReceipts.length > 0 ? (
          <div className="space-y-3">
            {recentReceipts.map((receipt) => (
              <div 
                key={receipt.id} 
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                onClick={navigateToReceipts}
              >
                {receipt.file_type?.includes('pdf') ? (
                  <div className="bg-gray-100 h-10 w-10 rounded flex items-center justify-center">
                    <FileText className="h-5 w-5 text-ptcustom-blue" />
                  </div>
                ) : receipt.full_url ? (
                  <img 
                    src={receipt.full_url} 
                    alt={receipt.file_name} 
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <div className="bg-gray-100 h-10 w-10 rounded flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-ptcustom-blue" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{receipt.file_name}</p>
                  <p className="text-xs text-gray-500">
                    Transaction: {receipt.transaction_id}
                  </p>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-2 text-ptcustom-blue border-ptcustom-blue/30"
              onClick={navigateToReceipts}
            >
              View All Receipts
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm font-medium text-gray-900">No receipts yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Upload your first receipt to keep track of your expenses.
            </p>
            <Button 
              className="mt-3 bg-ptcustom-blue hover:bg-ptcustom-blue-dark" 
              size="sm"
              onClick={navigateToReceipts}
            >
              Upload Receipt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReceiptCard;
