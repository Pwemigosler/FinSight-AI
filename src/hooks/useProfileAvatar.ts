
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

export const useProfileAvatar = () => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.avatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(user?.avatarSettings?.zoom || 100);
  const [imagePosition, setImagePosition] = useState({ 
    x: user?.avatarSettings?.position?.x || 0, 
    y: user?.avatarSettings?.position?.y || 0 
  });
  const [avatarKey, setAvatarKey] = useState(Date.now());

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
      setAvatarKey(Date.now());
    }
  }, [user]);

  const handleProfilePictureClick = () => {
    // Make sure we're using any existing avatar when opening the dialog
    if (user?.avatar && !previewImage) {
      console.log("[Profile] Setting preview image from user avatar before dialog");
      setPreviewImage(user.avatar);
    }
    setIsDialogOpen(true);
    
    // Reset zoom level and position when opening the dialog if no existing settings
    if (!user?.avatarSettings) {
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
    } else {
      // Use existing settings
      setZoomLevel(user.avatarSettings.zoom);
      setImagePosition(user.avatarSettings.position);
    }
  };

  const handleFileSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger file selection if there's no image already
    if (!previewImage) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast("Image size should be less than 5MB");
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      console.log("[Profile] New image loaded, length:", imageData.length);
      setPreviewImage(imageData);
      // Reset zoom level when loading a new image
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleUpload = () => {
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
      setAvatarKey(Date.now());
    }).catch(error => {
      console.error("[Profile] Error updating profile picture:", error);
      toast("Failed to update profile picture");
    });
  };

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
    handleUpload
  };
};
