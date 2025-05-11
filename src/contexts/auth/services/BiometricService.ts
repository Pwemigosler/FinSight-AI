
/**
 * Service for handling WebAuthn (biometric authentication) operations
 */
export class BiometricService {
  /**
   * Check if WebAuthn is supported in the current browser
   */
  isSupported(): boolean {
    return window.PublicKeyCredential !== undefined;
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
  async registerCredential(userId: string, username: string): Promise<{success: boolean; error?: string}> {
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
        attestation: "none" as AttestationConveyancePreference // Type cast to the correct enum type
      };

      try {
        // Create a credential
        const credential = await navigator.credentials.create({ 
          publicKey: createCredentialOptions
        }) as PublicKeyCredential;

        if (!credential) {
          return {
            success: false,
            error: "No credential returned"
          };
        }

        // Store credential in localStorage for this demo
        // In a real app, this would be sent to the server
        const credentialId = btoa(
          String.fromCharCode(...new Uint8Array(credential.rawId))
        );

        localStorage.setItem(`finsight_biometric_${userId}`, credentialId);
        
        return { success: true };
      } catch (error: any) {
        console.error("[BiometricService] Error creating credential:", error);
        
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
      console.error("[BiometricService] Error registering credential:", error);
      
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
  async verifyCredential(userId: string): Promise<{success: boolean; error?: string}> {
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
      // Check if we have a stored credential ID
      const credentialId = localStorage.getItem(`finsight_biometric_${userId}`);
      if (!credentialId) {
        return {
          success: false,
          error: "No saved credential found for this user"
        };
      }

      // Generate a random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create the credential request options
      const getCredentialOptions: PublicKeyCredentialRequestOptions = {
        challenge, 
        rpId: window.location.hostname,
        allowCredentials: [{
          id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
          type: 'public-key',
          transports: ['internal'] as AuthenticatorTransport[] // Type cast to the correct array type
        }],
        userVerification: 'required' as UserVerificationRequirement, // Type cast to the correct enum type
        timeout: 60000
      };

      // Request the credential
      const credential = await navigator.credentials.get({
        publicKey: getCredentialOptions
      });

      return { success: credential != null };
    } catch (error: any) {
      console.error("[BiometricService] Error verifying credential:", error);
      
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
  removeCredential(userId: string): void {
    localStorage.removeItem(`finsight_biometric_${userId}`);
  }

  /**
   * Check if user has registered biometrics
   * @param userId The user's unique identifier
   * @returns True if biometric credential exists
   */
  hasRegisteredCredential(userId: string): boolean {
    return !!localStorage.getItem(`finsight_biometric_${userId}`);
  }
}
