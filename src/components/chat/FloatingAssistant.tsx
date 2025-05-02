
import React, { useState, useEffect, useCallback } from "react";
import { getRandomTip } from "@/utils/financialTips";
import { useAuth } from "@/contexts/AuthContext";
import { LightbulbIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PixarAvatar, { AvatarState } from "../avatars/PixarAvatar";

interface FloatingAssistantProps {
  chatState: "idle" | "speaking" | "thinking";
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ chatState }) => {
  const { user } = useAuth();
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const characterId = user?.preferences?.assistantCharacter || "finn";
  
  // Update avatar state based on chat state and tips
  useEffect(() => {
    if (showTip) {
      setAvatarState("tip");
    } else if (chatState === "thinking") {
      setAvatarState("thinking");
    } else if (chatState === "speaking") {
      setAvatarState("speaking");
    } else {
      setAvatarState("idle");
    }
  }, [chatState, showTip]);
  
  // Show tips periodically
  useEffect(() => {
    // Don't show tips while the AI is actively responding
    if (chatState === "thinking" || chatState === "speaking") {
      setShowTip(false);
      return;
    }
    
    // Set up interval to show tips
    const tipInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance to show a tip
        setCurrentTip(getRandomTip());
        setShowTip(true);
        setAvatarState("tip");
        
        // Hide tip after 8 seconds
        setTimeout(() => {
          setShowTip(false);
          setAvatarState("idle");
        }, 8000);
      }
    }, 45000); // Check every 45 seconds
    
    return () => clearInterval(tipInterval);
  }, [chatState]);
  
  const handleClick = useCallback(() => {
    // When clicked, show a new tip or hide current tip
    if (showTip) {
      setShowTip(false);
      setAvatarState("idle");
    } else {
      setCurrentTip(getRandomTip());
      setShowTip(true);
      setAvatarState("tip");
      
      // Hide tip after 8 seconds
      setTimeout(() => {
        setShowTip(false);
        setAvatarState("idle");
      }, 8000);
    }
  }, [showTip]);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="cursor-pointer hover:scale-110 transition-transform"
              onClick={handleClick}
            >
              <PixarAvatar 
                state={avatarState} 
                characterId={characterId}
                size="lg"
                className="shadow-lg"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-sm">FinSight AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Financial tip bubble */}
      {showTip && currentTip && (
        <div className="absolute -top-2 right-full mr-2 bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-[250px] animate-fade-in">
          <div className="flex items-start gap-2">
            <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Financial Tip</p>
              <p className="text-xs text-gray-600">{currentTip}</p>
            </div>
          </div>
          <div className="absolute right-[-6px] top-5 rotate-45 h-3 w-3 bg-white border-r border-t border-gray-200"></div>
        </div>
      )}
    </div>
  );
};

export default FloatingAssistant;
