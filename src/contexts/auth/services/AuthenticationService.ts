
import { User } from "../../../types/user";
import { toast } from "sonner";
import { DefaultsService } from "./DefaultsService";
import { UserStorageService } from "./UserStorageService";
import { BiometricService } from "./BiometricService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for user authentication operations
 */
export class AuthenticationService {
  private defaultsService: DefaultsService;
  private storageService: UserStorageService;
  private biometricService: BiometricService;
  
  constructor() {
    this.defaultsService = new DefaultsService();
    this.storageService = new UserStorageService();
    this.biometricService = new BiometricService();
  }

  /**
   * Handles user login
   * Now synchronizes properly between Supabase and local storage
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      if (!email || !password) {
        toast("Please enter both email and password");
        return null;
      }
      
      // First check Supabase authentication
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (supabaseError) {
        console.error("[AuthService] Supabase login failed:", supabaseError);
        toast(supabaseError.message || "Login failed");
        return null;
      }
      
      if (!supabaseData.user) {
        console.error("[AuthService] No user returned from Supabase");
        toast("Login failed. Please try again.");
        return null;
      }
      
      // Check if we have existing user data in localStorage that matches this email
      const savedUser = this.storageService.getStoredUser();
      let mockUser: User;
      
      if (savedUser && savedUser.email === email) {
        console.log("[AuthService] Found existing user with matching email, preserving user data");
        // Use existing user data but update the ID to match Supabase
        mockUser = {
          ...savedUser,
          id: supabaseData.user.id
        };
      } else {
        // Create a new user with data from Supabase
        mockUser = {
          id: supabaseData.user.id,
          name: supabaseData.user.user_metadata.name || email.split('@')[0] || "User",
          email: email,
          avatar: "",
          avatarSettings: this.defaultsService.getDefaultAvatarSettings(),
          hasCompletedSetup: false
        };
      }
      
      console.log("[AuthService] User successfully authenticated");
      
      // Save the synchronized user data
      this.storageService.saveUser(mockUser);
      
      // Also store a login timestamp
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
      toast("Successfully logged in");
      return mockUser;
    } catch (error) {
      console.error("[AuthService] Login failed:", error);
      toast("Login failed. Please try again.");
      return null;
    }
  }

  /**
   * Creates a new user with default values
   */
  private createNewUser(email: string): User {
    return {
      id: "user-123",
      name: email.split('@')[0] || "User",
      email: email,
      avatar: "",
      avatarSettings: this.defaultsService.getDefaultAvatarSettings(),
      hasCompletedSetup: false
    };
  }

  /**
   * Handles user signup
   */
  async signup(name: string, email: string, password: string): Promise<User | null> {
    try {
      if (!name || !email || !password) {
        toast("Please fill in all fields");
        return null;
      }
      
      if (password.length < 6) {
        toast("Password must be at least 6 characters long");
        return null;
      }
      
      // Create user in Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (supabaseError) {
        console.error("[AuthService] Supabase signup failed:", supabaseError);
        toast(supabaseError.message || "Signup failed");
        return null;
      }
      
      if (!supabaseData.user) {
        console.error("[AuthService] No user returned from Supabase signup");
        toast("Signup failed. Please try again.");
        return null;
      }
      
      // Create a new user with the provided information
      const mockUser = {
        id: supabaseData.user.id,
        name,
        email,
        avatar: "",
        avatarSettings: this.defaultsService.getDefaultAvatarSettings(),
        hasCompletedSetup: false
      };
      
      this.storageService.saveUser(mockUser);
      
      // Store login timestamp
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
      toast("Successfully signed up!");
      return mockUser;
    } catch (error) {
      console.error("[AuthService] Signup failed:", error);
      toast("Signup failed. Please try again.");
      return null;
    }
  }

  /**
   * Logs out the user from both Supabase and local storage
   */
  async logout(): Promise<void> {
    try {
      // Clear local storage data first, so even if Supabase logout fails
      // the user is still logged out locally
      this.storageService.clearUserData();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("[AuthService] Supabase signout error:", error);
        // Even if Supabase logout fails, we've already cleared local storage
        throw error;
      }
      
      toast("You have been logged out");
    } catch (error) {
      console.error("[AuthService] Logout failed:", error);
      // We don't show an error toast here since we've already cleared local storage
      // and functionally logged out the user
      throw error; // Re-throw to allow callers to handle the error
    }
  }
}
