import { debugLog } from '@/utils/debug';

import { AvatarState } from '../types/avatar-types';
import { getPublicUrl } from '@/utils/supabaseStorage';

const BUCKET_NAME = "character_avatars";

// Map of character images with paths in the Supabase storage bucket
export const characterImages = {
  "fin": "fin.png",
  "luna": "luna.png",
  "oliver": "oliver.png", 
  "zoe": "zoe.png"
};

// Check if current route is login page
export const isLoginRoute = (): boolean => {
  const pathname = window.location.pathname;
  return pathname === '/login' || pathname.includes('/login');
};

// Get character image URL with fallback mechanism
export const getCharacterImageUrl = (characterId: string, useLocalFallback: boolean): string => {
  if (useLocalFallback) {
    return getPlaceholderUrl(characterId);
  }
  
  // Normalize character ID to match available images
  const normalizedId = characterId.toLowerCase();
  const validCharacterIds = Object.keys(characterImages);
  
  // Check if normalized ID is in our available characters
  const finalId = validCharacterIds.includes(normalizedId) ? normalizedId : "fin";
  const imagePath = characterImages[finalId as keyof typeof characterImages];
  
  // Always try to get the Supabase URL first
  try {
    const supabaseUrl = getPublicUrl(imagePath);
    if (supabaseUrl) {
      debugLog(`Loading character ${characterId} from Supabase storage at ${supabaseUrl}`);
      return supabaseUrl;
    }
  } catch (error) {
    console.error(`Error getting Supabase URL for ${imagePath}:`, error);
    // Continue to fallback
  }
  
  // Return local file path for fallback logic in useAvatarImage hook
  debugLog(`Using local file fallback for character ${finalId}`);
  return `/characters/${imagePath}`;
};

// Get placeholder URL based on state
export const getPlaceholderUrl = (characterId: string, state: AvatarState = "idle"): string => {
  const stateColors: Record<AvatarState, string> = {
    idle: "33A9F0",
    speaking: "33C3F0",
    thinking: "10B981",
    happy: "F97316",
    confused: "8B5CF6", 
    tip: "F59E0B"
  };
  
  // Create a colored placeholder with the character name
  return `https://placehold.co/200x200/${stateColors[state]}/FFFFFF?text=${characterId}`;
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
