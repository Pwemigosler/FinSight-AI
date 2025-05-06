
import { useState, useRef, useEffect } from "react";
import { User } from "@/types/user";

export const useAvatarState = (user: User | null) => {
  const [avatarKey, setAvatarKey] = useState<number>(0);
  const [avatarError, setAvatarError] = useState(false);
  const avatarRetryCount = useRef(0);
  const [cachedAvatarData, setCachedAvatarData] = useState<string | undefined>(user?.avatar);
  const lastAvatarUpdateTime = useRef<number>(0);
  const updateDebounceTimer = useRef<number | null>(null);
  
  // Debounced avatar update function to prevent rapid changes
  const debouncedAvatarUpdate = (avatarData: string, timestamp: number, source: string) => {
    // Clear any pending update
    if (updateDebounceTimer.current !== null) {
      window.clearTimeout(updateDebounceTimer.current);
    }
    
    // Set a new debounced update
    updateDebounceTimer.current = window.setTimeout(() => {
      // Only update if this is a newer event than the last one we processed
      if (timestamp > lastAvatarUpdateTime.current) {
        lastAvatarUpdateTime.current = timestamp;
        setCachedAvatarData(avatarData);
        setAvatarError(false);
        avatarRetryCount.current = 0;
        setAvatarKey(prev => prev + 1);
        console.log("[Header] Updated avatar from event, source:", source);
      }
      updateDebounceTimer.current = null;
    }, 50); // Short debounce time to batch updates
  };
  
  // Force re-render of avatar when user changes
  useEffect(() => {
    if (user?.avatar) {
      // Reset error state and retry count when user changes
      setAvatarError(false);
      avatarRetryCount.current = 0;
      
      // Update cached avatar data
      setCachedAvatarData(user.avatar);
      console.log("[Header] User avatar updated, length:", user.avatar.length);
      
      // Force re-render avatar when user changes (with debounce)
      const timestamp = Date.now();
      lastAvatarUpdateTime.current = timestamp;
      setAvatarKey(prev => prev + 1);
    }
  }, [user?.avatar]);

  // Listen for avatar update events (with debouncing)
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { avatarData, timestamp, source } = event.detail;
      if (!avatarData) return;
      
      console.log("[Header] Received avatar-updated event:", 
        "Has avatar:", !!avatarData, 
        "Length:", avatarData?.length || 0,
        "Source:", source || 'unknown');
      
      // Use debounced update for all events
      debouncedAvatarUpdate(avatarData, timestamp, source);
    };

    // Add event listener for avatar updates
    window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
      // Clear any pending debounce timer
      if (updateDebounceTimer.current !== null) {
        window.clearTimeout(updateDebounceTimer.current);
      }
    };
  }, []);

  const handleAvatarError = () => {
    avatarRetryCount.current += 1;
    console.error(`[Header] Failed to load avatar image (attempt ${avatarRetryCount.current})`);
    
    // Only set error after a few retries
    if (avatarRetryCount.current >= 3) {
      setAvatarError(true);
      console.log("[Header] Avatar load failed after multiple attempts, showing fallback");
    } else {
      // Try again with a new key after a short delay
      setTimeout(() => {
        console.log("[Header] Retrying avatar load...");
        setAvatarKey(prev => prev + 1);
      }, 500);
    }
  };

  return {
    avatarKey,
    avatarError,
    cachedAvatarData,
    handleAvatarError,
  };
};
