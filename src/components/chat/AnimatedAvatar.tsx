
import React, { useState, useEffect } from "react";
import { Bot, MessageCircle, Sparkles, LightbulbIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AnimatedAvatarProps {
  state: "idle" | "speaking" | "thinking";
  showTip?: boolean;
  tip?: string;
  className?: string;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  state = "idle", 
  showTip = false, 
  tip = "", 
  className = "" 
}) => {
  const [animate, setAnimate] = useState(false);
  const [tipVisible, setTipVisible] = useState(showTip);
  
  // Trigger animation effect when state changes
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [state]);
  
  // Show tip with delay if provided
  useEffect(() => {
    setTipVisible(showTip);
  }, [showTip]);

  // Get animation classes based on state
  const getAnimationClass = () => {
    switch (state) {
      case "speaking":
        return "animate-bounce";
      case "thinking":
        return "animate-pulse";
      default:
        return animate ? "animate-scale-in" : "";
    }
  };

  // Get background color based on state
  const getBackgroundColor = () => {
    switch (state) {
      case "speaking":
        return "bg-finsight-purple";
      case "thinking":
        return "bg-finsight-blue";
      default:
        return "bg-finsight-purple bg-opacity-90";
    }
  };

  // Get icon based on state
  const getIcon = () => {
    switch (state) {
      case "speaking":
        return <MessageCircle className="h-6 w-6 text-white" />;
      case "thinking":
        return <Sparkles className="h-6 w-6 text-white" />;
      default:
        return <Bot className="h-6 w-6 text-white" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`rounded-full p-3 cursor-pointer transition-all duration-300 shadow-lg ${getBackgroundColor()} ${getAnimationClass()}`}
            >
              {getIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm">FinSight AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Financial tip bubble */}
      {tipVisible && tip && (
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
