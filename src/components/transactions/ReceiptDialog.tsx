
import { useState } from 'react';
import { TransactionItemType } from '@/hooks/transactions/types';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ReceiptGallery from '../receipts/ReceiptGallery';
import ReceiptUploader from '../receipts/ReceiptUploader';
import MobileReceiptScanner from '../receipts/MobileReceiptScanner';
import { useCallback } from 'react';

type ReceiptDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionItemType | null;
};

const ReceiptDialog = ({ isOpen, onOpenChange, transaction }: ReceiptDialogProps) => {
  const [receiptRefreshTrigger, setReceiptRefreshTrigger] = useState(0);
  const [isMobile, setIsMobile] = useState(() => {
    // Simple mobile detection
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const handleReceiptUploadComplete = useCallback((success: boolean) => {
    if (success) {
      // Increment to trigger a refresh of ReceiptGallery
      setReceiptRefreshTrigger(prev => prev + 1);
    }
  }, []);

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Transaction Receipts</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`${transaction.iconBg} p-1.5 rounded-full`}>
                  <div className={transaction.iconColor}>
                    {transaction.icon}
                  </div>
                </div>
                <span className="font-medium">{transaction.name}</span>
              </div>
              <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : ''}`}>
                {formatAmount(transaction.amount)}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 flex justify-between">
              <div>{formatDate(transaction.date)}</div>
              <Badge variant="outline" className="text-xs font-normal">
                {transaction.category}
              </Badge>
            </div>
          </div>
          
          <Tabs defaultValue="gallery">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="gallery">Receipts</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              {isMobile && <TabsTrigger value="scan">Scan</TabsTrigger>}
            </TabsList>
            <TabsContent value="gallery">
              <ReceiptGallery 
                transactionId={transaction.id} 
                refreshTrigger={receiptRefreshTrigger}
              />
            </TabsContent>
            <TabsContent value="upload">
              <ReceiptUploader 
                transactionId={transaction.id}
                onUploadComplete={handleReceiptUploadComplete}
              />
            </TabsContent>
            {isMobile && (
              <TabsContent value="scan">
                <MobileReceiptScanner
                  transactionId={transaction.id}
                  onUploadComplete={handleReceiptUploadComplete}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
