
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserService } from "../UserService";

export function useAuthMethods(userService: UserService) {
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
    userService.logout(); // Clear local storage
  };

  return { login, signup, logout };
}
