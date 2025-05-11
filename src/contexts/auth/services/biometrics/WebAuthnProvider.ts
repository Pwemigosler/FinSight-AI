
import { BiometricProvider, BiometricProviderResult } from './BiometricProvider';
import { BiometricStorageService } from '../BiometricStorageService';

/**
 * WebAuthn implementation of the BiometricProvider for web browsers
 */
export class WebAuthnProvider implements BiometricProvider {
  private storageService: BiometricStorageService;
  
  constructor() {
    this.storageService = new BiometricStorageService();
  }
  
  /**
   * Check if WebAuthn is supported in the current browser
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           window.PublicKeyCredential !== undefined;
  }

  /**
   * Check if the current context is secure (https or localhost)
   */
  isSecureContext(): boolean {
    return window.isSecureContext;
  }

  /**
   * Check if running in an iframe, which can cause WebAuthn issues
   */
  isInIframe(): boolean {
    try {
      return window !== window.top;
    } catch (e) {
      // If we can't access window.top, we're probably in a cross-origin iframe
      return true;
    }
  }

  /**
   * Register a new biometric credential for the user
   * @param userId The user's unique identifier
   * @param username The user's display name or email
   * @returns A Promise that resolves when registration succeeds
   */
  async registerCredential(userId: string, username: string): Promise<BiometricProviderResult> {
    if (!this.isSupported()) {
      return { 
        success: false, 
        error: "WebAuthn is not supported in this browser"
      };
    }
    
    if (!this.isSecureContext()) {
      return { 
        success: false, 
        error: "Biometric authentication requires a secure context (HTTPS or localhost)"
      };
    }

    if (this.isInIframe()) {
      return {
        success: false,
        error: "Biometric authentication may not work in iframes. Please try in a new window."
      };
    }

    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential options
      const createCredentialOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { 
          name: "FinSight AI",
          id: window.location.hostname
        },
        user: {
          id: Uint8Array.from(userId, c => c.charCodeAt(0)),
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: "none" as AttestationConveyancePreference
      };

      try {
        console.log("Creating credential with options:", createCredentialOptions);

        // Create a credential
        const credential = await navigator.credentials.create({ 
          publicKey: createCredentialOptions
        }) as PublicKeyCredential;

        console.log("Credential created:", credential);

        if (!credential) {
          return {
            success: false,
            error: "No credential returned"
          };
        }

        // Store credential in Supabase (encrypted)
        const credentialId = btoa(
          String.fromCharCode(...new Uint8Array(credential.rawId))
        );
        
        // For this demo, we'll simply store the credential ID
        // In a real implementation, you would store more data like the public key
        const success = await this.storageService.storeCredential(
          userId,
          credentialId,
          JSON.stringify({
            id: credentialId,
            created: new Date().toISOString()
          })
        );
        
        if (!success) {
          return {
            success: false,
            error: "Failed to store credential securely"
          };
        }
        
        return { success: true };
      } catch (error: any) {
        console.error("[WebAuthnProvider] Error creating credential:", error);
        
        // Handle specific origin errors that occur in iframes or cross-origin contexts
        if (error.name === "NotAllowedError" && 
            (error.message.includes("origin") || error.message.includes("ancestors"))) {
          return {
            success: false,
            error: "Security restriction: Biometric authentication cannot run in this environment (try opening in a new tab)"
          };
        }
        
        throw error; // Re-throw for the outer catch block
      }
    } catch (error: any) {
      console.error("[WebAuthnProvider] Error registering credential:", error);
      
      // Provide more specific error messages for common errors
      if (error.name === "NotAllowedError") {
        if (error.message.includes("origin") || error.message.includes("ancestors")) {
          return {
            success: false,
            error: "Security restriction: Biometric authentication is not allowed in this context"
          };
        } else {
          return {
            success: false,
            error: "Permission denied: The user did not consent to the operation"
          };
        }
      } else if (error.name === "NotSupportedError") {
        return {
          success: false,
          error: "Your device does not have the required authenticators"
        };
      } else if (error.name === "SecurityError") {
        return {
          success: false,
          error: "Security error: The operation is not allowed in this context"
        };
      }
      
      return {
        success: false,
        error: error.message || "Unknown error occurred"
      };
    }
  }

  /**
   * Verify a biometric login attempt
   * @param userId The user's unique identifier
   * @returns A Promise that resolves to true if authentication succeeds
   */
  async verifyCredential(userId: string): Promise<BiometricProviderResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: "WebAuthn is not supported in this browser"
      };
    }
    
    if (!this.isSecureContext()) {
      return {
        success: false,
        error: "Biometric authentication requires a secure context (HTTPS or localhost)"
      };
    }

    if (this.isInIframe()) {
      return {
        success: false,
        error: "Biometric authentication may not work in iframes. Please try in a new window."
      };
    }
    
    try {
      // Get stored credential IDs for this user
      const credentialIds = await this.storageService.getCredentials(userId);
      
      if (!credentialIds || credentialIds.length === 0) {
        return {
          success: false,
          error: "No saved credentials found for this user"
        };
      }

      // Generate a random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create allowCredentials array from stored credentials
      const allowCredentials = credentialIds.map(credentialId => ({
        id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
        type: 'public-key' as PublicKeyCredentialType,
        transports: ['internal'] as AuthenticatorTransport[]
      }));

      // Create the credential request options
      const getCredentialOptions: PublicKeyCredentialRequestOptions = {
        challenge, 
        rpId: window.location.hostname,
        allowCredentials,
        userVerification: 'required' as UserVerificationRequirement,
        timeout: 60000
      };

      console.log("Verifying credential with options:", getCredentialOptions);

      // Request the credential
      const credential = await navigator.credentials.get({
        publicKey: getCredentialOptions
      }) as PublicKeyCredential;
      
      console.log("Credential verified:", credential);
      
      if (!credential) {
        return { success: false, error: "Authentication failed" };
      }
      
      // Extract the credential ID from the authenticated credential
      const authenticatedCredentialId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );
      
      // Update the last_used_at timestamp
      await this.storageService.updateLastUsed(userId, authenticatedCredentialId);

      return { success: true };
    } catch (error: any) {
      console.error("[WebAuthnProvider] Error verifying credential:", error);
      
      if (error.name === "NotAllowedError") {
        if (error.message.includes("origin") || error.message.includes("ancestors")) {
          return {
            success: false,
            error: "Security restriction: Biometric authentication is not allowed in this context"
          };
        } else {
          return {
            success: false,
            error: "Permission denied: The user did not consent to the verification"
          };
        }
      }
      
      return {
        success: false,
        error: error.message || "Unknown error occurred during verification"
      };
    }
  }

  /**
   * Remove stored biometric credential for a user
   * @param userId The user's unique identifier
   */
  async removeCredential(userId: string): Promise<boolean> {
    try {
      return await this.storageService.removeCredential(userId);
    } catch (error) {
      console.error("[WebAuthnProvider] Error removing credentials:", error);
      return false;
    }
  }

  /**
   * Check if user has registered biometrics
   * @param userId The user's unique identifier
   * @returns True if biometric credential exists
   */
  async hasRegisteredCredential(userId: string): Promise<boolean> {
    try {
      const credentials = await this.storageService.getCredentials(userId);
      return credentials.length > 0;
    } catch (error) {
      console.error("[WebAuthnProvider] Error checking for registered credentials:", error);
      return false;
    }
  }
}
