import React, { useState, useEffect } from "react";
import { LightbulbIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import PixarAvatar from "../avatars/PixarAvatar";
import { AvatarState } from "../avatars/types/avatar-types";

interface AnimatedAvatarProps {
  state: "idle" | "speaking" | "thinking";
  showTip?: boolean;
  tip?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  state = "idle", 
  showTip = false, 
  tip = "", 
  className = "",
  size = "md"
}) => {
  const { user } = useAuth();
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const characterId = user?.preferences?.assistantCharacter || "fin";
  
  // Update avatar state based on chat state and tips
  useEffect(() => {
    if (showTip) {
      setAvatarState("tip");
    } else if (state === "thinking") {
      setAvatarState("thinking");
    } else if (state === "speaking") {
      setAvatarState("speaking");
    } else {
      setAvatarState("idle");
    }
  }, [state, showTip]);

  return (
    <div className={`relative ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <PixarAvatar 
                state={avatarState} 
                characterId={characterId}
                size={size}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm">FinSight AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Financial tip bubble */}
      {showTip && tip && (
        <div className="absolute -top-2 right-full mr-2 bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-[250px] animate-fade-in">
          <div className="flex items-start gap-2">
            <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Financial Tip</p>
              <p className="text-xs text-gray-600">{tip}</p>
            </div>
          </div>
          <div className="absolute right-[-6px] top-5 rotate-45 h-3 w-3 bg-white border-r border-t border-gray-200"></div>
        </div>
      )}
    </div>
  );
};

export default AnimatedAvatar;
