
import React from "react";
import { User } from "lucide-react";

interface AvatarDropZoneProps {
  previewImage: string | null;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileSelect: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleImageContainerClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

const AvatarDropZone: React.FC<AvatarDropZoneProps> = ({
  previewImage,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  handleImageContainerClick,
  children
}) => {
  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? 'border-finsight-purple bg-finsight-purple bg-opacity-5' : 'border-gray-300'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleFileSelect}
    >
      {previewImage ? (
        children
      ) : (
        <div className="flex flex-col items-center" onClick={handleImageContainerClick}>
          <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <User className="h-16 w-16 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Click to select a headshot image or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG or GIF up to 5MB
          </p>
        </div>
      )}
    </div>
  );
};

export default AvatarDropZone;
