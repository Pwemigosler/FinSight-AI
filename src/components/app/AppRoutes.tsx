
import { Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import ProtectedRoute from "./ProtectedRoute";
import SetupRoute from "./SetupRoute";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";
import AccountSetup from "@/pages/AccountSetup";
import Documents from "@/pages/Documents";
import { useState, useEffect } from "react";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

const AppRoutes = () => {
  const { isAuthenticated, needsAccountSetup } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && !needsAccountSetup) {
      // Check if this is the user's first time using the app
      const hasCompletedOnboarding = localStorage.getItem('finsight_onboarding_completed') === 'true';
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, needsAccountSetup]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('finsight_onboarding_completed', 'true');
  };

  return (
    <>
      {isAuthenticated && showOnboarding && (
        <OnboardingModal 
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
      
      <Routes>
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/setup" element={<SetupRoute><AccountSetup /></SetupRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
