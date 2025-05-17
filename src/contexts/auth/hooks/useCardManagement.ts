
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
  const cardService = new BankCardService();

  const refreshCards = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const cards = await cardService.getCards(userId);
      setLinkedCards(cards);
      return cards;
    } catch (error) {
      console.error("[useCardManagement] Error refreshing cards:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, setLinkedCards]);

  const addBankCard = async (cardDetails: Omit<BankCard, "id" | "userId">): Promise<BankCard | null> => {
    if (!userId) {
      console.error("[useCardManagement] Cannot add card: No user ID");
      return null;
    }
    
    setIsLoading(true);
    try {
      const newCard = await cardService.addCard({
        ...cardDetails,
        userId
      });
      
      if (newCard) {
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
      const success = await cardService.removeCard(cardId, userId);
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
      const success = await cardService.setDefaultCard(cardId, userId);
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
