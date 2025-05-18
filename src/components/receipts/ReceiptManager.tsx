
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReceiptUploader from "./ReceiptUploader";
import ReceiptGallery from "./ReceiptGallery";

interface ReceiptManagerProps {
  transactionId?: string;
  showTitle?: boolean;
}

const ReceiptManager = ({ 
  transactionId = "default", 
  showTitle = true 
}: ReceiptManagerProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("view");

  const handleUploadComplete = (success: boolean) => {
    if (success) {
      setRefreshTrigger(prev => prev + 1);
      setActiveTab("view");
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
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="view">View Receipts</TabsTrigger>
            <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReceiptManager;
