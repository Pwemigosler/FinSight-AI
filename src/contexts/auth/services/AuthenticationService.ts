
import { toast } from "sonner";
import { DefaultsService } from "./DefaultsService";
import { UserStorageService } from "./UserStorageService";
import { BiometricService } from "./BiometricService";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../../../types/user";
import { UserService } from "../UserService";

export class AuthenticationService {
  private defaultsService: DefaultsService;
  private storageService: UserStorageService;
  private userService: UserService;

  constructor() {
    this.defaultsService = new DefaultsService();
    this.storageService = new UserStorageService();
    this.userService = new UserService();
  }

  /**
   * Handles user login and merges Supabase + local storage.
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (supabaseError) {
        console.error("[AuthService] Supabase login failed:", supabaseError);
        toast.error(supabaseError.message || "Login failed.");
        this.storageService.clearUserData();
        return null;
      }

      if (!supabaseData.user) {
        console.error("[AuthService] No user returned from Supabase");
        toast.error("Login failed. No user returned from Supabase.");
        this.storageService.clearUserData();
        return null;
      }

      let loggedInUser: User | null = null;

      try {
        loggedInUser = await this.userService.getUserProfile(supabaseData.user.id);
      } catch (profileError) {
        console.error("[AuthService] Error fetching user profile after login:", profileError);
      }

      if (!loggedInUser) {
        // Fallback to a minimal user object if profile fetch failed
        loggedInUser = {
          id: supabaseData.user.id,
          name: supabaseData.user.user_metadata?.name || email.split('@')[0] || "User",
          email: email,
          avatar: "",
          avatarSettings: this.defaultsService.getDefaultAvatarSettings(),
          hasCompletedSetup: false,
        };
      }

      console.log("[AuthService] User successfully authenticated", loggedInUser);

      this.storageService.saveUser(loggedInUser);
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());

      toast.success("Successfully logged in");
      return loggedInUser;

    } catch (error) {
      console.error("[AuthService] Unexpected error during login:", error);
      toast.error("Unexpected error during login.");
      this.storageService.clearUserData();
      return null;
    }
  }

  /**
   * Handles user signup.
   */
  async signup(name: string, email: string, password: string): Promise<User | null> {
    try {
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (supabaseError) {
        console.error("[AuthService] Supabase signup failed:", supabaseError);
        toast.error(supabaseError.message || "Signup failed.");
        return null;
      }

      if (!supabaseData.user) {
        console.error("[AuthService] No user returned from Supabase signup");
        toast.error("Signup failed. No user returned from Supabase.");
        return null;
      }

      const newUser: User = {
        id: supabaseData.user.id,
        name,
        email,
        avatar: "",
        avatarSettings: this.defaultsService.getDefaultAvatarSettings(),
        hasCompletedSetup: false
      };

      this.storageService.saveUser(newUser);
      toast.success("Account created successfully!");
      return newUser;

    } catch (error) {
      console.error("[AuthService] Unexpected error during signup:", error);
      toast.error("Unexpected error during signup.");
      return null;
    }
  }

  /**
   * Logs out the user from both Supabase and local storage
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.storageService.clearUserData();
      toast("You have been logged out");
    } catch (error) {
      console.error("[AuthService] Logout failed:", error);
      toast("Logout failed. Please try again.");
    }
  }
}
