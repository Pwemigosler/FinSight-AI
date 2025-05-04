import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AccountSetup from "./pages/AccountSetup";
import SettingsView from "./components/SettingsView";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/auth";
import { AvatarProvider } from "./contexts/AvatarContext";
import { initializeCharacterAvatars } from "./utils/supabaseStorage";
import { uploadCharacterImages } from "./utils/uploadCharacters";

const queryClient = new QueryClient();

// App initialization component
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize character avatars when app starts
    const init = async () => {
      await initializeCharacterAvatars();
      
      // Upload characters to Supabase on app start
      // This will fetch from public/characters and upload to storage
      try {
        console.log("Starting character image upload to Supabase...");
        await uploadCharacterImages();
        console.log("Character image upload completed");
      } catch (error) {
        console.error("Error uploading character images:", error);
      }
    };
    
    init().catch(console.error);
  }, []);
  
  return <>{children}</>;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, needsAccountSetup } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect users who need to complete account setup
  if (needsAccountSetup) {
    return <Navigate to="/setup" replace />;
  }
  
  return <>{children}</>;
};

// Setup route component
const SetupRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, needsAccountSetup } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If setup is already completed, redirect to home
  if (!needsAccountSetup) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Settings page wrapper to make it a standalone page
const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsView />
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
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
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AvatarProvider>
        <TooltipProvider>
          <AppInitializer>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AppInitializer>
        </TooltipProvider>
      </AvatarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
