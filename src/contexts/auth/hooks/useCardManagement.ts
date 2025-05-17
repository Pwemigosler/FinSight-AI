
import { useState, useCallback } from "react";
import { BankCard } from "../types";
import { BankCardService } from "../services/BankCardService";

type UseCardManagementProps = {
  setLinkedCards: (cards: BankCard[]) => void;
  userId: string | null;
};

type UseCardManagementResult = {
  addBankCard: (card: Omit<BankCard, "id" | "userId">) => Promise<BankCard | null>;
  removeBankCard: (cardId: string) => Promise<boolean>;
  setDefaultCard: (cardId: string) => Promise<boolean>;
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

  const addBankCard = useCallback(async (card: Omit<BankCard, "id" | "userId">): Promise<BankCard | null> => {
    setIsLoading(true);
    try {
      const bankCardService = getCardService();
      const cardWithUserId = { ...card, userId: userId || '' }; 
      const updatedCards = await bankCardService.addCard(cardWithUserId);
      setLinkedCards(updatedCards);
      
      // Return the newly added card (last in the array)
      return updatedCards.length > 0 ? updatedCards[updatedCards.length - 1] : null;
    } catch (error) {
      console.error("[useCardManagement] Error adding card:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setLinkedCards, getCardService, userId]);

  const removeBankCard = useCallback(async (cardId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const bankCardService = getCardService();
      const updatedCards = await bankCardService.removeCard(cardId);
      setLinkedCards(updatedCards);
      return true;
    } catch (error) {
      console.error("[useCardManagement] Error removing card:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setLinkedCards, getCardService]);

  const setDefaultCard = useCallback(async (cardId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const bankCardService = getCardService();
      const updatedCards = await bankCardService.setDefaultCard(cardId);
      setLinkedCards(updatedCards);
      return true;
    } catch (error) {
      console.error("[useCardManagement] Error setting default card:", error);
      return false;
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
