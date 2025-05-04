
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Crop, Move, User } from "lucide-react";

interface AvatarEditorProps {
  isOpen: boolean;
  onClose: () => void;
  previewImage: string | null;
  zoomLevel: number;
  setZoomLevel: (value: number) => void;
  imagePosition: { x: number; y: number };
  setImagePosition: (position: { x: number; y: number }) => void;
  handleUpload: () => void;
  handleFileSelect: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
  handleFileChange
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDraggingImage, setIsDraggingImage] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

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
    
    // Fix: Create new position object directly instead of using an updater function
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
          
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? 'border-finsight-purple bg-finsight-purple bg-opacity-5' : 'border-gray-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            {previewImage ? (
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
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
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
