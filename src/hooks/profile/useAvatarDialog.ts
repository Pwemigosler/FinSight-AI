
import { useState } from "react";
import { ImagePosition } from "@/components/profile/types/avatar-types";

/**
 * Hook to manage avatar dialog state
 * 
 * @returns Avatar dialog state and methods
 */
export const useAvatarDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleProfilePictureClick = (
    userAvatar: string | undefined | null,
    previewImage: string | null,
    setPreviewImage: (img: string | null) => void,
    userSettings: { zoom?: number, position?: ImagePosition } | undefined,
    setZoomLevel: (zoom: number) => void,
    setImagePosition: (position: ImagePosition) => void
  ) => {
    // Make sure we're using any existing avatar when opening the dialog
    if (userAvatar && !previewImage) {
      console.log("[Profile] Setting preview image from user avatar before dialog");
      setPreviewImage(userAvatar);
    }
    setIsDialogOpen(true);
    
    // Reset zoom level and position when opening the dialog if no existing settings
    if (!userSettings) {
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
    } else {
      // Use existing settings
      if (userSettings.zoom) {
        setZoomLevel(userSettings.zoom);
      }
      if (userSettings.position) {
        setImagePosition(userSettings.position);
      }
    }
  };

  const updateAvatarKey = () => {
    setAvatarKey(Date.now());
  };
  
  return {
    isDialogOpen,
    setIsDialogOpen,
    avatarKey,
    handleDialogClose,
    handleProfilePictureClick,
    updateAvatarKey
  };
};

export default useAvatarDialog;
