
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { CardsList } from './CardsList';
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
            <CardsList 
              cards={linkedCards}
              onSetDefault={setDefaultCard}
              onRemove={removeBankCard}
            />
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
