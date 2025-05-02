
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
    setIsLoaded(true);
    setImageError(false);
  };
  
  const handleImageError = () => {
    console.error(`Failed to load character image: ${characterId}`);
    setImageError(true);
    setIsLoaded(true); // Still mark as loaded so we show something
  };

  return (
    <div 
      className={cn(
        "rounded-full overflow-hidden cursor-pointer transition-all duration-300 relative",
        sizeClasses[size],
        getStateGlowClass(state),
        getStateAnimationClass(state),
        className
      )}
      onClick={onClick}
    >
      <img
        src={getCharacterImageUrl(characterId, imageError)}
        alt={`${characterId} avatar in ${state} state`}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      <AvatarStateEffects state={state} />
    </div>
  );
};

export default PixarAvatar;
