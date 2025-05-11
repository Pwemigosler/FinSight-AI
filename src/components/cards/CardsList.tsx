
import React from "react";
import { BankCard } from "@/contexts/auth";
import { CardItem } from "./CardItem";
import LinkBankCardDialog from "./LinkBankCardDialog";

interface CardsListProps {
  cards: BankCard[];
  onSetDefault: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

export const CardsList: React.FC<CardsListProps> = ({ 
  cards, 
  onSetDefault,
  onRemove
}) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">You haven't linked any bank cards yet.</p>
        <LinkBankCardDialog />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {cards.map((card) => (
          <CardItem 
            key={card.id}
            card={card}
            onSetDefault={onSetDefault}
            onRemove={onRemove}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <p className="text-sm text-gray-500">
          {cards.length} card{cards.length !== 1 ? 's' : ''} linked
        </p>
        <LinkBankCardDialog />
      </div>
    </>
  );
};
