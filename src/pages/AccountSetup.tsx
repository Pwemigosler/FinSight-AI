import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Crop, User } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

// Define the setup steps
type SetupStep = {
  id: string;
  title: string;
  description: string;
};

const setupSteps: SetupStep[] = [
  {
    id: "personal",
    title: "Personal Details",
    description: "Complete your profile information",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Set your financial preferences",
  },
  {
    id: "notification",
    title: "Notifications",
    description: "Choose how you want to be notified",
  }
];

const AccountSetup = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, completeAccountSetup } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    avatar: user?.avatar || "",
    currency: "usd",
    language: "en",
    emailNotifications: true,
    appNotifications: true
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100); // Default zoom level (100%)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
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
      setFormData(prev => ({ ...prev, avatar: imageDataUrl }));
      // Reset zoom level when loading a new image
      setZoomLevel(100);
    };
    reader.readAsDataURL(file);
  };

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
  };

  const currentStep = setupSteps[currentStepIndex];
  
  const goToNextStep = () => {
    if (currentStepIndex < setupSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeSetup();
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep.id) {
      case "personal":
        if (!formData.fullName.trim()) {
          toast("Please enter your full name");
          return false;
        }
        break;
      // Add validation for other steps if needed
    }
    return true;
  };

  const completeSetup = async () => {
    setLoading(true);
    try {
      // Update user profile with form data
      await updateUserProfile({
        name: formData.fullName,
        avatar: formData.avatar,
      });
      
      // Mark setup as complete
      completeAccountSetup();
      
      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Error completing setup:", error);
      toast("There was a problem completing your setup");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case "personal":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
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
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileSelect}
              >
                {previewImage ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-2">
                      <img 
                        src={previewImage} 
                        alt="Profile Preview" 
                        className="object-cover w-full h-full"
                        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                      />
                    </div>
                    
                    {/* Image adjustment controls */}
                    <div className="w-full max-w-xs space-y-1">
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
                        onValueChange={handleZoomChange}
                      />
                    </div>
                    
                    <p className="text-xs text-center text-gray-600">
                      Click or drop a new image to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <User className="h-12 w-12 text-gray-400" />
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
      case "preferences":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="currency">Preferred Currency</Label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="usd">USD - US Dollar</option>
                <option value="eur">EUR - Euro</option>
                <option value="gbp">GBP - British Pound</option>
                <option value="jpy">JPY - Japanese Yen</option>
              </select>
            </div>
            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        );
      case "notification":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="emailNotifications">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="appNotifications"
                name="appNotifications"
                checked={formData.appNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="appNotifications">App Notifications</Label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Set Up Your Account
          </CardTitle>
          <CardDescription className="text-center">
            Complete your profile to get the most out of FinSight AI
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="mt-6">
            <div className="flex justify-between">
              {setupSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStepIndex 
                        ? "bg-finsight-purple text-white" 
                        : index === currentStepIndex 
                          ? "bg-finsight-purple text-white" 
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-finsight-purple rounded"
                style={{ width: `${((currentStepIndex + 0.5) / setupSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">{currentStep.title}</h2>
            <p className="text-gray-500">{currentStep.description}</p>
          </div>
          
          {renderStepContent()}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0 || loading}
          >
            Back
          </Button>
          
          <Button
            onClick={handleContinue}
            className="bg-finsight-purple hover:bg-finsight-purple-dark"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </div>
            ) : currentStepIndex === setupSteps.length - 1 ? (
              "Complete Setup"
            ) : (
              <div className="flex items-center">
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSetup;
