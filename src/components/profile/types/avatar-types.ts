
export interface ImagePosition {
  x: number;
  y: number;
}

export interface AvatarEditorProps {
  isOpen: boolean;
  onClose: () => void;
  previewImage: string | null;
  zoomLevel: number;
  setZoomLevel: (value: number) => void;
  imagePosition: ImagePosition;
  setImagePosition: (position: ImagePosition) => void;
  handleUpload: () => void;
  handleFileSelect: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
