
import { useEffect, useRef } from "react";
import { User } from "@/types/user";
import { ImagePosition } from "@/components/profile/types/avatar-types";

/**
 * Hook to synchronize avatar state with user data
 * 
 * @param user Current user object
 * @param setPreviewImage Function to set preview image
 * @param setZoomLevel Function to set zoom level
 * @param setImagePosition Function to set image position
 * @param updateAvatarKey Function to update avatar key (force re-render)
 * @returns void
 */
export const useAvatarSync = (
  user: User | null,
  setPreviewImage: (image: string | null) => void,
  setZoomLevel: (zoom: number) => void,
  setImagePosition: (position: ImagePosition) => void,
  updateAvatarKey: () => void
) => {
  // Track if initial sync has been done
  const initialSyncDone = useRef(false);
  
  // Update local state when user changes
  useEffect(() => {
    if (!user) return;
    
    // Skip redundant updates after initial sync
    if (initialSyncDone.current && !user.avatar) return;
    
    console.log("[Profile] User updated:", 
      "Name:", user.name,
      "Avatar exists:", !!user.avatar,
      "Avatar length:", user.avatar?.length || 0);
    
    // Always update preview image when user avatar changes
    if (user.avatar) {
      setPreviewImage(user.avatar);
    }
    
    // Initialize zoom and position from user settings if available
    if (user.avatarSettings) {
      setZoomLevel(user.avatarSettings.zoom);
      setImagePosition(user.avatarSettings.position);
    }
    
    // Force re-render of avatar only once
    if (!initialSyncDone.current) {
      updateAvatarKey();
      initialSyncDone.current = true;
    }
  }, [user, setPreviewImage, setZoomLevel, setImagePosition, updateAvatarKey]);
};

export default useAvatarSync;
