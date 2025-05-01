
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI financial assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // In a real app, you would call an AI API here
      // Simulate API call with timeout
      setTimeout(() => {
        const botResponses: { [key: string]: string } = {
          "budget": "I can help you create a budget. Let's start by analyzing your income and expenses.",
          "invest": "For investment advice, I recommend diversifying your portfolio across stocks, bonds, and ETFs.",
          "save": "To improve your savings, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
          "debt": "To tackle debt, focus on high-interest debts first while making minimum payments on others.",
        };
        
        // Generate a response based on keywords or use a default
        const lowerInput = inputMessage.toLowerCase();
        let botContent = "I'm not sure how to help with that specific topic yet. Could you try asking about budgeting, investing, saving, or debt management?";
        
        // Check if message contains any keywords
        for (const [keyword, response] of Object.entries(botResponses)) {
          if (lowerInput.includes(keyword)) {
            botContent = response;
            break;
          }
        }

        const botMessage: Message = {
          id: Date.now().toString(),
          content: botContent,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get response. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-finsight-purple" />
          FinSight AI Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start max-w-[80%] ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                } gap-2`}
              >
                {msg.sender === "bot" ? (
                  <Avatar className="h-8 w-8 bg-finsight-purple">
                    <AvatarFallback>AI</AvatarFallback>
                    <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8">
                    {user?.avatar ? (
                      <AvatarImage 
                        src={user.avatar} 
                        alt={user?.name || "User"} 
                        style={{ 
                          transform: user?.avatarSettings ? `scale(${user.avatarSettings.zoom / 100})` : undefined,
                          marginLeft: user?.avatarSettings ? `${user.avatarSettings.position.x * 0.25}px` : undefined,
                          marginTop: user?.avatarSettings ? `${user.avatarSettings.position.y * 0.25}px` : undefined,
                        }}
                      />
                    ) : null}
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`py-2 px-4 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-finsight-purple text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 py-2 px-4 rounded-lg bg-gray-100">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-end gap-2">
          <Textarea
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[60px] resize-none"
            maxLength={500}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            className="h-10"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardFooter>
    </div>
  );
};

export default ChatBot;
