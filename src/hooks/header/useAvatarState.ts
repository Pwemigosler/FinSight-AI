import { debugLog } from '@/utils/debug';

import { useState, useRef, useEffect } from "react";
import { User } from "@/types/user";

export const useAvatarState = (user: User | null) => {
  const [avatarKey, setAvatarKey] = useState<number>(0);
  const [avatarError, setAvatarError] = useState(false);
  const avatarRetryCount = useRef(0);
  const [cachedAvatarData, setCachedAvatarData] = useState<string | undefined>(user?.avatar);
  const lastAvatarUpdateTime = useRef<number>(0);
  
  // Force re-render of avatar when user changes
  useEffect(() => {
    if (user) {
      // Reset error state and retry count when user changes
      setAvatarError(false);
      avatarRetryCount.current = 0;
      
      // Update cached avatar data
      if (user.avatar) {
        setCachedAvatarData(user.avatar);
        debugLog("[Header] User avatar updated, length:", user.avatar.length);
        debugLog("[Header] Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none");
        
        // Force re-render avatar when user changes
        setAvatarKey(prev => prev + 1);
      } else {
        debugLog("[Header] User updated but no avatar present");
      }
      
      debugLog("[Header] User updated:", 
        "Name:", user.name,
        "Avatar exists:", !!user.avatar, 
        "Avatar length:", user.avatar?.length || 0,
        "Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none"
      );
      
      // Send a synthetic avatar update event to ensure all components are in sync
      if (user.avatar) {
        const eventTimestamp = Date.now();
        lastAvatarUpdateTime.current = eventTimestamp;
        
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: user.avatar, 
            timestamp: eventTimestamp,
            source: 'user-object-change'
          }
        }));
      }
    }
  }, [user]);

  // Listen for avatar update events
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { avatarData, timestamp, source } = event.detail;
      debugLog("[Header] Received avatar-updated event:", 
        "Has avatar:", !!avatarData, 
        "Length:", avatarData?.length || 0,
        "Timestamp:", timestamp,
        "Source:", source || 'unknown');
      
      // Prioritize account setup related events
      const isPrioritySource = source === 'account-setup' || 
                             source === 'account-setup-final' ||
                             source === 'setup-completion' || 
                             source === 'setup-completion-delayed';
      
      // Only process if this is a newer event than the last one we processed
      // or if we're getting an event from account setup or setup completion
      const isNewerEvent = timestamp > lastAvatarUpdateTime.current;
      
      if ((isNewerEvent || isPrioritySource) && avatarData) {
        // Always prioritize account-setup-final, it should override any other event
        if (source === 'account-setup-final') {
          debugLog("[Header] Prioritizing account-setup-final event");
          lastAvatarUpdateTime.current = timestamp;
          setCachedAvatarData(avatarData);
          setAvatarError(false);
          avatarRetryCount.current = 0;
          setAvatarKey(prev => prev + 1000); // Big increase to ensure new key
        }
        // Then handle other events
        else {
          lastAvatarUpdateTime.current = timestamp;
          setCachedAvatarData(avatarData);
          setAvatarError(false);
          avatarRetryCount.current = 0;
          setAvatarKey(prev => prev + 1);
        }
        debugLog("[Header] Updated avatar from event, source:", source);
      }
    };

    // Add event listener for avatar updates
    window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // Check localStorage for avatar changes as fallback
  useEffect(() => {
    // Poll for avatar changes from localStorage
    // This helps catch changes that might have happened in another component
    const checkAvatarInterval = setInterval(() => {
      try {
        const savedUserJson = localStorage.getItem("finsight_user");
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson);
          
          // If localStorage has an avatar but we don't, update
          if (savedUser?.avatar && (!cachedAvatarData || savedUser.avatar.length !== cachedAvatarData.length)) {
            debugLog("[Header] Detected avatar change in localStorage");
            setCachedAvatarData(savedUser.avatar);
            setAvatarKey(prev => prev + 1);
            setAvatarError(false); // Reset error state when we get new avatar data
          }
        }
      } catch (error) {
        console.error("[Header] Error checking localStorage for avatar changes:", error);
      }
    }, 2000);
    
    return () => clearInterval(checkAvatarInterval);
  }, [cachedAvatarData]);
  
  // Force avatar refresh when the path changes to account setup
  // This helps ensure the avatar is up to date after setup is completed
  useEffect(() => {
    // Only fire once when component mounts
    const refreshAvatarFromLS = () => {
      try {
        const savedUserJson = localStorage.getItem("finsight_user");
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson);
          if (savedUser?.avatar) {
            debugLog("[Header] Initial path change - forcing avatar refresh from localStorage");
            setCachedAvatarData(savedUser.avatar);
            setAvatarKey(prev => prev + 100); // Big jump to ensure new key
          }
        }
      } catch (error) {
        console.error("[Header] Error refreshing avatar on path change:", error);
      }
    };
    
    // When the component mounts, refresh avatar
    refreshAvatarFromLS();
  }, []);

  const handleAvatarError = () => {
    avatarRetryCount.current += 1;
    console.error(`[Header] Failed to load avatar image (attempt ${avatarRetryCount.current})`);
    
    // Only set error after a few retries
    if (avatarRetryCount.current >= 3) {
      setAvatarError(true);
      debugLog("[Header] Avatar load failed after multiple attempts, showing fallback");
    } else {
      // Try again with a new key after a short delay
      setTimeout(() => {
        debugLog("[Header] Retrying avatar load...");
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
