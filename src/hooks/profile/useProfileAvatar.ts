
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useImageState } from "./useImageState";
import { useAvatarFileHandler } from "./useAvatarFileHandler";
import { useAvatarDialog } from "./useAvatarDialog";
import { useAvatarActions } from "./useAvatarActions";

/**
 * Main hook for profile avatar functionality
 * Combines multiple smaller hooks for better organization
 * 
 * @returns Consolidated avatar state and methods
 */
export const useProfileAvatar = () => {
  const { user, updateUserProfile } = useAuth();

  // Use the extracted image state hook
  const {
    zoomLevel,
    setZoomLevel,
    imagePosition,
    setImagePosition,
    handleImageMouseDown,
    handleImageMouseMove,
    handleImageMouseUp,
    isDraggingImage
  } = useImageState(user?.avatarSettings?.zoom, user?.avatarSettings?.position);

  // Use file handling hook
  const {
    fileInputRef,
    previewImage,
    setPreviewImage,
    isDragging,
    handleFileSelect,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useAvatarFileHandler();

  // Use dialog state hook
  const {
    isDialogOpen,
    setIsDialogOpen,
    avatarKey,
    handleDialogClose,
    handleProfilePictureClick: baseHandleProfilePictureClick,
    updateAvatarKey
  } = useAvatarDialog();

  // Use avatar actions hook
  const {
    handleDeleteAvatar: baseHandleDeleteAvatar,
    handleUpload: baseHandleUpload
  } = useAvatarActions(updateUserProfile);

  // Wrapped handlers to provide necessary parameters
  const handleProfilePictureClick = () => {
    baseHandleProfilePictureClick(
      user?.avatar,
      previewImage,
      setPreviewImage,
      user?.avatarSettings,
      setZoomLevel,
      setImagePosition
    );
  };

  const handleDeleteAvatar = async () => {
    await baseHandleDeleteAvatar(
      setPreviewImage,
      setZoomLevel,
      setImagePosition,
      setIsDialogOpen,
      updateAvatarKey
    );
  };

  const handleUpload = () => {
    baseHandleUpload(
      previewImage,
      zoomLevel,
      imagePosition,
      setIsDialogOpen,
      updateAvatarKey
    );
  };

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
  }, [user, setZoomLevel, setImagePosition, setPreviewImage, updateAvatarKey]);

  return {
    isDialogOpen,
    previewImage,
    isDragging,
    zoomLevel,
    setZoomLevel,
    imagePosition,
    setImagePosition,
    avatarKey,
    fileInputRef,
    handleProfilePictureClick,
    handleFileSelect,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDialogClose,
    handleUpload,
    handleDeleteAvatar,
    handleImageMouseDown,
    handleImageMouseMove,
    handleImageMouseUp,
    isDraggingImage
  };
};

export default useProfileAvatar;
