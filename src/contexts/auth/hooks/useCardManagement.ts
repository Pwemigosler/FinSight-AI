
import { useState, useCallback } from "react";
import { BankCard } from "../types";
import { BankCardService } from "../services/BankCardService";

type UseCardManagementProps = {
  setLinkedCards: (cards: BankCard[]) => void;
  userId: string | null;
};

type UseCardManagementResult = {
  addBankCard: (card: Omit<BankCard, "id">) => Promise<void>;
  removeBankCard: (cardId: string) => Promise<void>;
  setDefaultCard: (cardId: string) => Promise<void>;
  refreshCards: () => Promise<void>;
  isLoading: boolean;
};

export const useCardManagement = ({
  setLinkedCards,
  userId
}: UseCardManagementProps): UseCardManagementResult => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Create card service only if user ID is available
  const getCardService = useCallback(() => {
    if (!userId) {
      throw new Error("Cannot manage cards without user ID");
    }
    return new BankCardService(userId);
  }, [userId]);

  const refreshCards = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const bankCardService = getCardService();
      const cards = await bankCardService.getCards();
      setLinkedCards(cards);
    } catch (error) {
      console.error("[useCardManagement] Error refreshing cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, setLinkedCards, getCardService]);

  const addBankCard = useCallback(async (card: Omit<BankCard, "id">) => {
    setIsLoading(true);
    try {
      const bankCardService = getCardService();
      const updatedCards = await bankCardService.addCard(card);
      setLinkedCards(updatedCards);
    } catch (error) {
      console.error("[useCardManagement] Error adding card:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setLinkedCards, getCardService]);

  const removeBankCard = useCallback(async (cardId: string) => {
    setIsLoading(true);
    try {
      const bankCardService = getCardService();
      const updatedCards = await bankCardService.removeCard(cardId);
      setLinkedCards(updatedCards);
    } catch (error) {
      console.error("[useCardManagement] Error removing card:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setLinkedCards, getCardService]);

  const setDefaultCard = useCallback(async (cardId: string) => {
    setIsLoading(true);
    try {
      const bankCardService = getCardService();
      const updatedCards = await bankCardService.setDefaultCard(cardId);
      setLinkedCards(updatedCards);
    } catch (error) {
      console.error("[useCardManagement] Error setting default card:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setLinkedCards, getCardService]);

  return {
    addBankCard,
    removeBankCard,
    setDefaultCard,
    refreshCards,
    isLoading
  };
};
