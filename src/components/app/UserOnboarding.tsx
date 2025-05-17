
import React, { useState, useEffect } from 'react';
import OnboardingModal from "../onboarding/OnboardingModal";
import FeedbackButton from "../FeedbackButton";
import { useAuth } from "@/contexts/auth";

interface UserOnboardingProps {
  children: React.ReactNode;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, isAuthenticated, needsAccountSetup, loading } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && !needsAccountSetup && !loading) {
      // Check if this is the user's first time after account setup
      const hasCompletedOnboarding = localStorage.getItem('finsight_onboarding_completed') === 'true';
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, needsAccountSetup, loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {children}
      {isAuthenticated && (
        <>
          <FeedbackButton />
          <OnboardingModal
            open={showOnboarding}
            onOpenChange={setShowOnboarding}
            onComplete={handleOnboardingComplete}
          />
        </>
      )}
    </>
  );
};

export default UserOnboarding;
