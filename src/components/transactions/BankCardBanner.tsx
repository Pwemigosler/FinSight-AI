
import { CreditCard } from 'lucide-react';
import LinkBankCardDialog from '../LinkBankCardDialog';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

type BankCardBannerProps = {
  linkedCardsCount: number;
};

const BankCardBanner = ({ linkedCardsCount }: BankCardBannerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (linkedCardsCount > 0) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-md mb-4">
      <div className="flex items-center">
        <div className="mr-3">
          <CreditCard className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex-grow">
          <h3 className="font-medium text-blue-700">Link your bank cards</h3>
          <p className="text-sm text-blue-600">
            Connect your bank cards to automatically import your transactions and detect recurring bills.
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={() => setIsDialogOpen(true)}
        >
          Link Cards
        </Button>
      </div>
      
      <LinkBankCardDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};

export default BankCardBanner;
