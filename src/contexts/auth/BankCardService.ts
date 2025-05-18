
import { toast } from "sonner";
import { BankCard } from "./types";

export class BankCardService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getCards(): Promise<BankCard[]> {
    return new Promise((resolve) => {
      try {
        const savedCards = localStorage.getItem("finsight_linked_cards");
        const cards = savedCards ? JSON.parse(savedCards) : [];
        // Filter by user ID if available
        const filteredCards = this.userId 
          ? cards.filter((card: BankCard) => card.userId === this.userId)
          : cards;
        resolve(filteredCards);
      } catch (error) {
        console.error("[BankCardService] Error loading cards:", error);
        resolve([]);
      }
    });
  }

  addCard(card: Omit<BankCard, "id">): Promise<BankCard[]> {
    return new Promise((resolve) => {
      try {
        this.getCards().then(currentCards => {
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
          
          resolve(updatedCards);
        });
      } catch (error) {
        console.error("[BankCardService] Error adding card:", error);
        toast("Failed to link bank card");
        this.getCards().then(resolve);
      }
    });
  }

  removeCard(cardId: string): Promise<BankCard[]> {
    return new Promise((resolve) => {
      try {
        this.getCards().then(currentCards => {
          const updatedCards = currentCards.filter(card => card.id !== cardId);
          
          // If we removed the default card and there are other cards, set a new default
          if (currentCards.find(c => c.id === cardId)?.isDefault && updatedCards.length > 0) {
            updatedCards[0].isDefault = true;
          }
          
          localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
          toast("Bank card removed");
          
          resolve(updatedCards);
        });
      } catch (error) {
        console.error("[BankCardService] Error removing card:", error);
        toast("Failed to remove bank card");
        this.getCards().then(resolve);
      }
    });
  }

  setDefaultCard(cardId: string): Promise<BankCard[]> {
    return new Promise((resolve) => {
      try {
        this.getCards().then(currentCards => {
          const updatedCards = currentCards.map(card => ({
            ...card,
            isDefault: card.id === cardId
          }));
          
          localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
          toast("Default payment method updated");
          
          resolve(updatedCards);
        });
      } catch (error) {
        console.error("[BankCardService] Error setting default card:", error);
        toast("Failed to update default payment method");
        this.getCards().then(resolve);
      }
    });
  }
}
