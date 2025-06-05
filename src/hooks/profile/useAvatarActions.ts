
import { toast } from "sonner";
import { ImagePosition } from "@/components/profile/types/avatar-types";

/**
 * Hook to manage avatar actions (upload, delete)
 * 
 * @param updateUserProfile Function to update user profile
 * @returns Avatar action methods
 */
import { User } from "@/types/user";

export const useAvatarActions = (
  updateUserProfile: (data: Partial<User>) => Promise<void>
) => {
  const handleDeleteAvatar = async (
    setPreviewImage: (img: string | null) => void,
    setZoomLevel: (zoom: number) => void,
    setImagePosition: (position: ImagePosition) => void,
    setIsDialogOpen: (isOpen: boolean) => void,
    updateAvatarKey: () => void
  ) => {
    try {
      console.log("[Profile] Removing profile picture");
      
      await updateUserProfile({
        avatar: null,
        avatarSettings: null
      });
      
      setPreviewImage(null);
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
      setIsDialogOpen(false);
      
      toast("Profile picture removed");
      
      // Force a re-render of the avatar after update
      updateAvatarKey();
    } catch (error) {
      console.error("[Profile] Error removing profile picture:", error);
      toast("Failed to remove profile picture");
    }
  };

  const handleUpload = (
    previewImage: string | null,
    zoomLevel: number,
    imagePosition: ImagePosition,
    setIsDialogOpen: (isOpen: boolean) => void,
    updateAvatarKey: () => void
  ) => {
    if (!previewImage) return;
    
    console.log("[Profile] Uploading profile picture with settings:",
      "Zoom:", zoomLevel,
      "Position:", JSON.stringify(imagePosition)
    );
    
    // Save the image with transformation settings
    updateUserProfile({
      avatar: previewImage,
      avatarSettings: {
        zoom: zoomLevel,
        position: imagePosition
      }
    }).then(() => {
      console.log("[Profile] Profile picture updated successfully");
      setIsDialogOpen(false);
      toast("Profile picture updated successfully");
      
      // Force a re-render of the avatar after update
      updateAvatarKey();
    }).catch(error => {
      console.error("[Profile] Error updating profile picture:", error);
      toast("Failed to update profile picture");
    });
  };
  
  return {
    handleDeleteAvatar,
    handleUpload
  };
};

export default useAvatarActions;
