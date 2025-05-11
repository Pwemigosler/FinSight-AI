
import { BankCard } from "../types";
import { BankCardService } from "../BankCardService";

type UseCardManagementProps = {
  setLinkedCards: (cards: BankCard[]) => void;
};

type UseCardManagementResult = {
  addBankCard: (card: Omit<BankCard, "id">) => void;
  removeBankCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;
};

export const useCardManagement = ({
  setLinkedCards
}: UseCardManagementProps): UseCardManagementResult => {
  const bankCardService = new BankCardService();

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
