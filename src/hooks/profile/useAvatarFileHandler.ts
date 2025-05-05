
import { useState, useRef } from "react";
import { toast } from "sonner";
import { validateImageFile, processProfileImage } from "./profileImageUtils";

/**
 * Hook to handle avatar file operations (upload, drag-drop, etc)
 * 
 * @returns File handling state and methods
 */
export const useAvatarFileHandler = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
    // Validate the file
    const validationError = validateImageFile(file);
    if (validationError) {
      toast(validationError);
      return;
    }

    // Process the image
    processProfileImage(file, (imageData) => {
      console.log("[Profile] New image loaded, length:", imageData.length);
      setPreviewImage(imageData);
    });
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
  
  return {
    fileInputRef,
    previewImage,
    setPreviewImage,
    isDragging,
    handleFileSelect,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};

export default useAvatarFileHandler;
