
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReceiptUploader from "./ReceiptUploader";
import ReceiptGallery from "./ReceiptGallery";
import ReceiptScanner from "./ReceiptScanner";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ReceiptManagerProps {
  transactionId?: string;
  showTitle?: boolean;
  onAddTransaction?: (data: any) => void;
}

const ReceiptManager = ({ 
  transactionId = "default", 
  showTitle = true,
  onAddTransaction 
}: ReceiptManagerProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("view");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleUploadComplete = (success: boolean) => {
    if (success) {
      setRefreshTrigger(prev => prev + 1);
      setActiveTab("view");
    }
  };

  const handleScanComplete = (data: any) => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("view");
    if (onAddTransaction) {
      onAddTransaction(data);
    }
  };

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader>
          <CardTitle className="text-xl">Receipt Management</CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="view">View Receipts</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            {isMobile && <TabsTrigger value="scan">Scan</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="view" className="mt-0">
            <ReceiptGallery 
              transactionId={transactionId} 
              refreshTrigger={refreshTrigger} 
            />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-0">
            <ReceiptUploader 
              transactionId={transactionId}
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>
          
          {isMobile && (
            <TabsContent value="scan" className="mt-0">
              <ReceiptScanner 
                onScanComplete={handleScanComplete}
                onClose={() => setActiveTab("view")}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReceiptManager;
