
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
  const imageStateHook = useImageState(user?.avatarSettings?.zoom, user?.avatarSettings?.position);
  
  // Use file handling hook
  const fileHandlerHook = useAvatarFileHandler();
  
  // Use dialog state hook
  const dialogHook = useAvatarDialog();
  
  // Use avatar actions hook
  const { handleDeleteAvatar, handleUpload } = useAvatarActions(updateUserProfile);

  // Wrapped handlers to provide necessary parameters
  const handleProfilePictureClick = () => {
    dialogHook.handleProfilePictureClick(
      user?.avatar,
      fileHandlerHook.previewImage,
      fileHandlerHook.setPreviewImage,
      user?.avatarSettings,
      imageStateHook.setZoomLevel,
      imageStateHook.setImagePosition
    );
  };

  const handleAvatarDelete = async () => {
    await handleDeleteAvatar(
      fileHandlerHook.setPreviewImage,
      imageStateHook.setZoomLevel,
      imageStateHook.setImagePosition,
      dialogHook.setIsDialogOpen,
      dialogHook.updateAvatarKey
    );
  };

  const handleAvatarUpload = () => {
    handleUpload(
      fileHandlerHook.previewImage,
      imageStateHook.zoomLevel,
      imageStateHook.imagePosition,
      dialogHook.setIsDialogOpen,
      dialogHook.updateAvatarKey
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
        fileHandlerHook.setPreviewImage(user.avatar);
        console.log("[Profile] Setting preview image from user avatar, length:", user.avatar.length);
      } else {
        console.log("[Profile] No avatar found in user data");
        fileHandlerHook.setPreviewImage(null);
      }
      
      // Initialize zoom and position from user settings if available
      if (user.avatarSettings) {
        imageStateHook.setZoomLevel(user.avatarSettings.zoom);
        imageStateHook.setImagePosition(user.avatarSettings.position);
        console.log("[Profile] Setting zoom and position from user settings");
      }
      
      // Force re-render of avatar
      dialogHook.updateAvatarKey();
    }
  }, [user, imageStateHook.setZoomLevel, imageStateHook.setImagePosition, fileHandlerHook.setPreviewImage, dialogHook.updateAvatarKey]);

  return {
    // Dialog props
    isDialogOpen: dialogHook.isDialogOpen,
    avatarKey: dialogHook.avatarKey,
    handleDialogClose: dialogHook.handleDialogClose,
    
    // Image state props
    zoomLevel: imageStateHook.zoomLevel,
    setZoomLevel: imageStateHook.setZoomLevel,
    imagePosition: imageStateHook.imagePosition,
    setImagePosition: imageStateHook.setImagePosition,
    handleImageMouseDown: imageStateHook.handleImageMouseDown,
    handleImageMouseMove: imageStateHook.handleImageMouseMove,
    handleImageMouseUp: imageStateHook.handleImageMouseUp,
    isDraggingImage: imageStateHook.isDraggingImage,
    
    // File handler props
    previewImage: fileHandlerHook.previewImage,
    fileInputRef: fileHandlerHook.fileInputRef,
    isDragging: fileHandlerHook.isDragging,
    handleFileSelect: fileHandlerHook.handleFileSelect,
    handleFileChange: fileHandlerHook.handleFileChange,
    handleDragOver: fileHandlerHook.handleDragOver,
    handleDragLeave: fileHandlerHook.handleDragLeave,
    handleDrop: fileHandlerHook.handleDrop,
    
    // Wrapped handlers
    handleProfilePictureClick,
    handleDeleteAvatar: handleAvatarDelete,
    handleUpload: handleAvatarUpload
  };
};

export default useProfileAvatar;
