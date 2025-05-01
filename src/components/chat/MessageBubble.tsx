
import { Message } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@/types/user";
import { Wallet, CreditCard, PiggyBank } from "lucide-react";

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
    default:
      return null;
  }
};

const MessageBubble = ({ message, user }: MessageBubbleProps) => {
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
