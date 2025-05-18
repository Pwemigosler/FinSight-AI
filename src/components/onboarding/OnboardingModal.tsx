
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, UploadCloud, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  path?: string;
}

export const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps: OnboardingStep[] = [
    {
      title: "Add your first transaction",
      description:
        "Track your spending by adding transactions. We'll help you categorize and analyze your finances.",
      icon: <CreditCard className="h-12 w-12 text-finsight-purple" />,
      action: "Go to Transactions",
      path: "/transactions",
    },
    {
      title: "Upload a document",
      description:
        "Upload financial documents like statements and receipts. Our AI will help you extract insights.",
      icon: <UploadCloud className="h-12 w-12 text-finsight-purple" />,
      action: "Go to Documents",
      path: "/documents",
    },
    {
      title: "Ask questions about your documents",
      description:
        "Our AI can answer questions about your uploaded documents. Try asking about specific details or summaries.",
      icon: <FileText className="h-12 w-12 text-finsight-purple" />,
      action: "Try it now",
      path: "/documents",
    },
  ];

  useEffect(() => {
    // Check if first-time user
    const hasSeenOnboarding = localStorage.getItem("finsight_onboarding_complete");
    
    if (user && !hasSeenOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleActionClick = () => {
    completeOnboarding();
    if (steps[currentStep].path) {
      navigate(steps[currentStep].path);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem("finsight_onboarding_complete", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">{steps[currentStep].icon}</div>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>{steps[currentStep].description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleActionClick} className="flex gap-2 items-center">
              {steps[currentStep].action} <ArrowRight className="h-4 w-4" />
            </Button>
            {currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
        <div className="flex justify-center gap-1 mt-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-4 rounded-full ${
                idx === currentStep ? "bg-finsight-purple" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
