
import React from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ChatButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={() => navigate('/chat')}
    >
      <Bot className="h-5 w-5" />
    </Button>
  );
};

export default ChatButton;
