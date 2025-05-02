
import React, { useState, useEffect } from "react";
import AnimatedAvatar from "./AnimatedAvatar";
import { getRandomTip } from "@/utils/financialTips";

interface FloatingAssistantProps {
  chatState: "idle" | "speaking" | "thinking";
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ chatState }) => {
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  
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
        
        // Hide tip after 8 seconds
        setTimeout(() => {
          setShowTip(false);
        }, 8000);
      }
    }, 45000); // Check every 45 seconds
    
    return () => clearInterval(tipInterval);
  }, [chatState]);
  
  const handleClick = () => {
    // When clicked, show a new tip or hide current tip
    if (showTip) {
      setShowTip(false);
    } else {
      setCurrentTip(getRandomTip());
      setShowTip(true);
      
      // Hide tip after 8 seconds
      setTimeout(() => {
        setShowTip(false);
      }, 8000);
    }
  };
  
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      onClick={handleClick}
    >
      <AnimatedAvatar 
        state={chatState} 
        showTip={showTip}
        tip={currentTip}
        className="hover:scale-110 transition-transform"
      />
    </div>
  );
};

export default FloatingAssistant;
