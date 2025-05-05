
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAvatar } from "@/contexts/AvatarContext";
import { setupSteps, SetupProgress } from "@/components/account-setup/SetupSteps";
import { useAvatarHandler } from "@/components/account-setup/hooks/useAvatarHandler";
import { useAccountSetupForm } from "@/components/account-setup/hooks/useAccountSetupForm";
import StepRenderer from "@/components/account-setup/StepRenderer";
import StepNavigation from "@/components/account-setup/StepNavigation";
import { useAuth } from "@/contexts/auth";

const AccountSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Custom hooks
  const { formData, loading, handleInputChange, handleCharacterSelect, completeSetup } = useAccountSetupForm();
  
  // Setup avatar handler with initial values from user
  const avatarHandler = useAvatarHandler({
    initialAvatar: user?.avatar,
    initialZoom: user?.avatarSettings?.zoom || 100,
    initialPosition: {
      x: user?.avatarSettings?.position?.x || 0,
      y: user?.avatarSettings?.position?.y || 0
    }
  });
  
  // Update preview image if user has an avatar
  useEffect(() => {
    if (user?.avatar && !avatarHandler.previewImage) {
      console.log("[AccountSetup] Setting initial avatar from user, length:", user.avatar.length);
      avatarHandler.setPreviewImage(user.avatar);
    }
  }, [user, avatarHandler]);

  const currentStep = setupSteps[currentStepIndex];
  
  const goToNextStep = () => {
    if (currentStepIndex < setupSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinalSubmit();
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

  const handleFinalSubmit = async () => {
    try {
      if (isCompleting) return; // Prevent multiple submission attempts
      setIsCompleting(true);
      
      console.log("[AccountSetup] Final submit with data:", 
        "Name:", formData.fullName,
        "Avatar exists:", !!avatarHandler.previewImage,
        "Avatar length:", avatarHandler.previewImage?.length || 0);
        
      const success = await completeSetup(avatarHandler);
      
      if (success) {
        toast.success("Account setup completed successfully!");
        
        // Show completion message with a more substantial delay
        // This gives time for avatar events to propagate and state to update
        setTimeout(() => {
          console.log("[AccountSetup] Setup completed successfully, navigating to home");
          navigate("/");
        }, 800); // Increased delay for reliable UI updates
      } else {
        toast.error("There was a problem completing your setup");
        setIsCompleting(false);
      }
    } catch (error) {
      console.error("[AccountSetup] Error completing setup:", error);
      toast.error("There was a problem completing your setup");
      setIsCompleting(false);
    }
  };

  const handleContinue = () => {
    if (validateCurrentStep()) {
      // For the personal details step, save the data immediately
      if (currentStep.id === "personal" && avatarHandler.avatarModified) {
        console.log("[AccountSetup] Saving avatar during step navigation");
      }
      
      goToNextStep();
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
          
          <StepRenderer 
            currentStepId={currentStep.id}
            formData={formData}
            avatarHandler={avatarHandler}
            onNameChange={handleInputChange}
            onInputChange={handleInputChange}
            onCharacterSelect={handleCharacterSelect}
          />
        </CardContent>
        
        <CardFooter>
          <StepNavigation 
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            stepsLength={setupSteps.length}
            loading={loading || isCompleting}
            goToPreviousStep={goToPreviousStep}
            handleContinue={handleContinue}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSetup;
