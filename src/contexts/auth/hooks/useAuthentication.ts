
import { User } from "../../../types/user";
import { AuthService } from "../services/AuthService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

type UseAuthenticationProps = {
  setUser: (user: User | null) => void;
};

type UseAuthenticationResult = {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithBiometrics: (email: string) => Promise<boolean>;
  registerBiometrics: () => Promise<{success: boolean; error?: string} | boolean>;
  removeBiometrics: () => Promise<boolean>;
  isLoading: boolean;
};

export const useAuthentication = ({ 
  setUser 
}: UseAuthenticationProps): UseAuthenticationResult => {
  const authService = new AuthService();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Set loading state to true when login starts
    setIsLoading(true);
    
    try {
      console.log("[useAuthentication] Attempting login for:", email);
      // Use the authService to handle login which now properly manages both Supabase and localStorage
      const user = await authService.login(email, password);
      
      if (user) {
        console.log("[useAuthentication] Login successful, setting user state");
        setUser(user);
        return true;
      }
      
      console.log("[useAuthentication] Login failed, no user returned");
      return false;
    } catch (e) {
      console.error("[useAuthentication] Unexpected login error:", e);
      
      // Determine if it's a network error for more specific messaging
      const errorMessage = e instanceof Error && e.message.includes("fetch")
        ? "Network error. Please check your internet connection."
        : "An unexpected error occurred. Please try again later.";
      
      toast.error("Login failed", {
        description: errorMessage,
      });
      
      return false;
    } finally {
      // Always reset the loading state when login completes (success or failure)
      console.log("[useAuthentication] Resetting loading state");
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("[useAuthentication] Attempting signup for:", email);
      // Use the authService to handle signup
      const user = await authService.signup(name, email, password);
      
      if (user) {
        console.log("[useAuthentication] Signup successful, setting user state");
        setUser(user);
        return true;
      }
      
      console.log("[useAuthentication] Signup failed, no user returned");
      return false;
    } catch (e) {
      console.error("[useAuthentication] Unexpected signup error:", e);
      toast.error("Signup failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
      return false;
    } finally {
      // Always reset the loading state when signup completes (success or failure)
      console.log("[useAuthentication] Resetting loading state");
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      console.log("[useAuthentication] Attempting logout");
      // Use the authService to handle logout which now properly cleans up both Supabase and localStorage
      await authService.logout();
      console.log("[useAuthentication] Logout successful, clearing user state");
      setUser(null);
    } catch (error) {
      console.error("[useAuthentication] Logout error:", error);
      toast.error("Logout failed. Please try again.");
      
      // Even if logout fails from Supabase, we should still clear local state
      // This ensures users can still log out if Supabase connection is broken
      console.log("[useAuthentication] Forcing user state clear despite error");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBiometrics = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("[useAuthentication] Attempting biometric login for:", email);
      const loggedInUser = await authService.loginWithBiometrics?.(email);
      
      if (loggedInUser) {
        console.log("[useAuthentication] Biometric login successful");
        setUser(loggedInUser);
        toast.success("Biometric login successful");
        return true;
      }
      
      console.log("[useAuthentication] Biometric login failed");
      return false;
    } catch (error) {
      console.error("[useAuthentication] Biometric login error:", error);
      toast.error("Biometric login failed. Please try again with password.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerBiometrics = async (): Promise<{success: boolean; error?: string} | boolean> => {
    setIsLoading(true);
    
    try {
      // Get the current user from the supabase session instead of using a hardcoded value
      console.log("[useAuthentication] Getting current user for biometric registration");
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("[useAuthentication] Error getting current user:", error);
        toast.error("Authentication error. Please log in again.");
        return { success: false, error: "Authentication error" };
      }
      
      const user = data?.user ? {
        id: data.user.id,
        email: data.user.email || ''
      } : null;
      
      if (!user) {
        console.error("[useAuthentication] Cannot register biometrics: No user logged in");
        toast.error("Must be logged in to register biometrics");
        return { success: false, error: "Not logged in" };
      }

      console.log("[useAuthentication] Attempting to register biometrics");
      const result = await authService.registerBiometrics?.(user);
      
      // Handle both return types from AuthService
      let success = false;
      if (typeof result === 'object' && result !== null && 'success' in result) {
        success = result.success;
        if (!success && result.error) {
          toast.error(result.error);
        }
      } else {
        success = !!result;
        if (!success) {
          toast.error("Failed to register biometrics");
        }
      }
      
      if (success) {
        console.log("[useAuthentication] Biometric registration successful");
        toast.success("Biometric authentication registered successfully");
      }
      
      return result || { success: false }; // Return the original result to preserve all information
    } catch (error) {
      console.error("[useAuthentication] Error registering biometrics:", error);
      toast.error("Failed to register biometrics");
      return { success: false, error: "Unexpected error" };
    } finally {
      setIsLoading(false);
    }
  };

  const removeBiometrics = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Get the current user from the supabase session instead of using a hardcoded value
      console.log("[useAuthentication] Getting current user for biometric removal");
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("[useAuthentication] Error getting current user:", error);
        toast.error("Authentication error. Please log in again.");
        return false;
      }
      
      const user = data?.user ? {
        id: data.user.id,
        email: data.user.email || ''
      } : null;
      
      if (!user) {
        console.error("[useAuthentication] Cannot remove biometrics: No user logged in");
        toast.error("Must be logged in to remove biometrics");
        return false;
      }
      
      console.log("[useAuthentication] Attempting to remove biometrics");
      const result = await authService.removeBiometrics?.(user);
      
      if (result) {
        console.log("[useAuthentication] Biometric removal successful");
        toast.success("Biometric authentication removed");
      }
      
      return !!result;
    } catch (error) {
      console.error("[useAuthentication] Error removing biometrics:", error);
      toast.error("Failed to remove biometrics");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    logout,
    loginWithBiometrics,
    registerBiometrics,
    removeBiometrics,
    isLoading
  };
};
