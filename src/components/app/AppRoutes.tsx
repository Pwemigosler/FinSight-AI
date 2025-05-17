
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

// Page components
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import AccountSetup from "@/pages/AccountSetup";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/NotFound";
import Settings from "@/components/pages/Settings";

// Route protectors
import ProtectedRoute from "./ProtectedRoute";
import SetupRoute from "./SetupRoute";

const AppRoutes = () => {
  const { loading } = useAuth();
  
  // Show loading state during initial auth check
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-finsight-purple border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/setup" 
        element={
          <SetupRoute>
            <AccountSetup />
          </SetupRoute>
        } 
      />
      <Route 
        path="/login" 
        element={<Login />} 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
