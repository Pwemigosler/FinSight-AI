
import React from "react";
import { Check, CreditCard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankCard } from "@/contexts/auth";

interface CardItemProps {
  card: BankCard;
  onSetDefault: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onSetDefault, onRemove }) => {
  // Helper function to mask card number except for last 4 digits
  const getMaskedCardNumber = (cardNumber: string) => {
    if (!cardNumber || cardNumber.length < 4) return "••••";
    const lastFourDigits = cardNumber.slice(-4);
    return `•••• •••• •••• ${lastFourDigits}`;
  };
  
  // Get last 4 digits from card number
  const getLast4Digits = (cardNumber: string) => {
    return cardNumber.slice(-4);
  };
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <CreditCard className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium">
            {card.cardName} •••• {getLast4Digits(card.cardNumber)}
          </p>
          <p className="text-sm text-gray-500">
            {card.cardType || 'Card'} {card.isDefault && 
              <span className="inline-flex items-center ml-2 text-green-600">
                <Check className="h-3 w-3 mr-1" /> Default
              </span>
            }
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {!card.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(card.id)}
          >
            Set Default
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(card.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};
