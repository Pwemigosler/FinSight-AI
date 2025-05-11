
import { User } from "../../../types/user";
import { toast } from "sonner";
import { DefaultsService } from "./DefaultsService";
import { UserStorageService } from "./UserStorageService";
import { BiometricService } from "./BiometricService";

/**
 * Service responsible for authentication operations
 */
export class AuthService {
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
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      if (!email || !password) {
        toast("Please enter both email and password");
        return null;
      }
      
      // Check if this email already exists in localStorage
      const savedUserStr = localStorage.getItem("finsight_user");
      let mockUser: User;
      
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        
        // If the email matches, use the existing user data instead of creating a new one
        if (savedUser && savedUser.email === email) {
          console.log("[AuthService] Found existing user with matching email, preserving all user data");
          mockUser = savedUser; // Use the complete saved user data
        } else {
          // Different email, create new mock user with default setup=false
          mockUser = this.createNewUser(email);
        }
      } else {
        // No saved user, create a new user
        mockUser = this.createNewUser(email);
      }
      
      console.log("[AuthService] Logging in user with hasCompletedSetup:", mockUser.hasCompletedSetup,
                 "Avatar exists:", !!mockUser.avatar,
                 "Avatar length:", mockUser.avatar?.length || 0);
      
      this.storageService.saveUser(mockUser);
      
      // Also store a login timestamp to potentially expire the session after some time
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
      
      // Create a new user with the provided information
      const mockUser = {
        id: `user-${Date.now()}`,
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
   * Logs out the user
   */
  logout(): void {
    this.storageService.clearUserData();
    toast("You have been logged out");
  }

  /**
   * Handles biometric registration for a user
   */
  async registerBiometrics(user: User): Promise<boolean | {success: boolean; error?: string}> {
    if (!user || !user.id || !user.email) {
      toast("User information is incomplete");
      return { success: false, error: "User information is incomplete" };
    }

    if (!this.biometricService.isSupported()) {
      toast("Biometric authentication is not supported on this device");
      return { success: false, error: "Biometric authentication is not supported on this device" };
    }

    try {
      // Check if we're in a secure context
      if (!this.biometricService.isSecureContext()) {
        return {
          success: false,
          error: "Biometric authentication requires a secure context (HTTPS or localhost)"
        };
      }
      
      const result = await this.biometricService.registerCredential(
        user.id,
        user.email
      );

      if (result.success) {
        return true;
      } else {
        return result;
      }
    } catch (error: any) {
      console.error("[AuthService] Biometric registration failed:", error);
      return { 
        success: false, 
        error: error.message || "Biometric setup failed. Please try again." 
      };
    }
  }

  /**
   * Handles login with biometrics
   */
  async loginWithBiometrics(email: string): Promise<User | null> {
    try {
      // First check if we have a user with this email
      const savedUserStr = localStorage.getItem("finsight_user");
      
      if (!savedUserStr) {
        toast("No user found");
        return null;
      }
      
      const savedUser = JSON.parse(savedUserStr);
      if (savedUser.email !== email) {
        toast("User not found");
        return null;
      }

      // Check if we're in a secure context
      if (!this.biometricService.isSecureContext()) {
        toast("Biometric authentication requires a secure context (HTTPS or localhost)");
        return null;
      }

      // Now verify the biometric authentication
      const result = await this.biometricService.verifyCredential(savedUser.id);
      
      if (result.success) {
        // Update login timestamp
        localStorage.setItem("finsight_login_timestamp", Date.now().toString());
        toast("Biometric authentication successful");
        return savedUser;
      } else {
        toast("Biometric authentication failed", { 
          description: result.error || "Please try again or use password."
        });
        return null;
      }
    } catch (error: any) {
      console.error("[AuthService] Biometric login failed:", error);
      toast("Biometric login failed. Please try again or use password.");
      return null;
    }
  }

  /**
   * Removes biometric credentials for a user
   */
  removeBiometrics(user: User): boolean {
    if (!user || !user.id) {
      toast("User information is incomplete");
      return false;
    }

    try {
      this.biometricService.removeCredential(user.id);
      toast("Biometric authentication removed");
      return true;
    } catch (error: any) {
      console.error("[AuthService] Failed to remove biometrics:", error);
      toast("Failed to remove biometric authentication");
      return false;
    }
  }

  /**
   * Checks if biometrics are available and registered for the user
   */
  canUseBiometrics(user?: User | null): boolean {
    if (!this.biometricService.isSupported()) {
      return false;
    }
    
    if (!this.biometricService.isSecureContext()) {
      return false;
    }
    
    if (!user || !user.id) {
      return false;
    }
    
    return this.biometricService.hasRegisteredCredential(user.id);
  }
}
