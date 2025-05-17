import { useAuth } from "@/contexts/auth";
import { useImageState } from "./useImageState";
import { useAvatarFileHandler } from "./useAvatarFileHandler";
import { useAvatarDialog } from "./useAvatarDialog";
import { useAvatarActions } from "./useAvatarActions";
import { useAvatarSync } from "./useAvatarSync";

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
  
  // Use avatar actions hook with properly typed function
  const { handleDeleteAvatar, handleUpload } = useAvatarActions(
    // Ensure we're using the correctly typed function
    async (data) => {
      const result = await updateUserProfile(data);
      return result;
    }
  );
  
  // Use avatar sync hook to keep avatar state in sync with user data
  useAvatarSync(
    user,
    fileHandlerHook.setPreviewImage,
    imageStateHook.setZoomLevel,
    imageStateHook.setImagePosition,
    dialogHook.updateAvatarKey
  );

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
