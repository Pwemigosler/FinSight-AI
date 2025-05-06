
import { useEffect } from "react";
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
  // Update local state when user changes
  useEffect(() => {
    if (user) {
      console.log("[Profile] User updated:", 
        "Name:", user.name,
        "Avatar exists:", !!user.avatar,
        "Avatar length:", user.avatar?.length || 0,
        "Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none"
      );
      
      // Always update preview image when user avatar changes
      if (user.avatar) {
        setPreviewImage(user.avatar);
        console.log("[Profile] Setting preview image from user avatar, length:", user.avatar.length);
      } else {
        console.log("[Profile] No avatar found in user data");
        setPreviewImage(null);
      }
      
      // Initialize zoom and position from user settings if available
      if (user.avatarSettings) {
        setZoomLevel(user.avatarSettings.zoom);
        setImagePosition(user.avatarSettings.position);
        console.log("[Profile] Setting zoom and position from user settings");
      }
      
      // Force re-render of avatar
      updateAvatarKey();
    }
  }, [user, setPreviewImage, setZoomLevel, setImagePosition, updateAvatarKey]);
};

export default useAvatarSync;
