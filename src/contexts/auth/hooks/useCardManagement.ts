
import { BankCard } from "../types";
import { BankCardService } from "../BankCardService";
import React from "react";

export function useCardManagement(
  bankCardService: BankCardService, 
  setLinkedCards: React.Dispatch<React.SetStateAction<BankCard[]>>
) {
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

  return { addBankCard, removeBankCard, setDefaultCard };
}
