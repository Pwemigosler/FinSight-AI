
import { AlertCircle, CheckCircle2, User, Robot, Settings, Bell, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

export const setupSteps = [
  {
    id: "personal",
    title: "Personal Details",
    description: "Tell us about yourself",
    icon: User,
  },
  {
    id: "assistant",
    title: "Choose Assistant",
    description: "Pick your AI assistant character",
    icon: Robot,
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Set your preferred formats",
    icon: Settings,
  },
  {
    id: "biometrics",
    title: "Biometric Security",
    description: "Set up faster, more secure login",
    icon: Fingerprint,
  },
  {
    id: "notification",
    title: "Notifications",
    description: "Configure your notifications",
    icon: Bell,
  }
];

export const SetupProgress = ({ 
  steps, 
  currentStepIndex 
}: { 
  steps: typeof setupSteps; 
  currentStepIndex: number;
}) => {
  return (
    <div className="flex justify-center pt-4">
      <ol className="flex items-center w-full max-w-[600px]">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <li 
              key={step.id} 
              className={cn(
                "flex items-center",
                index < steps.length - 1 ? "w-full" : ""
              )}
            >
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0 border transition-colors",
                    isActive && "bg-primary border-primary text-primary-foreground",
                    isCompleted && "bg-green-100 border-green-500 text-green-600",
                    !isActive && !isCompleted && "border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1 hidden sm:block",
                  isActive && "text-primary font-medium",
                  isCompleted && "text-green-600",
                )}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-full flex-1 border-t border-gray-200 mx-2",
                  isCompleted && "border-green-500"
                )}></div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
