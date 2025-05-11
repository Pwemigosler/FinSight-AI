
import { BiometricStorageService } from "./BiometricStorageService";
import { BiometricProviderFactory, BiometricProviderResult } from "./biometrics/BiometricProvider";

/**
 * Service for handling biometric authentication operations
 * Uses the BiometricProvider interface to abstract platform-specific implementations
 */
export class BiometricService {
  private storageService: BiometricStorageService;
  private provider: Awaited<ReturnType<typeof BiometricProviderFactory.getProvider>> = null;
  private providerInitialized = false;
  private providerInitialization: Promise<void> | null = null;
  
  constructor() {
    this.storageService = new BiometricStorageService();
    // Initialize provider asynchronously
    this.providerInitialization = this.initializeProvider();
  }
  
  /**
   * Initialize the appropriate biometric provider
   */
  private async initializeProvider(): Promise<void> {
    try {
      this.provider = await BiometricProviderFactory.getProvider();
      this.providerInitialized = true;
    } catch (error) {
      console.error("[BiometricService] Error initializing provider:", error);
    }
  }
  
  /**
   * Ensure the provider is initialized before using it
   */
  private async ensureProvider(): Promise<boolean> {
    if (this.providerInitialization) {
      await this.providerInitialization;
    }
    
    if (!this.providerInitialized) {
      await this.initializeProvider();
    }
    return !!this.provider;
  }
  
  /**
   * Check if biometrics are supported in the current environment
   */
  isSupported(): boolean {
    return BiometricProviderFactory.isSupported();
  }

  /**
   * Check if the current context is secure (https or localhost)
   */
  async isSecureContext(): Promise<boolean> {
    if (!(await this.ensureProvider())) {
      return false;
    }
    return this.provider.isSecureContext();
  }

  /**
   * Register a new biometric credential for the user
   */
  async registerCredential(
    userId: string, 
    username: string
  ): Promise<BiometricProviderResult> {
    if (!(await this.ensureProvider())) {
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
    if (!(await this.ensureProvider())) {
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
    if (!(await this.ensureProvider())) {
      return false;
    }
    
    console.log("[BiometricService] Removing credential for", userId);
    return this.provider.removeCredential(userId);
  }

  /**
   * Check if user has registered biometrics
   */
  async hasRegisteredCredential(userId: string): Promise<boolean> {
    if (!(await this.ensureProvider())) {
      return false;
    }
    
    console.log("[BiometricService] Checking for registered credential for", userId);
    return this.provider.hasRegisteredCredential(userId);
  }
}
