
import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Download, Loader, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTransactions } from '@/hooks/useTransactions';

// Mock OCR function - in a real app, this would call an OCR service
const mockOcrExtraction = (imageBlob: Blob): Promise<{
  merchant: string;
  date: string;
  total: string;
  category: string;
  success: boolean;
}> => {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      resolve({
        merchant: "Local Grocery Store",
        date: new Date().toISOString().split('T')[0],
        total: (Math.random() * 100).toFixed(2),
        category: "Groceries",
        success: true
      });
    }, 2000);
  });
};

interface ReceiptScannerProps {
  onScanComplete?: (data: {
    merchant: string;
    date: string;
    total: string;
    category: string;
  }) => void;
  onClose?: () => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onScanComplete, onClose }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { defaultFormValues, handleFormSubmit } = useTransactions();

  const startCapture = useCallback(async () => {
    try {
      setCapturedImage(null);
      setScanSuccess(false);
      setScanError(false);
      
      const constraints = {
        video: {
          facingMode: 'environment', // Use the back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access your camera');
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame onto the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        
        // Stop camera stream
        stopCapture();
      }
    }
  }, [stopCapture]);

  const processReceipt = useCallback(async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setScanSuccess(false);
    setScanError(false);
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const imageBlob = await response.blob();
      
      // Process the image with OCR (mock for now)
      const extractedData = await mockOcrExtraction(imageBlob);
      
      if (extractedData.success) {
        setScanSuccess(true);
        
        // Update form with extracted data
        const formValues = {
          name: extractedData.merchant,
          date: extractedData.date,
          amount: `-${extractedData.total}`, // Negative for expenses
          category: extractedData.category
        };
        
        // Call the onScanComplete callback with the extracted data
        onScanComplete?.({
          merchant: extractedData.merchant,
          date: extractedData.date,
          total: extractedData.total,
          category: extractedData.category
        });
        
        // Auto-submit the form with the extracted data
        handleFormSubmit(formValues);
        
        toast.success('Receipt processed successfully');
        
        // Close the scanner after a delay
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        setScanError(true);
        toast.error('Could not extract data from receipt');
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      setScanError(true);
      toast.error('Error processing receipt');
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, handleFormSubmit, onClose, onScanComplete]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setScanSuccess(false);
    setScanError(false);
    startCapture();
  };

  const renderContent = () => {
    if (isCapturing) {
      return (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg"
            playsInline
            autoPlay
            muted
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button 
              onClick={captureImage}
              className="bg-white text-finsight-purple hover:bg-gray-100 rounded-full p-4 shadow-lg"
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
        </div>
      );
    }
    
    if (capturedImage) {
      return (
        <div className="relative">
          <img 
            src={capturedImage} 
            alt="Captured receipt" 
            className="w-full rounded-lg"
          />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={retakePhoto}
              className="bg-white border-finsight-purple text-finsight-purple hover:bg-gray-100"
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Retake
            </Button>
            
            <Button
              onClick={processReceipt}
              className="bg-finsight-purple text-white hover:bg-finsight-purple-dark"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Process Receipt
                </>
              )}
            </Button>
          </div>
          
          {scanSuccess && (
            <div className="absolute top-4 right-4 bg-green-100 text-green-600 p-2 rounded-full">
              <Check className="h-6 w-6" />
            </div>
          )}
          
          {scanError && (
            <div className="absolute top-4 right-4 bg-red-100 text-red-600 p-2 rounded-full">
              <AlertCircle className="h-6 w-6" />
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Camera className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Scan Receipt</h3>
        <p className="text-gray-500 mb-6">
          Use your camera to scan a receipt and automatically extract the transaction details.
        </p>
        <Button onClick={startCapture} className="bg-finsight-purple text-white hover:bg-finsight-purple-dark">
          Start Camera
        </Button>
      </div>
    );
  };

  // Clean up the camera stream when unmounting
  React.useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return (
    <div className="max-w-md mx-auto">
      {renderContent()}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ReceiptScanner;
