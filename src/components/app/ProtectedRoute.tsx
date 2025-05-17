
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, needsAccountSetup, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-finsight-purple border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading authentication state...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("[ProtectedRoute] User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Redirect users who need to complete account setup
  if (needsAccountSetup) {
    console.log("[ProtectedRoute] User needs account setup, redirecting to setup");
    return <Navigate to="/setup" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
