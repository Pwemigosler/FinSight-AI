import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAvatar } from "@/contexts/AvatarContext";
import { setupSteps, SetupProgress } from "@/components/account-setup/SetupSteps";
import PersonalDetailsStep from "@/components/account-setup/PersonalDetailsStep";
import AssistantStep from "@/components/account-setup/AssistantStep";
import PreferencesStep from "@/components/account-setup/PreferencesStep";
import NotificationsStep from "@/components/account-setup/NotificationsStep";
import { useAvatarHandler } from "@/components/account-setup/hooks/useAvatarHandler";

// Import User type
import type { User } from "../types/user";

const AccountSetup = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, completeAccountSetup } = useAuth();
  const { characterId, setCharacterId } = useAvatar();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    avatar: user?.avatar || "",
    currency: user?.preferences?.currencyFormat || "usd",
    language: user?.preferences?.language || "en",
    emailNotifications: user?.preferences?.emailNotifications !== false,
    appNotifications: user?.preferences?.appNotifications !== false,
    assistantCharacter: user?.preferences?.assistantCharacter || characterId || "fin"
  });
  
  // Setup avatar handler with initial values from user
  const avatarHandler = useAvatarHandler({
    initialAvatar: user?.avatar,
    initialZoom: user?.avatarSettings?.zoom || 100,
    initialPosition: {
      x: user?.avatarSettings?.position?.x || 0,
      y: user?.avatarSettings?.position?.y || 0
    }
  });
  
  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || "",
        avatar: user.avatar || "",
        currency: user.preferences?.currencyFormat || "usd",
        language: user.preferences?.language || "en",
        emailNotifications: user.preferences?.emailNotifications !== false,
        appNotifications: user.preferences?.appNotifications !== false,
        assistantCharacter: user.preferences?.assistantCharacter || characterId || "fin"
      }));
      
      // Set preview image if user has an avatar
      if (user.avatar) {
        avatarHandler.setPreviewImage(user.avatar);
      }
    }
  }, [user, characterId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCharacterSelect = (characterId: string) => {
    setFormData(prev => ({
      ...prev,
      assistantCharacter: characterId
    }));
    setCharacterId(characterId);
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

  // Modified completeSetup function to handle all preferences
  const completeSetup = async () => {
    setLoading(true);
    try {
      // Prepare the final user data with all fields and preferences
      const finalUserData: Partial<User> = {
        name: formData.fullName,
        preferences: {
          currencyFormat: formData.currency,
          language: formData.language,
          emailNotifications: formData.emailNotifications,
          appNotifications: formData.appNotifications,
          assistantCharacter: formData.assistantCharacter,
        },
        hasCompletedSetup: true
      };
      
      // Add avatar data if it was uploaded or modified
      if (avatarHandler.avatarModified && avatarHandler.previewImage) {
        finalUserData.avatar = avatarHandler.previewImage;
      }
      
      // Add avatar settings if either the avatar was modified or its position/zoom was adjusted
      if ((avatarHandler.avatarModified || avatarHandler.avatarAdjusted) && avatarHandler.previewImage) {
        finalUserData.avatarSettings = {
          zoom: avatarHandler.zoomLevel,
          position: avatarHandler.imagePosition
        };
      }
      
      // Save all user data in one operation
      await updateUserProfile(finalUserData);
      
      // Set the character in avatar context
      setCharacterId(formData.assistantCharacter);
      
      // Mark setup as complete
      await completeAccountSetup();
      
      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("[AccountSetup] Error completing setup:", error);
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
          <PersonalDetailsStep 
            name={formData.fullName}
            onNameChange={handleInputChange}
            previewImage={avatarHandler.previewImage}
            zoomLevel={avatarHandler.zoomLevel}
            imagePosition={avatarHandler.imagePosition}
            onZoomChange={avatarHandler.handleZoomChange}
            isDragging={avatarHandler.isDragging}
            isDraggingImage={avatarHandler.isDraggingImage}
            onImageMouseDown={avatarHandler.handleImageMouseDown}
            onImageMouseMove={avatarHandler.handleImageMouseMove}
            onImageMouseUp={avatarHandler.handleImageMouseUp}
            onDragOver={avatarHandler.handleDragOver}
            onDragLeave={avatarHandler.handleDragLeave}
            onDrop={avatarHandler.handleDrop}
            onFileSelect={avatarHandler.processSelectedFile}
            onDeleteImage={avatarHandler.deleteImage}
          />
        );
      case "assistant":
        return (
          <AssistantStep 
            selectedCharacter={formData.assistantCharacter}
            onCharacterSelect={handleCharacterSelect}
          />
        );
      case "preferences":
        return (
          <PreferencesStep 
            currency={formData.currency}
            language={formData.language}
            onInputChange={handleInputChange}
          />
        );
      case "notification":
        return (
          <NotificationsStep 
            emailNotifications={formData.emailNotifications}
            appNotifications={formData.appNotifications}
            onInputChange={handleInputChange}
          />
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
          <SetupProgress steps={setupSteps} currentStepIndex={currentStepIndex} />
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
