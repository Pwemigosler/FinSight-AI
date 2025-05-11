
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthContext] Login error:", error.message);
        
        // Provide specific messages for common errors
        if (error.message.includes("Email not confirmed")) {
          toast("Email not verified", {
            description: "Please check your email for a verification link or contact support if you didn't receive it.",
          });
          return false;
        } 
        else if (error.message.includes("Invalid login")) {
          toast("Invalid credentials", {
            description: "Please check your email and password.",
          });
          return false;
        } 
        // Handle other errors
        else {
          toast("Login error", {
            description: error.message || "An unexpected error occurred during login."
          });
          return false;
        }
      }

      // Successfully logged in
      toast("Login successful", {
        description: "Welcome back!"
      });
      return true;
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        console.error("[AuthContext] Signup error:", error.message);
        toast("Signup error", {
          description: error.message || "An unexpected error occurred during signup."
        });
        return false;
      }

      if (data?.user && !data.session) {
        // This means email confirmation is required
        toast("Verification required", {
          description: "A verification link has been sent to your email address.",
        });
      }

      return true;
    } catch (e) {
      console.error("[AuthContext] Unexpected signup error:", e);
      toast("Signup failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    authService.logout(); // Clear local storage
    setUser(null);
  };

  const loginWithBiometrics = async (email: string): Promise<boolean> => {
    const loggedInUser = await authService.loginWithBiometrics(email);
    
    if (loggedInUser) {
      setUser(loggedInUser);
      toast.success("Biometric login successful");
      return true;
    }
    
    return false;
  };

  const registerBiometrics = async (): Promise<{success: boolean; error?: string} | boolean> => {
    const user = await authService.login("demo@example.com", "password123");
    
    if (!user) {
      console.error("[AuthContext] Cannot register biometrics: No user logged in");
      toast.error("Must be logged in to register biometrics");
      return { success: false, error: "Not logged in" };
    }

    const result = await authService.registerBiometrics(user);
    
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
    
    return result; // Return the original result to preserve all information
  };

  const removeBiometrics = async (): Promise<boolean> => {
    const user = {
      id: "user-123",
      email: "demo@example.com"
    };
    
    if (!user) {
      console.error("[AuthContext] Cannot remove biometrics: No user logged in");
      toast.error("Must be logged in to remove biometrics");
      return false;
    }
    
    const result = await authService.removeBiometrics(user);
    
    if (result) {
      toast.success("Biometric authentication removed");
    }
    
    return result;
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
