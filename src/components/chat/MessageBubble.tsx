import { Message, FinancialInsight, ReceiptInfo } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@/types/user";
import { Wallet, CreditCard, PiggyBank, LineChart, TrendingUp, TrendingDown, AlertCircle, Receipt, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import PixarAvatar from "../avatars/PixarAvatar";

interface MessageBubbleProps {
  message: Message;
  user: User | null;
}

export const getActionIcon = (action?: Message["action"]) => {
  if (!action) return null;
  
  switch (action.type) {
    case "allocation":
      return <Wallet className="h-5 w-5 text-finsight-green" />;
    case "transfer":
      return <CreditCard className="h-5 w-5 text-finsight-purple" />;
    case "view":
      return <PiggyBank className="h-5 w-5 text-finsight-blue" />;
    case "analysis":
      return <LineChart className="h-5 w-5 text-finsight-blue" />;
    case "receipts_view":
      return <Receipt className="h-5 w-5 text-finsight-green" />;
    default:
      return null;
  }
};

const getInsightIcon = (type: string, impact?: string) => {
  switch (type) {
    case "saving":
      return <PiggyBank className="h-4 w-4 text-finsight-green" />;
    case "spending":
      return impact === "negative" 
        ? <TrendingUp className="h-4 w-4 text-finsight-red" />
        : <TrendingDown className="h-4 w-4 text-finsight-green" />;
    case "budget":
      return <Wallet className="h-4 w-4 text-finsight-blue" />;
    case "suggestion":
      return <AlertCircle className="h-4 w-4 text-finsight-purple" />;
    default:
      return <LineChart className="h-4 w-4 text-finsight-blue" />;
  }
};

const FinancialInsightCard = ({ insight }: { insight: FinancialInsight }) => {
  const getBgColor = () => {
    switch (insight.impact) {
      case "positive": return "bg-green-50";
      case "negative": return "bg-red-50";
      case "neutral": return "bg-blue-50";
      default: return "bg-gray-50";
    }
  };

  const getTextColor = () => {
    switch (insight.impact) {
      case "positive": return "text-green-700";
      case "negative": return "text-red-700";
      case "neutral": return "text-blue-700";
      default: return "text-gray-700";
    }
  };

  return (
    <div className={`${getBgColor()} rounded-md p-3 mb-2`}>
      <div className="flex items-start gap-2">
        <div className="mt-1">{getInsightIcon(insight.type, insight.impact)}</div>
        <div>
          <h4 className={`font-medium text-sm ${getTextColor()}`}>{insight.title}</h4>
          <p className="text-sm">{insight.description}</p>
          {insight.category && (
            <span className="text-xs text-gray-500">Category: {insight.category}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ReceiptCard = ({ receipt }: { receipt: ReceiptInfo }) => {
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

const MessageBubble = ({ message, user }: MessageBubbleProps) => {
  // Get insights from message action details if they exist
  const insights = message.action?.type === "analysis" && 
                  message.action.details?.insights ? 
                  message.action.details.insights as FinancialInsight[] : 
                  [];
                  
  // Get receipts from message if they exist
  const receipts = message.receipts || [];

  // Get avatar state for AI messages
  const getAvatarStateFromMessage = (): "idle" | "speaking" | "happy" | "confused" => {
    if (message.action?.status === "error") return "confused";
    if (message.action?.status === "success") return "happy";
    return "speaking";
  };

  // Get character ID with normalization
  const getCharacterId = (): string => {
    const preferredCharacter = user?.preferences?.assistantCharacter || "fin";
    // Make sure we're using a valid ID (fin rather than finn)
    return preferredCharacter === "finn" ? "fin" : preferredCharacter;
  };

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-start max-w-[80%] ${
          message.sender === "user" ? "flex-row-reverse" : "flex-row"
        } gap-2`}
      >
        {message.sender === "bot" ? (
          <div className="h-8 w-8 flex items-center justify-center">
            <PixarAvatar 
              state={getAvatarStateFromMessage()} 
              characterId={getCharacterId()}
              size="sm"
            />
          </div>
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
            message.sender === "user"
              ? "bg-finsight-purple text-white rounded-tr-none"
              : "bg-gray-100 text-gray-800 rounded-tl-none"
          }`}
        >
          {message.action && message.action.status === "success" && (
            <div className="flex items-center gap-2 mb-2 py-1 px-2 bg-green-100 text-green-800 rounded-md text-sm">
              {getActionIcon(message.action)}
              <span>Action completed</span>
            </div>
          )}
          {message.action && message.action.status === "error" && (
            <div className="flex items-center gap-2 mb-2 py-1 px-2 bg-red-100 text-red-800 rounded-md text-sm">
              {getActionIcon(message.action)}
              <span>Action failed</span>
            </div>
          )}
          <div className="whitespace-pre-line break-words">{message.content}</div>
          
          {/* Render financial insights if they exist */}
          {insights.length > 0 && (
            <div className="mt-3 space-y-2">
              {insights.map((insight, index) => (
                <FinancialInsightCard key={index} insight={insight} />
              ))}
            </div>
          )}
          
          {/* Render receipt cards if they exist */}
          {receipts.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium">Receipts:</h4>
              {receipts.map((receipt, index) => (
                <ReceiptCard key={`${receipt.id}-${index}`} receipt={receipt} />
              ))}
            </div>
          )}
          
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
