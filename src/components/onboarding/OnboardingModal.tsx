
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'dashboard',
    title: 'Personal Dashboard',
    description: 'Get a complete overview of your finances in one place, with insights into your spending, income, and savings.',
    image: '/placeholder.svg',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-finsight-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  },
  {
    id: 'transactions',
    title: 'Track Transactions',
    description: 'Record your expenses and income to keep track of where your money goes, with automatic categorization.',
    image: '/placeholder.svg',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-finsight-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  },
  {
    id: 'receipts',
    title: 'Receipt Management',
    description: 'Scan and store your receipts digitally, with automatic data extraction to save time.',
    image: '/placeholder.svg',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-finsight-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  },
  {
    id: 'reports',
    title: 'Financial Reports',
    description: 'Get detailed insights into your financial habits with customizable reports and visualizations.',
    image: '/placeholder.svg',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-finsight-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  },
  {
    id: 'ai',
    title: 'AI-Powered Insights',
    description: 'Get personalized financial advice and insights from our AI assistant to help you make better financial decisions.',
    image: '/placeholder.svg',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-finsight-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  }
];

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const OnboardingModal = ({ open, onOpenChange, onComplete }: OnboardingModalProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(onboardingSteps[0].id);
  
  const goToNextStep = () => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setActiveTab(onboardingSteps[nextIndex].id);
    } else {
      handleComplete();
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setActiveTab(onboardingSteps[prevIndex].id);
    }
  };
  
  const handleComplete = () => {
    // Set a flag in localStorage to indicate that onboarding has been completed
    localStorage.setItem('finsight_onboarding_completed', 'true');
    onComplete();
  };
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const newIndex = onboardingSteps.findIndex(step => step.id === tabId);
    if (newIndex !== -1) {
      setCurrentStepIndex(newIndex);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="flex h-[500px]">
          {/* Left navigation sidebar */}
          <div className="hidden md:block w-1/3 bg-gray-50 p-6 border-r">
            <h3 className="font-bold text-lg mb-6">Welcome to FinSight AI</h3>
            <ul className="space-y-4">
              {onboardingSteps.map((step, index) => (
                <li key={step.id}>
                  <button
                    onClick={() => handleTabChange(step.id)}
                    className={`flex items-center w-full p-2 rounded-md ${
                      activeTab === step.id ? 'bg-finsight-purple/10 text-finsight-purple' : 'text-gray-600'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                      index <= currentStepIndex ? 'bg-finsight-purple text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index < currentStepIndex ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="font-medium">{step.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right content area */}
          <div className="w-full md:w-2/3 p-6 flex flex-col">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
              {onboardingSteps.map((step) => (
                <TabsContent key={step.id} value={step.id} className="flex-1 flex flex-col">
                  <div className="flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-4">{step.title}</h2>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-xs">
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
              
              {/* Progress indicator for mobile */}
              <div className="md:hidden flex justify-center mt-4 mb-2">
                <div className="flex space-x-1">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-6 rounded-full ${
                        index <= currentStepIndex ? 'bg-finsight-purple' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentStepIndex < onboardingSteps.length - 1 ? (
                  <Button onClick={goToNextStep}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete}>
                    Get Started
                    <Check className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
