
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { AvatarProvider } from "./contexts/AvatarContext";

// App components
import AppInitializer from "./components/app/AppInitializer";
import UserOnboarding from "./components/app/UserOnboarding";
import AppRoutes from "./components/app/AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <AvatarProvider>
              <AppInitializer>
                <UserOnboarding>
                  <Toaster />
                  <Sonner />
                  <AppRoutes />
                </UserOnboarding>
              </AppInitializer>
            </AvatarProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
