
import { useState, useRef, useEffect } from "react";
import { User } from "@/types/user";

export const useAvatarDisplay = (user: User | null) => {
  const [avatarKey, setAvatarKey] = useState<number>(0);
  const [avatarError, setAvatarError] = useState(false);
  const avatarRetryCount = useRef(0);
  const [cachedAvatarData, setCachedAvatarData] = useState<string | undefined>(user?.avatar);
  const lastAvatarUpdateTime = useRef<number>(0);
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate avatar position scale factor based on the size difference
  const calculatePositionScale = () => {
    // The header avatar is 8x8, so we need to scale down the position values
    return 0.15; // Adjusted scaling factor for position values
  };

  // Listen for avatar update events
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { avatarData, timestamp, source } = event.detail;
      console.log("[AvatarDisplay] Received avatar-updated event:", 
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
          console.log("[AvatarDisplay] Prioritizing account-setup-final event");
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
        console.log("[AvatarDisplay] Updated avatar from event, source:", source);
      }
    };

    // Add event listener for avatar updates
    window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // Force re-render of avatar when user changes
  useEffect(() => {
    if (user) {
      // Reset error state and retry count when user changes
      setAvatarError(false);
      avatarRetryCount.current = 0;
      
      // Update cached avatar data
      if (user.avatar) {
        setCachedAvatarData(user.avatar);
        console.log("[AvatarDisplay] User avatar updated, length:", user.avatar.length);
        console.log("[AvatarDisplay] Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none");
        
        // Force re-render avatar when user changes
        setAvatarKey(prev => prev + 1);
      } else {
        console.log("[AvatarDisplay] User updated but no avatar present");
      }
      
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

  // Check localStorage for avatar changes as fallback
  useEffect(() => {
    // Poll for avatar changes from localStorage
    const checkAvatarInterval = setInterval(() => {
      try {
        const savedUserJson = localStorage.getItem("finsight_user");
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson);
          
          // If localStorage has an avatar but we don't, update
          if (savedUser?.avatar && (!cachedAvatarData || savedUser.avatar.length !== cachedAvatarData.length)) {
            console.log("[AvatarDisplay] Detected avatar change in localStorage");
            setCachedAvatarData(savedUser.avatar);
            setAvatarKey(prev => prev + 1);
            setAvatarError(false); // Reset error state when we get new avatar data
          }
        }
      } catch (error) {
        console.error("[AvatarDisplay] Error checking localStorage for avatar changes:", error);
      }
    }, 2000);
    
    return () => clearInterval(checkAvatarInterval);
  }, [cachedAvatarData]);

  const handleAvatarError = () => {
    avatarRetryCount.current += 1;
    console.error(`[AvatarDisplay] Failed to load avatar image (attempt ${avatarRetryCount.current})`);
    
    // Only set error after a few retries
    if (avatarRetryCount.current >= 3) {
      setAvatarError(true);
      console.log("[AvatarDisplay] Avatar load failed after multiple attempts, showing fallback");
    } else {
      // Try again with a new key after a short delay
      setTimeout(() => {
        console.log("[AvatarDisplay] Retrying avatar load...");
        setAvatarKey(prev => prev + 1);
      }, 500);
    }
  };

  // Calculate position scale for the current component
  const positionScale = calculatePositionScale();

  return {
    avatarKey,
    cachedAvatarData,
    avatarError,
    handleAvatarError,
    getInitials,
    positionScale
  };
};
