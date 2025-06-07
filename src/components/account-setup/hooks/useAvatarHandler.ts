
import { useState, useRef } from "react";
import { toast } from "sonner";

interface UseAvatarHandlerProps {
  initialAvatar: string | undefined;
  initialZoom: number;
  initialPosition: { x: number; y: number };
}

export const useAvatarHandler = ({
  initialAvatar,
  initialZoom,
  initialPosition
}: UseAvatarHandlerProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(initialAvatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(initialZoom || 100);
  const [imagePosition, setImagePosition] = useState({
    x: initialPosition?.x || 0,
    y: initialPosition?.y || 0
  });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [avatarModified, setAvatarModified] = useState(false);
  const [avatarAdjusted, setAvatarAdjusted] = useState(false);

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
      processSelectedFile(files[0]);
    }
  };

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
    setAvatarAdjusted(true);
  };

  const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingImage) return;
    e.preventDefault();
    e.stopPropagation();
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setImagePosition(prev => ({ 
      x: prev.x + dx, 
      y: prev.y + dy 
    }));
  };

  const handleImageMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    setAvatarAdjusted(true);
  };

  const processSelectedFile = (file: File) => {
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
      const imageDataUrl = event.target?.result as string;
      setPreviewImage(imageDataUrl);
      setAvatarModified(true);
      // Initialize zoom level and position for new images
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };
  
  // New function to delete the uploaded image
  const deleteImage = () => {
    setPreviewImage(null);
    setAvatarModified(true);
    setAvatarAdjusted(false);
    setZoomLevel(100);
    setImagePosition({ x: 0, y: 0 });
    toast("Profile image removed");
  };

  return {
    previewImage,
    isDragging,
    zoomLevel,
    imagePosition,
    isDraggingImage,
    avatarModified,
    avatarAdjusted,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleZoomChange,
    handleImageMouseDown,
    handleImageMouseMove,
    handleImageMouseUp,
    processSelectedFile,
    setPreviewImage,
    deleteImage
  };
};

export default useAvatarHandler;

export type UseAvatarHandlerReturn = ReturnType<typeof useAvatarHandler>;
