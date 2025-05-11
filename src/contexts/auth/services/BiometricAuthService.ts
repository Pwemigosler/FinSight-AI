
import { User } from "../../../types/user";
import { toast } from "sonner";
import { BiometricService } from "./BiometricService";

/**
 * Service responsible for biometric authentication operations
 */
export class BiometricAuthService {
  private biometricService: BiometricService;
  
  constructor() {
    this.biometricService = new BiometricService();
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
      const isSecureContext = await this.biometricService.isSecureContext();
      if (!isSecureContext) {
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
      console.error("[BiometricAuthService] Biometric registration failed:", error);
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
      const isSecureContext = await this.biometricService.isSecureContext();
      if (!isSecureContext) {
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
      console.error("[BiometricAuthService] Biometric login failed:", error);
      toast("Biometric login failed. Please try again or use password.");
      return null;
    }
  }

  /**
   * Removes biometric credentials for a user
   */
  async removeBiometrics(user: User): Promise<boolean> {
    if (!user || !user.id) {
      toast("User information is incomplete");
      return false;
    }

    try {
      await this.biometricService.removeCredential(user.id);
      toast("Biometric authentication removed");
      return true;
    } catch (error: any) {
      console.error("[BiometricAuthService] Failed to remove biometrics:", error);
      toast("Failed to remove biometric authentication");
      return false;
    }
  }

  /**
   * Checks if biometrics are available and registered for the user
   */
  async canUseBiometrics(user?: User | null): Promise<boolean> {
    // Basic availability checks
    if (!this.biometricService.isSupported()) {
      return false;
    }
    
    const isSecureContext = await this.biometricService.isSecureContext();
    if (!isSecureContext) {
      return false;
    }
    
    if (!user || !user.id) {
      return false;
    }
    
    // Now actually check if user has registered credentials
    try {
      return await this.biometricService.hasRegisteredCredential(user.id);
    } catch (error) {
      console.error("[BiometricAuthService] Error checking biometric availability:", error);
      return false;
    }
  }
}
