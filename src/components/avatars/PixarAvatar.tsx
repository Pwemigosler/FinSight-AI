
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PixarAvatarProps } from "./types/avatar-types";
import { 
  getAnimationConfig, 
  sizeClasses, 
  getStateGlowClass, 
  getStateAnimationClass 
} from "./utils/avatar-utils";
import AvatarStateEffects from "./parts/AvatarStateEffects";
import { useAvatarImage } from "./hooks/useAvatarImage";

const PixarAvatar: React.FC<PixarAvatarProps> = ({
  state = "idle",
  characterId = "fin",
  className = "",
  size = "md",
  onClick
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const {
    isLoaded,
    imageError,
    uniqueId,
    handleImageLoad,
    handleImageError,
    getImageUrl
  } = useAvatarImage(characterId);
  
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
    };
  }, [state, characterId]);

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
        src={getImageUrl()}
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
