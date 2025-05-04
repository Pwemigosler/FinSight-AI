
import React from "react";

// Define the setup steps
export type SetupStep = {
  id: string;
  title: string;
  description: string;
};

export const setupSteps: SetupStep[] = [
  {
    id: "personal",
    title: "Personal Details",
    description: "Complete your profile information",
  },
  {
    id: "assistant",
    title: "Assistant",
    description: "Choose your AI assistant character",
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

interface SetupProgressProps {
  steps: SetupStep[];
  currentStepIndex: number;
}

export const SetupProgress: React.FC<SetupProgressProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between">
        {steps.map((step, index) => (
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
          style={{ width: `${((currentStepIndex + 0.5) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

import { Check } from "lucide-react";
