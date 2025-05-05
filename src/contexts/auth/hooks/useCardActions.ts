
import { BankCard } from "../types";
import { BankCardService } from "../BankCardService";
import { useRef } from "react";

export const useCardActions = (setLinkedCards: (cards: BankCard[]) => void) => {
  const bankCardService = useRef(new BankCardService()).current;

  const addBankCard = (card: Omit<BankCard, "id">) => {
    const updatedCards = bankCardService.addCard(card);
    setLinkedCards(updatedCards);
  };

  const removeBankCard = (cardId: string) => {
    const updatedCards = bankCardService.removeCard(cardId);
    setLinkedCards(updatedCards);
  };

  const setDefaultCard = (cardId: string) => {
    const updatedCards = bankCardService.setDefaultCard(cardId);
    setLinkedCards(updatedCards);
  };

  return {
    addBankCard,
    removeBankCard,
    setDefaultCard
  };
};
