
import { useState, useCallback } from "react";
import { BankCard } from "../types";
import { BankCardService } from "../services/BankCardService";

type UseCardManagementProps = {
  setLinkedCards: (cards: BankCard[]) => void;
  userId: string | null;
};

export const useCardManagement = ({ 
  setLinkedCards, 
  userId 
}: UseCardManagementProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const cardService = new BankCardService(userId || '');

  const refreshCards = useCallback(async () => {
    if (!userId) return [];
    
    setIsLoading(true);
    try {
      const cards = await cardService.getCards();
      setLinkedCards(cards);
      return cards;
    } catch (error) {
      console.error("[useCardManagement] Error refreshing cards:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, setLinkedCards, cardService]);

  const addBankCard = async (cardDetails: Omit<BankCard, "id" | "userId">): Promise<BankCard | null> => {
    if (!userId) {
      console.error("[useCardManagement] Cannot add card: No user ID");
      return null;
    }
    
    setIsLoading(true);
    try {
      const updatedCards = await cardService.addCard({
        ...cardDetails,
        userId
      });
      
      if (updatedCards && updatedCards.length > 0) {
        // Find the newly added card (should be the last one)
        const newCard = updatedCards[updatedCards.length - 1];
        // Refresh the card list to include the new card
        await refreshCards();
        return newCard;
      }
      return null;
    } catch (error) {
      console.error("[useCardManagement] Error adding card:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeBankCard = async (cardId: string): Promise<boolean> => {
    if (!userId) {
      console.error("[useCardManagement] Cannot remove card: No user ID");
      return false;
    }
    
    setIsLoading(true);
    try {
      const updatedCards = await cardService.removeCard(cardId);
      // If there are cards, we succeeded
      const success = Array.isArray(updatedCards);
      if (success) {
        // If removal is successful, refresh the card list
        await refreshCards();
      }
      return success;
    } catch (error) {
      console.error("[useCardManagement] Error removing card:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultCard = async (cardId: string): Promise<boolean> => {
    if (!userId) {
      console.error("[useCardManagement] Cannot set default card: No user ID");
      return false;
    }
    
    setIsLoading(true);
    try {
      const updatedCards = await cardService.setDefaultCard(cardId);
      // If there are cards, we succeeded
      const success = Array.isArray(updatedCards);
      if (success) {
        // If setting default is successful, refresh the card list
        await refreshCards();
      }
      return success;
    } catch (error) {
      console.error("[useCardManagement] Error setting default card:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addBankCard,
    removeBankCard,
    setDefaultCard,
    refreshCards,
    isLoading
  };
};
