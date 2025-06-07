
import React, { useState, useEffect, useRef } from "react";
import { getRandomTip } from "@/utils/financialTips";
import { LightbulbIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PixarAvatar from "../avatars/PixarAvatar";
import { useAvatar } from "@/contexts/AvatarContext";
import { useSpeech } from "@/hooks/useSpeech";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingAssistant: React.FC = () => {
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const { avatarState, characterId, setAvatarState, speakMessage, stopSpeaking } = useAvatar();
  const { isThisElementSpeaking, handleSpeak } = useSpeech(currentTip);
  const isMobile = useIsMobile();
  const dragStart = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  
  // Introduce random expressions periodically when idle
  useEffect(() => {
    if (avatarState === "idle" && !showTip) {
      const expressionInterval = setInterval(() => {
        // 10% chance to show a random expression when idle
        if (Math.random() < 0.1) {
          const expressions = ["happy", "confused", "idle"] as const;
          const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
          
          setAvatarState(randomExpression);
          
          // Return to idle after a brief period
          setTimeout(() => {
            setAvatarState("idle");
          }, 2000);
        }
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(expressionInterval);
    }
  }, [avatarState, showTip, setAvatarState]);
  
  // Show tips periodically
  useEffect(() => {
    // Don't show tips while the AI is actively responding
    if (avatarState === "thinking" || avatarState === "speaking") {
      setShowTip(false);
      return;
    }
    
    // Set up interval to show tips
    const tipInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance to show a tip
        const tip = getRandomTip();
        setCurrentTip(tip);
        setShowTip(true);
        setAvatarState("tip");
        
        // Read the tip aloud
        speakMessage(tip);
        
        // Hide tip after 8 seconds
        setTimeout(() => {
          setShowTip(false);
          setAvatarState("idle");
        }, 8000);
      }
    }, 45000); // Check every 45 seconds
    
    return () => clearInterval(tipInterval);
  }, [avatarState, setAvatarState, speakMessage]);
  
  const handleClick = () => {
    // When clicked, show a new tip or hide current tip
    if (showTip) {
      setShowTip(false);
      setAvatarState("idle");
      stopSpeaking();
    } else {
      const tip = getRandomTip();
      setCurrentTip(tip);
      setShowTip(true);
      setAvatarState("tip");
      speakMessage(tip);
      
      // Hide tip after 8 seconds
      setTimeout(() => {
        setShowTip(false);
        setAvatarState("idle");
      }, 8000);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = () => {
    setDragging(false);
  };
  
  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
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
            <p className="text-sm">FinSight AI Assistant - {characterId.charAt(0).toUpperCase() + characterId.slice(1)}</p>
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
