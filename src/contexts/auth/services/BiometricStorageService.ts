
import { supabase } from "@/integrations/supabase/client";
import { EncryptionService } from "./EncryptionService";

interface BiometricCredential {
  credentialId: string;
  encryptedData: string;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
    timezone?: string;
  };
}

interface EncryptedBiometricData {
  encrypted: string;
  salt: string;
  iv: string;
}

/**
 * Service for managing biometric credential storage in Supabase
 */
export class BiometricStorageService {
  private encryptionService: EncryptionService;
  
  constructor() {
    this.encryptionService = new EncryptionService();
  }
  
  /**
   * Stores a biometric credential in Supabase
   * @param userId The user ID
   * @param credentialId The credential ID
   * @param data The biometric credential data to encrypt and store
   * @returns A Promise resolving to a boolean indicating success
   */
  async storeCredential(
    userId: string, 
    credentialId: string, 
    data: string
  ): Promise<boolean> {
    try {
      // Get device information
      const deviceInfo = this.getDeviceInfo();
      
      // Encrypt the data
      const encryptedData = await this.encryptionService.encrypt(data, userId);
      
      // Store the encrypted data in Supabase
      const { error } = await supabase
        .from('user_biometrics')
        .upsert({
          user_id: userId,
          credential_id: credentialId,
          encrypted_data: JSON.stringify(encryptedData),
          device_info: deviceInfo
        }, {
          onConflict: 'user_id,credential_id'
        });
      
      if (error) {
        console.error("[BiometricStorageService] Error storing credential:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("[BiometricStorageService] Error encrypting/storing credential:", error);
      return false;
    }
  }
  
  /**
   * Retrieves all biometric credentials for a user
   * @param userId The user ID
   * @returns A Promise resolving to an array of credential IDs
   */
  async getCredentials(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_biometrics')
        .select('credential_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error("[BiometricStorageService] Error retrieving credentials:", error);
        return [];
      }
      
      return data.map(item => item.credential_id);
    } catch (error) {
      console.error("[BiometricStorageService] Error retrieving credentials:", error);
      return [];
    }
  }
  
  /**
   * Retrieves a specific biometric credential
   * @param userId The user ID
   * @param credentialId The credential ID
   * @returns A Promise resolving to the credential data or null
   */
  async getCredential(userId: string, credentialId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_biometrics')
        .select('encrypted_data')
        .eq('user_id', userId)
        .eq('credential_id', credentialId)
        .maybeSingle();
      
      if (error || !data) {
        console.error("[BiometricStorageService] Error retrieving credential:", error);
        return null;
      }
      
      // Parse the encrypted data
      const encryptedData: EncryptedBiometricData = JSON.parse(data.encrypted_data);
      
      // Decrypt the data
      const decryptedData = await this.encryptionService.decrypt(
        encryptedData.encrypted,
        encryptedData.salt,
        encryptedData.iv,
        userId
      );
      
      return decryptedData;
    } catch (error) {
      console.error("[BiometricStorageService] Error retrieving/decrypting credential:", error);
      return null;
    }
  }
  
  /**
   * Updates the 'last_used_at' timestamp for a credential
   * @param userId The user ID
   * @param credentialId The credential ID
   */
  async updateLastUsed(userId: string, credentialId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_biometrics')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('credential_id', credentialId);
      
      if (error) {
        console.error("[BiometricStorageService] Error updating last_used_at:", error);
      }
    } catch (error) {
      console.error("[BiometricStorageService] Error updating last_used_at:", error);
    }
  }
  
  /**
   * Removes a biometric credential
   * @param userId The user ID
   * @param credentialId The credential ID (optional, if not provided all credentials are removed)
   * @returns A Promise resolving to a boolean indicating success
   */
  async removeCredential(userId: string, credentialId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('user_biometrics')
        .delete()
        .eq('user_id', userId);
      
      if (credentialId) {
        query = query.eq('credential_id', credentialId);
      }
      
      const { error } = await query;
      
      if (error) {
        console.error("[BiometricStorageService] Error removing credential:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("[BiometricStorageService] Error removing credential:", error);
      return false;
    }
  }
  
  /**
   * Gets device information for additional security context
   * @returns Device information
   */
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}
