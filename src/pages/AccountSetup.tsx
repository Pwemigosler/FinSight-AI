
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
              <Label htmlFor="avatar">Profile Picture URL (Optional)</Label>
              <Input
                id="avatar"
                name="avatar"
                placeholder="https://example.com/your-photo.jpg"
                value={formData.avatar}
                onChange={handleInputChange}
                className="mt-1"
              />
              {formData.avatar && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={formData.avatar} 
                    alt="Preview" 
                    className="h-16 w-16 rounded-full object-cover border" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
              )}
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
