
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
   * Register a new biometric credential for the user
   * @param userId The user's unique identifier
   * @param username The user's display name or email
   * @returns A Promise that resolves when registration succeeds
   */
  async registerCredential(userId: string, username: string): Promise<boolean> {
    if (!this.isSupported()) {
      console.error("[BiometricService] WebAuthn is not supported in this browser");
      return false;
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

      // Create a credential
      const credential = await navigator.credentials.create({ 
        publicKey: createCredentialOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error("No credential returned");
      }

      // Store credential in localStorage for this demo
      // In a real app, this would be sent to the server
      const credentialId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );

      localStorage.setItem(`finsight_biometric_${userId}`, credentialId);
      
      return true;
    } catch (error) {
      console.error("[BiometricService] Error registering credential:", error);
      return false;
    }
  }

  /**
   * Verify a biometric login attempt
   * @param userId The user's unique identifier
   * @returns A Promise that resolves to true if authentication succeeds
   */
  async verifyCredential(userId: string): Promise<boolean> {
    if (!this.isSupported()) {
      console.error("[BiometricService] WebAuthn is not supported in this browser");
      return false;
    }
    
    try {
      // Check if we have a stored credential ID
      const credentialId = localStorage.getItem(`finsight_biometric_${userId}`);
      if (!credentialId) {
        console.error("[BiometricService] No saved credential found for this user");
        return false;
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

      return credential != null;
    } catch (error) {
      console.error("[BiometricService] Error verifying credential:", error);
      return false;
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
