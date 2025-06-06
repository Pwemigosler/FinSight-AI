import { debugLog } from '@/utils/debug';

import { useState, useRef, useEffect } from 'react';
import { getCharacterImageUrl } from '../utils/avatar-utils';

export const useAvatarImage = (characterId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [supabaseLoadError, setSupabaseLoadError] = useState(false);
  const [localLoadError, setLocalLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [uniqueId] = useState(`avatar-${Math.random().toString(36).substring(2, 9)}`);
  
  useEffect(() => {
    // Reset error state when character changes
    setSupabaseLoadError(false);
    setLocalLoadError(false);
    setRetryCount(0);
    setIsLoaded(false);
  }, [characterId]);
  
  const handleImageLoad = () => {
    debugLog(`Successfully loaded image for character: ${characterId}`);
    setIsLoaded(true);
    setSupabaseLoadError(false);
    setLocalLoadError(false);
    setRetryCount(0);
  };
  
  const handleImageError = () => {
    console.error(`Failed to load character image: ${characterId} (attempt ${retryCount + 1})`);
    
    if (!supabaseLoadError) {
      // First error - we assume this was the Supabase URL that failed
      debugLog(`Supabase URL failed for ${characterId}, trying local file fallback`);
      setSupabaseLoadError(true);
      
      // Force an immediate re-render to try local file
      setRetryCount(prev => prev + 1);
    } else if (!localLoadError) {
      // Second error - local file also failed
      debugLog(`Local file fallback failed for ${characterId}`);
      setLocalLoadError(true);
      
      if (retryCount < 2) {
        // Try one more time with an explicit cache buster
        setTimeout(() => {
          const img = new Image();
          const localPath = `/characters/${characterId.toLowerCase()}.png?t=${Date.now()}&retry=${retryCount + 1}`;
          debugLog(`Trying one final attempt with ${localPath}`);
          img.src = localPath;
          img.onload = handleImageLoad;
          img.onerror = () => {
            console.error(`All attempts failed for ${characterId}, using placeholder`);
            setLocalLoadError(true);
            setIsLoaded(true); // Still mark as loaded so we show something
          };
        }, 500);
        
        setRetryCount(prev => prev + 1);
      } else {
        setIsLoaded(true); // Still mark as loaded so we show placeholder
      }
    } else {
      // All attempts failed
      setIsLoaded(true); // Still mark as loaded so we show placeholder
    }
  };
  
  const getImageUrl = () => {
    if (supabaseLoadError && !localLoadError) {
      // If Supabase failed but we haven't tried local yet, use local path
      return `/characters/${characterId.toLowerCase()}.png?t=${Date.now()}&retry=${retryCount}`;
    }
    
    // Start with Supabase URL (or if both failed, this will trigger the placeholder)
    return getCharacterImageUrl(characterId, supabaseLoadError && localLoadError) + 
      (retryCount > 0 ? `?retry=${retryCount}&t=${Date.now()}` : `?t=${Date.now()}`);
  };
  
  return {
    isLoaded,
    imageError: supabaseLoadError && localLoadError, // Only true if both sources failed
    retryCount,
    animationRef,
    uniqueId,
    handleImageLoad,
    handleImageError,
    getImageUrl
  };
};
