
import { User } from "../../../types/user";
import { AuthService } from "../services/AuthService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
};

export const useAuthentication = ({ 
  setUser 
}: UseAuthenticationProps): UseAuthenticationResult => {
  const authService = new AuthService();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use the authService to handle login which now properly manages both Supabase and localStorage
      const user = await authService.login(email, password);
      
      if (user) {
        setUser(user);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error("[AuthContext] Unexpected login error:", e);
      toast("Login failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Use the authService to handle signup
      const user = await authService.signup(name, email, password);
      
      if (user) {
        setUser(user);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error("[AuthContext] Unexpected signup error:", e);
      toast("Signup failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      // Use the authService to handle logout which now properly cleans up both Supabase and localStorage
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
      toast.error("Logout failed. Please try again.");
      
      // Even if logout fails from Supabase, we should still clear local state
      // This ensures users can still log out if Supabase connection is broken
      setUser(null);
    }
  };

  const loginWithBiometrics = async (email: string): Promise<boolean> => {
    try {
      const loggedInUser = await authService.loginWithBiometrics?.(email);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        toast.success("Biometric login successful");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("[AuthContext] Biometric login error:", error);
      toast.error("Biometric login failed. Please try again with password.");
      return false;
    }
  };

  const registerBiometrics = async (): Promise<{success: boolean; error?: string} | boolean> => {
    try {
      // Get the current user from the supabase session instead of using a hardcoded value
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("[AuthContext] Error getting current user:", error);
        toast.error("Authentication error. Please log in again.");
        return { success: false, error: "Authentication error" };
      }
      
      const user = data?.user ? {
        id: data.user.id,
        email: data.user.email || ''
      } : null;
      
      if (!user) {
        console.error("[AuthContext] Cannot register biometrics: No user logged in");
        toast.error("Must be logged in to register biometrics");
        return { success: false, error: "Not logged in" };
      }

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
        toast.success("Biometric authentication registered successfully");
      }
      
      return result || { success: false }; // Return the original result to preserve all information
    } catch (error) {
      console.error("[AuthContext] Error registering biometrics:", error);
      toast.error("Failed to register biometrics");
      return { success: false, error: "Unexpected error" };
    }
  };

  const removeBiometrics = async (): Promise<boolean> => {
    try {
      // Get the current user from the supabase session instead of using a hardcoded value
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("[AuthContext] Error getting current user:", error);
        toast.error("Authentication error. Please log in again.");
        return false;
      }
      
      const user = data?.user ? {
        id: data.user.id,
        email: data.user.email || ''
      } : null;
      
      if (!user) {
        console.error("[AuthContext] Cannot remove biometrics: No user logged in");
        toast.error("Must be logged in to remove biometrics");
        return false;
      }
      
      const result = await authService.removeBiometrics?.(user);
      
      if (result) {
        toast.success("Biometric authentication removed");
      }
      
      return !!result;
    } catch (error) {
      console.error("[AuthContext] Error removing biometrics:", error);
      toast.error("Failed to remove biometrics");
      return false;
    }
  };

  return {
    login,
    signup,
    logout,
    loginWithBiometrics,
    registerBiometrics,
    removeBiometrics
  };
};
