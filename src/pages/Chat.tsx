
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, PiggyBank, CreditCard, LineChart, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReceiptManager from "@/components/receipts/ReceiptManager";

const Chat = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const { user } = useAuth();

  // Handle activeTab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 p-4 flex flex-col max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">AI Financial Assistant</h1>
        <p className="text-gray-600 mb-6">
          Chat with our AI assistant to get personalized financial advice, insights, and help managing your finances.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-finsight-blue bg-opacity-20 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-finsight-blue" />
              </div>
              <div>
                <p className="text-sm font-medium">Allocate Funds</p>
                <p className="text-xs text-gray-500">"Allocate $500 to bills"</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-finsight-purple bg-opacity-20 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-finsight-purple" />
              </div>
              <div>
                <p className="text-sm font-medium">Transfer Money</p>
                <p className="text-xs text-gray-500">"Transfer $200 from entertainment to savings"</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-finsight-green bg-opacity-20 p-2 rounded-full">
                <PiggyBank className="h-5 w-5 text-finsight-green" />
              </div>
              <div>
                <p className="text-sm font-medium">View Categories</p>
                <p className="text-xs text-gray-500">"Show my budget categories"</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm cursor-pointer" onClick={() => setActiveTab("receipts")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-finsight-blue bg-opacity-20 p-2 rounded-full">
                <Receipt className="h-5 w-5 text-finsight-blue" />
              </div>
              <div>
                <p className="text-sm font-medium">Manage Receipts</p>
                <p className="text-xs text-gray-500">"View my receipts"</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
            <TabsTrigger value="receipts">Receipt Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1">
            <ChatBot />
          </TabsContent>
          
          <TabsContent value="receipts" className="flex-1">
            <ReceiptManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Chat;
