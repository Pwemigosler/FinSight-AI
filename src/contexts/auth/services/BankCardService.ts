
import { toast } from "sonner";
import { BankCard } from "../types";
import { EncryptedCardStorageService } from "@/services/cards/EncryptedCardStorageService";

export class BankCardService {
  private storageService: EncryptedCardStorageService;
  private userId: string;

  constructor(userId: string) {
    this.storageService = new EncryptedCardStorageService();
    this.userId = userId;
    
    // Attempt to migrate existing cards when service is initialized
    if (this.userId) {
      this.migrateCards().catch(err => 
        console.error("[BankCardService] Error during cards migration:", err)
      );
    }
  }

  private async migrateCards(): Promise<void> {
    await this.storageService.migrateUnencryptedCards(this.userId);
  }

  async getCards(): Promise<BankCard[]> {
    if (!this.userId) return [];
    return this.storageService.getCards(this.userId);
  }

  async addCard(card: Omit<BankCard, "id">): Promise<BankCard[]> {
    try {
      if (!this.userId) throw new Error("User ID is required for encryption");
      
      const currentCards = await this.getCards();
      
      const newCard = {
        ...card,
        id: `card-${Date.now()}` // Generate a unique ID
      };
      
      const updatedCards = [...currentCards];
      
      // If this is the first card or isDefault is true, make it the default
      if (updatedCards.length === 0 || newCard.isDefault) {
        // Set all other cards to non-default
        updatedCards.forEach(c => c.isDefault = false);
      }
      
      updatedCards.push(newCard);
      await this.storageService.saveCards(updatedCards, this.userId);
      toast("Bank card linked successfully");
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error adding card:", error);
      toast("Failed to link bank card");
      return this.getCards();
    }
  }

  async removeCard(cardId: string): Promise<BankCard[]> {
    try {
      if (!this.userId) throw new Error("User ID is required for encryption");
      
      const currentCards = await this.getCards();
      const updatedCards = currentCards.filter(card => card.id !== cardId);
      
      // If we removed the default card and there are other cards, set a new default
      if (currentCards.find(c => c.id === cardId)?.isDefault && updatedCards.length > 0) {
        updatedCards[0].isDefault = true;
      }
      
      await this.storageService.saveCards(updatedCards, this.userId);
      toast("Bank card removed");
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error removing card:", error);
      toast("Failed to remove bank card");
      return this.getCards();
    }
  }

  async setDefaultCard(cardId: string): Promise<BankCard[]> {
    try {
      if (!this.userId) throw new Error("User ID is required for encryption");
      
      const currentCards = await this.getCards();
      const updatedCards = currentCards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }));
      
      await this.storageService.saveCards(updatedCards, this.userId);
      toast("Default payment method updated");
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error setting default card:", error);
      toast("Failed to update default payment method");
      return this.getCards();
    }
  }
}
