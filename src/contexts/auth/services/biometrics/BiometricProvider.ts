
import { User } from "../../../../types/user";

/**
 * Interface for platform-specific biometric authentication providers
 */
export interface BiometricProviderResult {
  success: boolean;
  error?: string;
}

export interface BiometricProvider {
  /**
   * Check if biometric authentication is supported on this device/platform
   */
  isSupported(): boolean;
  
  /**
   * Check if the current context allows for secure biometric authentication
   */
  isSecureContext(): boolean;
  
  /**
   * Register a new biometric credential for the user
   * @param userId The user's unique identifier
   * @param username The user's display name or email
   */
  registerCredential(userId: string, username: string): Promise<BiometricProviderResult>;
  
  /**
   * Verify a biometric login attempt
   * @param userId The user's unique identifier
   */
  verifyCredential(userId: string): Promise<BiometricProviderResult>;
  
  /**
   * Remove stored biometric credential for a user
   * @param userId The user's unique identifier
   */
  removeCredential(userId: string): Promise<boolean>;
  
  /**
   * Check if user has registered biometrics
   * @param userId The user's unique identifier
   */
  hasRegisteredCredential(userId: string): Promise<boolean>;
}

// We'll use type import for the WebAuthnProvider instead of require()
// This is just for TypeScript type checking, not runtime import
import type { WebAuthnProvider } from './WebAuthnProvider';

/**
 * Factory for creating the appropriate biometric provider based on platform
 */
export class BiometricProviderFactory {
  /**
   * Get the appropriate biometric provider for the current platform
   */
  static async getProvider(): Promise<BiometricProvider | null> {
    // For now, we only have the WebAuthn provider
    // In the future, this could check for Capacitor on mobile or Electron on desktop
    if (typeof window !== 'undefined' && window.PublicKeyCredential !== undefined) {
      try {
        // Use dynamic import with ES modules syntax
        const WebAuthnProviderModule = await import('./WebAuthnProvider');
        return new WebAuthnProviderModule.WebAuthnProvider();
      } catch (error) {
        console.error("[BiometricProviderFactory] Error loading WebAuthnProvider:", error);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Check if biometrics are supported on the current platform
   */
  static isSupported(): boolean {
    // Basic check for web platform support
    return typeof window !== 'undefined' && 
           window.PublicKeyCredential !== undefined;
    
    // Future: Add checks for Capacitor and Electron platforms
  }
}
