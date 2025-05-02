
import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useChatMessages } from "@/hooks/useChatMessages";
import MessageBubble from "./chat/MessageBubble";
import TypingIndicator from "./chat/TypingIndicator";
import ChatInput from "./chat/ChatInput";
import FloatingAssistant from "./chat/FloatingAssistant";

const ChatBot = () => {
  const { messages, inputMessage, setInputMessage, isLoading, handleSendMessage } = useChatMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [avatarState, setAvatarState] = useState<"idle" | "speaking" | "thinking">("idle");
  const characterId = user?.preferences?.assistantCharacter || "fin";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update avatar state based on chat activity
  useEffect(() => {
    if (isLoading) {
      setAvatarState("thinking");
    } else {
      // Check if the last message is from the bot and was sent in the last 2 seconds
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender === "bot" && 
          Date.now() - lastMessage.timestamp.getTime() < 2000) {
        setAvatarState("speaking");
        
        // Return to idle after speaking animation completes
        const timeout = setTimeout(() => {
          setAvatarState("idle");
        }, 2000);
        
        return () => clearTimeout(timeout);
      } else {
        setAvatarState("idle");
      }
    }
  }, [isLoading, messages]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-finsight-purple flex items-center justify-center">
            {/* Avatar in title bar */}
            <img 
              src={`/characters/${characterId}.png`}
              alt="AI Assistant" 
              className="h-full w-full object-cover"
              onError={(e) => {
                console.error(`Failed to load header avatar image: ${characterId}`);
                e.currentTarget.src = `https://placehold.co/200x200/9333EA/FFFFFF/?text=${characterId}`;
              }}
            />
          </div>
          FinSight AI Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} user={user} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <ChatInput 
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </CardFooter>

      {/* Floating Assistant Avatar */}
      <FloatingAssistant chatState={avatarState} />
    </div>
  );
};

export default ChatBot;
