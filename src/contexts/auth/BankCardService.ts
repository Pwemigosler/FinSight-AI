
import { toast } from "sonner";
import { BankCard } from "./types";

export class BankCardService {
  getCards(): BankCard[] {
    try {
      const savedCards = localStorage.getItem("finsight_linked_cards");
      return savedCards ? JSON.parse(savedCards) : [];
    } catch (error) {
      console.error("[BankCardService] Error loading cards:", error);
      return [];
    }
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
      localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
      toast("Bank card linked successfully");
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error adding card:", error);
      toast("Failed to link bank card");
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
      
      localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
      toast("Bank card removed");
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error removing card:", error);
      toast("Failed to remove bank card");
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
      
      localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
      toast("Default payment method updated");
      
      return updatedCards;
    } catch (error) {
      console.error("[BankCardService] Error setting default card:", error);
      toast("Failed to update default payment method");
      return this.getCards();
    }
  }
}
