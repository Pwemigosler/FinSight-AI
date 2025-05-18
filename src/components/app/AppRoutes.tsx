
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
import OnboardingModal from "@/components/onboarding/OnboardingModal";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <OnboardingModal />}
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
