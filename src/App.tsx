
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AccountSetup from "./pages/AccountSetup";
import SettingsView from "@/components/SettingsView";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/auth";
import { AvatarProvider } from "./contexts/AvatarContext";
import { initializeCharacterAvatars } from "./utils/supabaseStorage";
import { uploadCharacterImages } from "./utils/uploadCharacters";
import Loading from "./components/ui/loading";

const queryClient = new QueryClient();

// App initialization component
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [imagesInitialized, setImagesInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize character avatars when app starts
    const init = async () => {
      try {
        console.log("Starting Supabase storage initialization...");
        await initializeCharacterAvatars();
        
        // Upload characters to Supabase on app start
        console.log("Starting character image upload to Supabase...");
        await uploadCharacterImages();
        console.log("Character image upload completed");
        setImagesInitialized(true);
      } catch (error) {
        console.error("Error initializing images:", error);
        setInitializationError("Failed to initialize images");
        // Even on error, we set initialized to true to avoid blocking the app
        setImagesInitialized(true);
      }
    };
    
    init();
    
    // Set up periodic check for image availability
    const imageCheckInterval = setInterval(() => {
      if (imagesInitialized) {
        uploadCharacterImages().catch(console.error);
      }
    }, 30 * 60 * 1000); // Check every 30 minutes
    
    return () => clearInterval(imageCheckInterval);
  }, []);
  
  if (!imagesInitialized && !initializationError) {
    return <Loading fullPage text="Initializing application..." />;
  }
  
  return <>{children}</>;
};

// Protected route component with stable loading state
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, needsAccountSetup, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return <Loading fullPage text="Loading your account..." />;
  }
  
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
  const { isAuthenticated, needsAccountSetup, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return <Loading fullPage text="Loading your account..." />;
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

// Settings page wrapper to make it a standalone page
const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsView />
    </div>
  );
};

// App routes with error boundary
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state during initial auth check
  if (loading) {
    return <Loading fullPage text="Loading authentication..." />;
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
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <AvatarProvider>
            <AppInitializer>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AppInitializer>
          </AvatarProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
