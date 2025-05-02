
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type AvatarState = "idle" | "speaking" | "thinking" | "happy" | "confused" | "tip";

interface PixarAvatarProps {
  state: AvatarState;
  characterId?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
}

const PixarAvatar: React.FC<PixarAvatarProps> = ({
  state = "idle",
  characterId = "fin",
  className = "",
  size = "md",
  onClick
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get placeholder URL based on state
  const getPlaceholderUrl = () => {
    const stateColors: Record<AvatarState, string> = {
      idle: "33A9F0",
      speaking: "33C3F0",
      thinking: "10B981",
      happy: "F97316",
      confused: "8B5CF6", 
      tip: "F59E0B"
    };
    
    // For Fin character, always use the actual image
    if (characterId === "fin") {
      return "/characters/fin.png";
    }
    
    // Return placeholder with character name and state for non-Fin characters
    return `https://placehold.co/200x200/${stateColors[state]}/FFFFFF/?text=${characterId}-${state}`;
  };

  // Get frame URL - in production, this would use actual character sprite frames
  const getFrameUrl = (frameNumber: number) => {
    // For Fin character, always use the actual image regardless of frame
    if (characterId === "fin") {
      return "/characters/fin.png";
    }
    
    // Try to load the real image first for other characters
    const realImagePath = `/characters/${characterId}/${state}/${frameNumber}.png`;
    
    // Fallback to character thumbnail if animation frames aren't available
    const fallbackPath = `/characters/${characterId}.png`;
    
    // In development mode, or if we've had an error, use placeholders
    if (process.env.NODE_ENV === "development" || imageError) {
      return getPlaceholderUrl();
    }
    
    return realImagePath;
  };
  
  // Animation configuration based on state
  const getAnimationConfig = () => {
    switch (state) {
      case "speaking":
        return { frameCount: 4, fps: 8 };
      case "thinking": 
        return { frameCount: 6, fps: 4 };
      case "happy":
        return { frameCount: 3, fps: 6 };
      case "confused":
        return { frameCount: 3, fps: 3 };
      case "tip":
        return { frameCount: 5, fps: 5 };
      case "idle":
      default:
        return { frameCount: 2, fps: 2 }; // Subtle blinking animation
    }
  };
  
  // Animate the avatar based on its state
  useEffect(() => {
    const { frameCount, fps } = getAnimationConfig();
    
    // Reset current frame when state changes
    setCurrentFrame(0);
    setIsLoaded(false);
    
    // Handle animation frames
    const animate = () => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % frameCount);
    };
    
    // Set up animation interval
    const intervalId = setInterval(animate, 1000 / fps);
    
    return () => {
      clearInterval(intervalId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, characterId]);

  // Size classes for the avatar
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  // Get background glow based on state
  const getStateGlowClass = () => {
    switch (state) {
      case "speaking":
        return "shadow-[0_0_15px_rgba(51,195,240,0.6)]";
      case "thinking":
        return "shadow-[0_0_15px_rgba(16,185,129,0.6)]";
      case "happy":
        return "shadow-[0_0_15px_rgba(249,115,22,0.6)]";
      case "confused":
        return "shadow-[0_0_15px_rgba(139,92,246,0.6)]";
      case "tip":
        return "shadow-[0_0_15px_rgba(245,158,11,0.6)]";
      case "idle":
      default:
        return "shadow-[0_0_15px_rgba(51,169,240,0.3)]";
    }
  };

  // Add animation classes based on state
  const getStateAnimationClass = () => {
    switch (state) {
      case "speaking":
        return "animate-bounce";
      case "thinking":
        return "animate-pulse";
      case "happy":
        return "animate-float";
      case "confused":
        return "animate-scale-in";
      case "tip":
        return "animate-spin-slow";
      case "idle":
      default:
        return "hover:scale-105 transition-transform";
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  const handleImageError = () => {
    // If the frame image fails to load, we'll set the error flag
    // and the component will use placeholder images instead
    setImageError(true);
    setIsLoaded(true); // Still mark as loaded so we show something
  };

  return (
    <div 
      className={cn(
        "rounded-full overflow-hidden cursor-pointer transition-all duration-300 relative",
        sizeClasses[size],
        getStateGlowClass(),
        getStateAnimationClass(),
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      onClick={onClick}
    >
      <img
        src={getFrameUrl(currentFrame)}
        alt={`${characterId} avatar in ${state} state`}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* Animated dot for "thinking" state */}
      {state === "thinking" && (
        <div className="absolute bottom-1 right-1">
          <div className="flex space-x-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce animate-delay-100"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce animate-delay-200"></span>
          </div>
        </div>
      )}
      
      {/* Wave animation for the happy state */}
      {state === "happy" && (
        <div className="absolute top-0 right-0 animate-pulse">
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-70"></div>
        </div>
      )}
    </div>
  );
};

export default PixarAvatar;
