
/**
 * Service for handling encryption and decryption of sensitive data
 */
export class EncryptionService {
  /**
   * Generates a cryptographic key from a password and salt using PBKDF2
   * @param password The password to derive the key from
   * @param salt The salt for key derivation
   * @returns A Promise resolving to a CryptoKey
   */
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import the password as a key
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive a key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Encrypts data using AES-GCM
   * @param data The data to encrypt
   * @param userId The user ID to use as part of the encryption key
   * @returns A Promise resolving to the encrypted data and parameters needed for decryption
   */
  async encrypt(data: string, userId: string): Promise<{
    encrypted: string;
    salt: string;
    iv: string;
  }> {
    // Generate a random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // The userId will be used as part of our encryption password
    // This helps bind the encryption to the specific user
    const password = `${userId}-biometric-secret-key`;
    
    // Derive a key for encryption
    const key = await this.deriveKey(password, salt);
    
    // Encrypt the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    );
    
    // Convert binary data to base64 strings for storage
    return {
      encrypted: this.arrayBufferToBase64(encryptedBuffer),
      salt: this.arrayBufferToBase64(salt),
      iv: this.arrayBufferToBase64(iv)
    };
  }
  
  /**
   * Decrypts data using AES-GCM
   * @param encrypted The encrypted data
   * @param salt The salt used for key derivation
   * @param iv The initialization vector used for encryption
   * @param userId The user ID used as part of the encryption key
   * @returns A Promise resolving to the decrypted data
   */
  async decrypt(encrypted: string, salt: string, iv: string, userId: string): Promise<string> {
    // Convert base64 strings back to binary data
    const encryptedBuffer = this.base64ToArrayBuffer(encrypted);
    const saltBuffer = this.base64ToArrayBuffer(salt);
    const ivBuffer = this.base64ToArrayBuffer(iv);
    
    // The userId must be the same one used during encryption
    const password = `${userId}-biometric-secret-key`;
    
    // Derive the same key for decryption
    const key = await this.deriveKey(password, saltBuffer);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      key,
      encryptedBuffer
    );
    
    // Convert the decrypted data back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
  
  /**
   * Converts an ArrayBuffer to a base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Converts a base64 string to an ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
