import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { PixarAvatarProps } from "./types/avatar-types";
import { 
  getCharacterImageUrl, 
  getAnimationConfig, 
  sizeClasses, 
  getStateGlowClass, 
  getStateAnimationClass 
} from "./utils/avatar-utils";
import AvatarStateEffects from "./parts/AvatarStateEffects";

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
  const [retryCount, setRetryCount] = useState(0);
  const [uniqueId] = useState(`avatar-${Math.random().toString(36).substring(2, 9)}`);
  
  // Animate the avatar based on its state
  useEffect(() => {
    const { frameCount, fps } = getAnimationConfig(state);
    
    // Reset current frame when state changes
    setCurrentFrame(0);
    
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

  const handleImageLoad = () => {
    console.log(`Successfully loaded image for character: ${characterId}`);
    setIsLoaded(true);
    setImageError(false);
    setRetryCount(0);
  };
  
  const handleImageError = () => {
    console.error(`Failed to load character image: ${characterId} (attempt ${retryCount + 1})`);
    
    // Retry loading the image a few times before showing error state
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      // Try again after a short delay with a cache-busting parameter
      setTimeout(() => {
        const img = new Image();
        const imageUrl = getCharacterImageUrl(characterId, false) + `?t=${Date.now()}`;
        img.src = imageUrl;
        img.onload = handleImageLoad;
        img.onerror = () => {
          setImageError(true);
          setIsLoaded(true); // Still mark as loaded so we show something
        };
      }, 500);
    } else {
      setImageError(true);
      setIsLoaded(true); // Still mark as loaded so we show something
    }
  };

  // Get enhanced animation class based on state
  const getEnhancedAnimationClass = () => {
    const baseAnimation = getStateAnimationClass(state);
    
    // Add animation intensifiers based on state
    switch (state) {
      case "speaking":
        return `${baseAnimation} transform-origin-center`;
      case "thinking":
        return `${baseAnimation} duration-1500`;
      case "happy":
        return `${baseAnimation} duration-1000`;
      case "confused":
        return `${baseAnimation} rotate-1`;
      case "tip":
        return `${baseAnimation} hover:scale-110`;
      default:
        return baseAnimation;
    }
  };

  return (
    <div 
      className={cn(
        "rounded-full overflow-hidden cursor-pointer transition-all duration-300 relative",
        sizeClasses[size],
        getStateGlowClass(state),
        getEnhancedAnimationClass(),
        className
      )}
      onClick={onClick}
      id={uniqueId}
      data-state={state}
      data-character={characterId}
    >
      <img
        src={getCharacterImageUrl(characterId, imageError) + (retryCount > 0 ? `?retry=${retryCount}&t=${Date.now()}` : '')}
        alt={`${characterId} avatar in ${state} state`}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        data-character={characterId}
        data-state={state}
      />
      
      <AvatarStateEffects state={state} />
    </div>
  );
};

export default PixarAvatar;
