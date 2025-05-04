
import { useState, useEffect } from "react";
import { Message, FinancialInsight, ReceiptInfo } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@/types/user";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "../ui/button";
import PixarAvatar from "../avatars/PixarAvatar";
import { useAvatar } from "@/contexts/AvatarContext";
import FinancialInsightCard from "./insights/FinancialInsightCard";
import ReceiptCardInline from "./receipts/ReceiptCardInline";
import ActionStatusBadge from "./actions/ActionStatusBadge";

interface MessageBubbleProps {
  message: Message;
  user: User | null;
}

const MessageBubble = ({ message, user }: MessageBubbleProps) => {
  const { avatarState, speakMessage, stopSpeaking, isSpeaking, characterId } = useAvatar();
  const [isThisBubbleSpeaking, setIsThisBubbleSpeaking] = useState(false);
  
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
    return isThisBubbleSpeaking ? "speaking" : "idle";
  };

  // Handle text-to-speech for this message
  const handleSpeak = () => {
    if (isThisBubbleSpeaking) {
      stopSpeaking();
      setIsThisBubbleSpeaking(false);
    } else {
      speakMessage(message.content);
      setIsThisBubbleSpeaking(true);
    }
  };

  // Reset speaking state when global speaking state changes
  useEffect(() => {
    if (!isSpeaking && isThisBubbleSpeaking) {
      setIsThisBubbleSpeaking(false);
    }
  }, [isSpeaking, isThisBubbleSpeaking]);

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
              characterId={characterId}
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
          {message.action && <ActionStatusBadge action={message.action} />}
          
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
                <ReceiptCardInline key={`${receipt.id}-${index}`} receipt={receipt} />
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            
            {/* Text-to-speech button only for bot messages */}
            {message.sender === "bot" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSpeak}
                className="h-6 w-6 rounded-full p-0"
              >
                {isThisBubbleSpeaking ? 
                  <VolumeX className="h-3 w-3 text-finsight-purple" /> : 
                  <Volume2 className="h-3 w-3 text-finsight-purple" />
                }
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
