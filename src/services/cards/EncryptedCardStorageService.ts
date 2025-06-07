import { debugLog } from '@/utils/debug';

import { BankCard } from "@/contexts/auth/types";
import { EncryptionService } from "@/contexts/auth/services/EncryptionService";

interface EncryptedCardData {
  id: string;
  encryptedData: string;
  salt: string;
  iv: string;
  isDefault: boolean; // This field remains unencrypted for easier access
}

export class EncryptedCardStorageService {
  private readonly STORAGE_KEY = "finsight_linked_cards";
  private encryptionService: EncryptionService;
  
  constructor() {
    this.encryptionService = new EncryptionService();
  }

  async getCards(userId: string): Promise<BankCard[]> {
    try {
      const savedEncryptedCards = localStorage.getItem(this.STORAGE_KEY);
      if (!savedEncryptedCards) return [];
      
      const encryptedCards = JSON.parse(savedEncryptedCards) as EncryptedCardData[];
      
      // Decrypt all cards
      const decryptedCards: BankCard[] = await Promise.all(
        encryptedCards.map(async (encCard) => {
          // For cards that aren't encrypted yet (during migration)
          if (!encCard.encryptedData) {
            return encCard as unknown as BankCard;
          }
          
          try {
            const decryptedData = await this.encryptionService.decrypt(
              encCard.encryptedData,
              encCard.salt,
              encCard.iv,
              userId
            );
            
            const cardData = JSON.parse(decryptedData);
            
            // Combine the decrypted data with the unencrypted id and isDefault flag
            return {
              ...cardData,
              id: encCard.id,
              isDefault: encCard.isDefault
            };
          } catch (error) {
            console.error("[EncryptedCardStorageService] Error decrypting card:", error);
            return null;
          }
        })
      );
      
      // Filter out any cards that failed to decrypt
      return decryptedCards.filter(Boolean) as BankCard[];
    } catch (error) {
      console.error("[EncryptedCardStorageService] Error loading cards:", error);
      return [];
    }
  }

  async saveCards(cards: BankCard[], userId: string): Promise<void> {
    try {
      const encryptedCards: EncryptedCardData[] = await Promise.all(
        cards.map(async (card) => {
          // Extract sensitive data for encryption
          const { id, isDefault, ...sensitiveData } = card;
          
          // Encrypt the sensitive data
          const encrypted = await this.encryptionService.encrypt(
            JSON.stringify(sensitiveData), 
            userId
          );
          
          // Return encrypted card format
          return {
            id,
            isDefault,
            encryptedData: encrypted.encrypted,
            salt: encrypted.salt,
            iv: encrypted.iv
          };
        })
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encryptedCards));
    } catch (error) {
      console.error("[EncryptedCardStorageService] Error saving cards:", error);
    }
  }
  
  /**
   * Migrates existing unencrypted cards to encrypted format
   */
  async migrateUnencryptedCards(userId: string): Promise<void> {
    try {
      const savedCards = localStorage.getItem(this.STORAGE_KEY);
      if (!savedCards) return;
      
      const existingCards = JSON.parse(savedCards);
      
      // Check if cards are already encrypted
      const needsMigration = existingCards.length > 0 && 
        !existingCards[0].encryptedData;
      
      // If migration is needed, encrypt all cards
      if (needsMigration) {
        debugLog("[EncryptedCardStorageService] Migrating unencrypted cards...");
        await this.saveCards(existingCards as BankCard[], userId);
        debugLog("[EncryptedCardStorageService] Migration complete");
      }
    } catch (error) {
      console.error("[EncryptedCardStorageService] Error migrating cards:", error);
    }
  }
}
