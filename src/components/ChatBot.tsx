import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, Bot, CreditCard, PiggyBank, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  allocateFunds, 
  transferFunds, 
  getBudgetCategories,
  BudgetCategory
} from "@/services/fundAllocationService";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  action?: {
    type: string;
    status: "success" | "error";
    details?: any;
  };
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI financial assistant. I can help you manage your finances and allocate funds to different categories. Try asking me to allocate money to bills, savings, or spending.",
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

  const processActionRequest = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for allocation requests
    const allocateMatch = lowerMessage.match(/allocate\s+\$?(\d+(?:\.\d+)?)\s+(?:to|for|towards)\s+(\w+)/i);
    if (allocateMatch) {
      const amount = parseFloat(allocateMatch[1]);
      const category = allocateMatch[2];
      
      const result = allocateFunds(category, amount);
      return {
        action: {
          type: "allocation",
          status: result.success ? "success" as const : "error" as const,
          details: result
        },
        response: result.message
      };
    }
    
    // Check for transfer requests
    const transferMatch = lowerMessage.match(/transfer\s+\$?(\d+(?:\.\d+)?)\s+from\s+(\w+)\s+to\s+(\w+)/i);
    if (transferMatch) {
      const amount = parseFloat(transferMatch[1]);
      const fromCategory = transferMatch[2];
      const toCategory = transferMatch[3];
      
      const result = transferFunds(fromCategory, toCategory, amount);
      return {
        action: {
          type: "transfer",
          status: result.success ? "success" as const : "error" as const,
          details: result
        },
        response: result.message
      };
    }
    
    // Check for viewing budget request
    if (lowerMessage.includes("show") && (lowerMessage.includes("budget") || lowerMessage.includes("category") || lowerMessage.includes("funds"))) {
      const categories = getBudgetCategories();
      const categoryList = categories.map(cat => `${cat.name}: $${cat.allocated} (spent: $${cat.spent})`).join("\n");
      
      return {
        action: {
          type: "view",
          status: "success" as const,
          details: { categories }
        },
        response: `Here are your current budget categories:\n\n${categoryList}`
      };
    }
    
    // No action detected
    return null;
  };

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
      // Check if message is an action request
      const actionResult = processActionRequest(inputMessage);
      
      if (actionResult) {
        // This is a fund allocation or other action request
        setTimeout(() => {
          const botMessage: Message = {
            id: Date.now().toString(),
            content: actionResult.response,
            sender: "bot",
            timestamp: new Date(),
            action: actionResult.action
          };
          
          setMessages((prev) => [...prev, botMessage]);
          setIsLoading(false);
          
          // Show toast for successful actions
          if (actionResult.action.status === "success") {
            toast.success("Action completed", {
              description: actionResult.response,
            });
          } else {
            toast.error("Action failed", {
              description: actionResult.response,
            });
          }
        }, 1000);
      } else {
        // Regular conversation - use existing response logic
        setTimeout(() => {
          const botResponses: { [key: string]: string } = {
            "budget": "I can help you manage your budget. You can ask me to allocate funds to different categories like 'Allocate $500 to bills' or 'Transfer $200 from entertainment to savings'.",
            "invest": "For investment advice, I recommend diversifying your portfolio. Would you like me to allocate some funds to your investment category?",
            "save": "To improve your savings, try allocating more funds there. Try saying 'Allocate $300 to savings' or 'Transfer $100 from entertainment to savings'.",
            "debt": "To tackle debt, allocate more funds to paying it off. Try saying 'Allocate $400 to bills' to set aside money for debt payments.",
          };
          
          // Generate a response based on keywords or use a default
          const lowerInput = inputMessage.toLowerCase();
          let botContent = "I can help you allocate your funds to different categories. Try saying 'Allocate $500 to bills', 'Transfer $200 from entertainment to savings', or 'Show my budget categories'.";
          
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
      }
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

  const getActionIcon = (action?: Message["action"]) => {
    if (!action) return null;
    
    switch (action.type) {
      case "allocation":
        return <Wallet className="h-5 w-5 text-finsight-green" />;
      case "transfer":
        return <CreditCard className="h-5 w-5 text-finsight-purple" />;
      case "view":
        return <PiggyBank className="h-5 w-5 text-finsight-blue" />;
      default:
        return null;
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
                  {msg.action && msg.action.status === "success" && (
                    <div className="flex items-center gap-2 mb-2 py-1 px-2 bg-green-100 text-green-800 rounded-md text-sm">
                      {getActionIcon(msg.action)}
                      <span>Action completed</span>
                    </div>
                  )}
                  {msg.action && msg.action.status === "error" && (
                    <div className="flex items-center gap-2 mb-2 py-1 px-2 bg-red-100 text-red-800 rounded-md text-sm">
                      {getActionIcon(msg.action)}
                      <span>Action failed</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line break-words">{msg.content}</div>
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
