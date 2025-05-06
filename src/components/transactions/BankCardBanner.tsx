
import { CreditCard } from 'lucide-react';
import LinkBankCardDialog from '../LinkBankCardDialog';

type BankCardBannerProps = {
  linkedCardsCount: number;
};

const BankCardBanner = ({ linkedCardsCount }: BankCardBannerProps) => {
  if (linkedCardsCount > 0) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-md mb-4">
      <div className="flex items-center">
        <div className="mr-3">
          <CreditCard className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-medium text-blue-700">Link your bank cards</h3>
          <p className="text-sm text-blue-600">
            Connect your bank cards to automatically import your transactions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankCardBanner;
