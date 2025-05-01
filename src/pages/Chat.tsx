
import { useState } from "react";
import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/contexts/AuthContext";

const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">AI Chat Assistant</h1>
        <p className="text-gray-600 mb-6">
          Chat with our AI assistant to get personalized financial advice and insights.
        </p>
        
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <ChatBot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
