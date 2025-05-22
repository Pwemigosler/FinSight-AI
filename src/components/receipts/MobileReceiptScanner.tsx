
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadReceipt } from "@/services/receiptService";

interface MobileReceiptScannerProps {
  transactionId: string;
  onUploadComplete?: (success: boolean) => void;
}

const MobileReceiptScanner = ({ transactionId, onUploadComplete }: MobileReceiptScannerProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Handle camera access and capture
  const handleStartCapture = async () => {
    setIsCapturing(true);
    try {
      // Create video element to show camera stream
      const videoElement = document.createElement("video");
      videoElement.style.display = "none";
      document.body.appendChild(videoElement);

      // Access camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use back camera if available
      });
      
      videoElement.srcObject = stream;
      videoElement.play();

      // Add button for capturing
      const captureButton = document.createElement("button");
      captureButton.innerText = "Capture Receipt";
      captureButton.style.position = "fixed";
      captureButton.style.bottom = "20px";
      captureButton.style.left = "50%";
      captureButton.style.transform = "translateX(-50%)";
      captureButton.style.zIndex = "1000";
      captureButton.style.padding = "10px 20px";
      captureButton.style.backgroundColor = "#7c3aed"; // finsight-purple
      captureButton.style.color = "white";
      captureButton.style.border = "none";
      captureButton.style.borderRadius = "5px";
      
      document.body.appendChild(captureButton);

      // Create canvas for capturing
      const canvas = document.createElement("canvas");
      
      // Handle capture click
      captureButton.onclick = () => {
        // Set canvas dimensions to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw current video frame to canvas
        canvas.getContext("2d")?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        
        // Stop camera stream
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        // Remove temporary elements
        document.body.removeChild(videoElement);
        document.body.removeChild(captureButton);
        
        // Update state with captured image
        setCapturedImage(imageDataUrl);
        setIsCapturing(false);
      };
    } catch (error) {
      toast({
        title: "Camera access error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  };

  // Convert data URL to file object
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  // Handle upload of captured image
  const handleUploadCaptured = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    
    try {
      // Convert data URL to file
      const file = dataUrlToFile(capturedImage, `receipt-scan-${Date.now()}.jpg`);
      
      const result = await uploadReceipt(file, transactionId);
      
      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive"
        });
        onUploadComplete?.(false);
      } else {
        toast({
          title: "Receipt uploaded",
          description: "Your scanned receipt has been successfully uploaded",
        });
        setCapturedImage(null);
        onUploadComplete?.(true);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: `An unexpected error occurred: ${(error as Error).message}`,
        variant: "destructive"
      });
      onUploadComplete?.(false);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancellation of captured image
  const handleCancelCaptured = () => {
    setCapturedImage(null);
  };

  return (
    <div className="space-y-4">
      {!capturedImage ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <Camera className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Button 
              onClick={handleStartCapture} 
              disabled={isCapturing}
              className="bg-finsight-purple hover:bg-finsight-purple/90"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accessing Camera...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Scan Receipt
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Use your camera to scan a receipt
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Captured receipt" 
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelCaptured}
              className="flex-1"
            >
              Retake
            </Button>
            <Button 
              onClick={handleUploadCaptured} 
              disabled={isUploading}
              className="flex-1 bg-finsight-purple hover:bg-finsight-purple/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileReceiptScanner;
