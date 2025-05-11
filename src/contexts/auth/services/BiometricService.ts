
import { BiometricStorageService } from "./BiometricStorageService";
import { BiometricProviderFactory, BiometricProviderResult } from "./biometrics/BiometricProvider";

/**
 * Service for handling biometric authentication operations
 * Uses the BiometricProvider interface to abstract platform-specific implementations
 */
export class BiometricService {
  private storageService: BiometricStorageService;
  private provider;
  
  constructor() {
    this.storageService = new BiometricStorageService();
    this.provider = BiometricProviderFactory.getProvider();
  }
  
  /**
   * Check if biometrics are supported in the current environment
   */
  isSupported(): boolean {
    return !!this.provider && this.provider.isSupported();
  }

  /**
   * Check if the current context is secure (https or localhost)
   */
  isSecureContext(): boolean {
    return !!this.provider && this.provider.isSecureContext();
  }

  /**
   * Register a new biometric credential for the user
   */
  async registerCredential(
    userId: string, 
    username: string
  ): Promise<BiometricProviderResult> {
    if (!this.provider) {
      return { 
        success: false, 
        error: "Biometric authentication is not supported on this device" 
      };
    }
    
    console.log("[BiometricService] Registering credential for", userId);
    return this.provider.registerCredential(userId, username);
  }

  /**
   * Verify a biometric login attempt
   */
  async verifyCredential(userId: string): Promise<BiometricProviderResult> {
    if (!this.provider) {
      return { 
        success: false, 
        error: "Biometric authentication is not supported on this device" 
      };
    }
    
    console.log("[BiometricService] Verifying credential for", userId);
    return this.provider.verifyCredential(userId);
  }

  /**
   * Remove stored biometric credential for a user
   */
  async removeCredential(userId: string): Promise<boolean> {
    if (!this.provider) {
      return false;
    }
    
    console.log("[BiometricService] Removing credential for", userId);
    return this.provider.removeCredential(userId);
  }

  /**
   * Check if user has registered biometrics
   */
  async hasRegisteredCredential(userId: string): Promise<boolean> {
    if (!this.provider) {
      return false;
    }
    
    console.log("[BiometricService] Checking for registered credential for", userId);
    return this.provider.hasRegisteredCredential(userId);
  }
}
