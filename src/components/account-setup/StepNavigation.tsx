
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { SetupStep } from "./SetupSteps";

interface StepNavigationProps {
  currentStep: SetupStep;
  currentStepIndex: number;
  stepsLength: number;
  loading: boolean;
  goToPreviousStep: () => void;
  handleContinue: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  currentStepIndex,
  stepsLength,
  loading,
  goToPreviousStep,
  handleContinue
}) => {
  return (
    <div className="flex justify-between">
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
        ) : currentStepIndex === stepsLength - 1 ? (
          "Complete Setup"
        ) : (
          <div className="flex items-center">
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        )}
      </Button>
    </div>
  );
};

export default StepNavigation;
