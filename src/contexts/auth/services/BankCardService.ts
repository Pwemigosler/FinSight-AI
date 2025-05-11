
import { toast } from "sonner";
import { BankCard } from "../types";
import { CardStorageService } from "@/services/cards/CardStorageService";
import { CardNotificationService } from "@/services/cards/CardNotificationService";

export class BankCardService {
  private storageService: CardStorageService;
  private notificationService: CardNotificationService;

  constructor() {
    this.storageService = new CardStorageService();
    this.notificationService = new CardNotificationService();
  }

  getCards(): BankCard[] {
    return this.storageService.getCards();
  }

  addCard(card: Omit<BankCard, "id">): BankCard[] {
    try {
      const currentCards = this.getCards();
      
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
      this.storageService.saveCards(updatedCards);
      this.notificationService.notifyCardAdded();
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error adding card:", error);
      this.notificationService.notifyError("link bank card");
      return this.getCards();
    }
  }

  removeCard(cardId: string): BankCard[] {
    try {
      const currentCards = this.getCards();
      const updatedCards = currentCards.filter(card => card.id !== cardId);
      
      // If we removed the default card and there are other cards, set a new default
      if (currentCards.find(c => c.id === cardId)?.isDefault && updatedCards.length > 0) {
        updatedCards[0].isDefault = true;
      }
      
      this.storageService.saveCards(updatedCards);
      this.notificationService.notifyCardRemoved();
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error removing card:", error);
      this.notificationService.notifyError("remove bank card");
      return this.getCards();
    }
  }

  setDefaultCard(cardId: string): BankCard[] {
    try {
      const currentCards = this.getCards();
      const updatedCards = currentCards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }));
      
      this.storageService.saveCards(updatedCards);
      this.notificationService.notifyDefaultChanged();
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error setting default card:", error);
      this.notificationService.notifyError("update default payment method");
      return this.getCards();
    }
  }
}
