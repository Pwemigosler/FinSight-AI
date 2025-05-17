
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-finsight-purple border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If setup is already completed, redirect to home
  if (!needsAccountSetup) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default SetupRoute;
