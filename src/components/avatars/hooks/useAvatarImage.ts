
import { useState, useRef } from 'react';
import { getCharacterImageUrl } from '../utils/avatar-utils';

export const useAvatarImage = (characterId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [uniqueId] = useState(`avatar-${Math.random().toString(36).substring(2, 9)}`);
  
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
  
  const getImageUrl = () => {
    return getCharacterImageUrl(characterId, imageError) + 
      (retryCount > 0 ? `?retry=${retryCount}&t=${Date.now()}` : '');
  };
  
  return {
    isLoaded,
    imageError,
    retryCount,
    animationRef,
    uniqueId,
    handleImageLoad,
    handleImageError,
    getImageUrl
  };
};
