
import React, { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Move, Crop } from "lucide-react";
import { ImagePosition } from "../types/avatar-types";

interface AvatarImageEditorProps {
  previewImage: string;
  zoomLevel: number;
  setZoomLevel: (value: number) => void;
  imagePosition: ImagePosition;
  setImagePosition: (position: ImagePosition) => void;
}

const AvatarImageEditor: React.FC<AvatarImageEditorProps> = ({
  previewImage,
  zoomLevel,
  setZoomLevel,
  imagePosition,
  setImagePosition
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };

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

  return (
    <div className="space-y-4">
      <div 
        className="w-48 h-48 mx-auto rounded-full overflow-hidden cursor-move relative"
        onMouseDown={handleImageMouseDown}
        onMouseMove={handleImageMouseMove}
        onMouseUp={handleImageMouseUp}
        onMouseLeave={handleImageMouseUp}
        onClick={(e) => e.stopPropagation()} // Prevent triggering file select
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-70 bg-black bg-opacity-40 text-white transition-opacity">
          <Move className="h-8 w-8" />
        </div>
        <img
          ref={imageRef}
          src={previewImage}
          alt="Preview"
          className="object-cover h-full w-full"
          style={{ 
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center',
            marginLeft: `${imagePosition.x}px`,
            marginTop: `${imagePosition.y}px`
          }}
        />
      </div>
      
      {/* Image adjustment controls */}
      <div className="space-y-2 pt-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            <Crop className="h-4 w-4 inline mr-1" />
            Adjust Image
          </span>
          <span className="text-xs text-gray-400">{zoomLevel}%</span>
        </div>
        <Slider
          value={[zoomLevel]}
          min={100} 
          max={200}
          step={1}
          onValueChange={handleZoomChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <p className="text-xs text-center text-gray-500">
        Drag the image to reposition
      </p>
    </div>
  );
};

export default AvatarImageEditor;
