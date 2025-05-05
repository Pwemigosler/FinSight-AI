
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import AvatarImageEditor from "./avatar/AvatarImageEditor";
import AvatarDropZone from "./avatar/AvatarDropZone";
import { AvatarEditorProps } from "./types/avatar-types";
import { Trash2 } from "lucide-react";

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  isOpen,
  onClose,
  previewImage,
  zoomLevel,
  setZoomLevel,
  imagePosition,
  setImagePosition,
  handleUpload,
  handleFileSelect,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  isDragging,
  fileInputRef,
  handleFileChange,
  handleDeleteAvatar
}) => {
  // Handle clicking the empty image container or "change image" text
  const handleImageContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!previewImage) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a headshot image for your profile. A square image centered on your face works best.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <AvatarDropZone
            previewImage={previewImage}
            isDragging={isDragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileSelect={handleFileSelect}
            handleImageContainerClick={handleImageContainerClick}
          >
            {previewImage && (
              <AvatarImageEditor
                previewImage={previewImage}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                imagePosition={imagePosition}
                setImagePosition={setImagePosition}
              />
            )}
          </AvatarDropZone>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {/* Delete button */}
            {previewImage && handleDeleteAvatar && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteAvatar}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
          
          <Button 
            type="button" 
            onClick={handleUpload}
            disabled={!previewImage}
          >
            Upload Picture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarEditor;
