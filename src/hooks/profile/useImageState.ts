
import { useState } from "react";
import { ImagePosition } from "@/components/profile/types/avatar-types";

/**
 * Hook to manage zoom level and position for image editing
 * 
 * @param initialZoom Initial zoom level (default 100)
 * @param initialPosition Initial position (default {x: 0, y: 0})
 * @returns Image state and control methods
 */
export const useImageState = (
  initialZoom: number = 100, 
  initialPosition: ImagePosition = { x: 0, y: 0 }
) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom || 100);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({
    x: initialPosition?.x || 0,
    y: initialPosition?.y || 0
  });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Image dragging handlers
  const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering file selector
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
    
    setImagePosition({
      x: imagePosition.x + dx,
      y: imagePosition.y + dy
    });
  };

  const handleImageMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  return {
    zoomLevel,
    setZoomLevel,
    imagePosition,
    setImagePosition,
    isDraggingImage,
    setIsDraggingImage,
    dragStart,
    setDragStart,
    handleImageMouseDown,
    handleImageMouseMove,
    handleImageMouseUp
  };
};

export default useImageState;
