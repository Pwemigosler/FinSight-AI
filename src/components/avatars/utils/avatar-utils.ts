
import { AvatarState } from '../types/avatar-types';

// Map of character images with fallback URLs
export const characterImages = {
  "fin": "/characters/fin.png",
  "luna": "/characters/luna.png",
  "oliver": "/characters/oliver.png",
  "zoe": "/characters/zoe.png"
};

// Get character image URL with fallback to placeholder
export const getCharacterImageUrl = (characterId: string, imageError: boolean): string => {
  if (imageError) {
    return getPlaceholderUrl(characterId, "idle");
  }
  
  return characterImages[characterId as keyof typeof characterImages] || characterImages.fin;
};

// Get placeholder URL based on state
export const getPlaceholderUrl = (characterId: string, state: AvatarState): string => {
  const stateColors: Record<AvatarState, string> = {
    idle: "33A9F0",
    speaking: "33C3F0",
    thinking: "10B981",
    happy: "F97316",
    confused: "8B5CF6", 
    tip: "F59E0B"
  };
  
  return `https://placehold.co/200x200/${stateColors[state]}/FFFFFF/?text=${characterId}`;
};

// Animation configuration based on state
export const getAnimationConfig = (state: AvatarState) => {
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

// Size classes for the avatar
export const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32"
};

// Get background glow based on state
export const getStateGlowClass = (state: AvatarState): string => {
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
export const getStateAnimationClass = (state: AvatarState): string => {
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
