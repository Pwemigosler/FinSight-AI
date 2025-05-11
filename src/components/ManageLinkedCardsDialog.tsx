
import React from 'react';
import { useAuth } from '@/contexts/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, Trash2 } from "lucide-react";
import LinkBankCardDialog from './LinkBankCardDialog';

interface ManageLinkedCardsDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ManageLinkedCardsDialog: React.FC<ManageLinkedCardsDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { linkedCards, removeBankCard, setDefaultCard } = useAuth();
  const [open, setOpen] = React.useState(isOpen || false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = React.useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  // Helper function to get last 4 digits from card number
  const getLast4Digits = (cardNumber: string) => {
    return cardNumber.slice(-4);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Cards
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Manage Linked Bank Cards</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {linkedCards.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You haven't linked any bank cards yet.</p>
                <LinkBankCardDialog 
                  isOpen={isAddCardDialogOpen} 
                  onOpenChange={setIsAddCardDialogOpen}
                />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {linkedCards.map((card) => (
                    <div 
                      key={card.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
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
                            onClick={() => setDefaultCard(card.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBankCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <p className="text-sm text-gray-500">
                    {linkedCards.length} card{linkedCards.length !== 1 ? 's' : ''} linked
                  </p>
                  <LinkBankCardDialog />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {isAddCardDialogOpen && (
        <LinkBankCardDialog 
          isOpen={isAddCardDialogOpen}
          onOpenChange={setIsAddCardDialogOpen}
        />
      )}
    </>
  );
};

export default ManageLinkedCardsDialog;
