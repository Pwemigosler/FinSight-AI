
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BillBanner: React.FC = () => {
  const { linkedCards } = useAuth();
  
  // If user has linked cards, don't show the banner
  if (linkedCards.length > 0) return null;

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="mr-3">
          <CreditCard className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-grow">
          <h3 className="font-medium text-blue-700">Link your bank cards</h3>
          <p className="text-sm text-blue-600">
            Connect your bank cards to automatically detect recurring bills.
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          Link Cards
        </Button>
      </div>
    </div>
  );
};

export default BillBanner;
