
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Crop, Move, User as UserIcon, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AvatarSettings } from "@/types/user";
import { Button } from "@/components/ui/button";

interface PersonalDetailsStepProps {
  name: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImage: string | null;
  zoomLevel: number;
  imagePosition: { x: number; y: number };
  onZoomChange: (value: number[]) => void;
  isDragging: boolean;
  isDraggingImage: boolean;
  onImageMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onImageMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onImageMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (file: File) => void;
  onDeleteImage?: () => void;
}

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  name,
  onNameChange,
  previewImage,
  zoomLevel,
  imagePosition,
  onZoomChange,
  isDragging,
  isDraggingImage,
  onImageMouseDown,
  onImageMouseMove,
  onImageMouseUp,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onDeleteImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };
  
  const handleFileSelectClick = () => {
    if (!previewImage) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Enter your full name"
          value={name}
          onChange={onNameChange}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="avatar" className="block mb-1">Profile Picture</Label>
        <p className="text-sm text-gray-500 mb-2">Upload a headshot photo for your profile picture</p>
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          id="avatarFile"
        />
        
        <div 
          className={`border-2 border-dashed rounded-md p-6 transition-colors ${isDragging ? 'border-finsight-purple bg-finsight-purple bg-opacity-5' : 'border-gray-300'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {previewImage ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden mb-2 cursor-move relative"
                  onMouseDown={onImageMouseDown}
                  onMouseMove={onImageMouseMove}
                  onMouseUp={onImageMouseUp}
                  onMouseLeave={onImageMouseUp}
                  onClick={(e) => e.stopPropagation()} // Prevent triggering file select
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-70 bg-black bg-opacity-40 text-white transition-opacity">
                    <Move className="h-6 w-6" />
                  </div>
                  <img 
                    src={previewImage} 
                    alt="Profile Preview" 
                    className="object-cover w-full h-full"
                    style={{ 
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: 'center',
                      marginLeft: `${imagePosition.x}px`,
                      marginTop: `${imagePosition.y}px`
                    }}
                  />
                </div>
                
                {/* Delete button positioned on top right of the avatar */}
                {onDeleteImage && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage();
                    }}
                    title="Remove profile picture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Image adjustment controls */}
              <div className="w-full max-w-xs space-y-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    <Crop className="h-3 w-3 inline mr-1" />
                    Adjust Image
                  </span>
                  <span className="text-xs text-gray-400">{zoomLevel}%</span>
                </div>
                <Slider
                  value={[zoomLevel]}
                  min={100} 
                  max={200}
                  step={1}
                  onValueChange={onZoomChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <p className="text-xs text-center text-gray-600">
                Drag the image to reposition
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center cursor-pointer" onClick={handleFileSelectClick}>
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-center text-gray-600">
                Click to select or drag and drop a headshot image
              </p>
              <p className="text-xs text-center text-gray-400 mt-1">
                PNG, JPG or GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
