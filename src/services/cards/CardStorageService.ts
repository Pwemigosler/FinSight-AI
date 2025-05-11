
import { BankCard } from "@/contexts/auth/types";

export class CardStorageService {
  private readonly STORAGE_KEY = "finsight_linked_cards";

  getCards(): BankCard[] {
    try {
      const savedCards = localStorage.getItem(this.STORAGE_KEY);
      return savedCards ? JSON.parse(savedCards) : [];
    } catch (error) {
      console.error("[CardStorageService] Error loading cards:", error);
      return [];
    }
  }

  saveCards(cards: BankCard[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error("[CardStorageService] Error saving cards:", error);
    }
  }
}
