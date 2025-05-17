
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";

interface SetupRouteProps {
  children: React.ReactNode;
}

const SetupRoute: React.FC<SetupRouteProps> = ({ children }) => {
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
    console.log("[SetupRoute] User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If setup is already completed, redirect to home
  if (!needsAccountSetup) {
    console.log("[SetupRoute] User has completed setup, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default SetupRoute;
