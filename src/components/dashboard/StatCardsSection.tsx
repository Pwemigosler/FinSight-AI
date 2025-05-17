
import React from 'react';
import { BadgeDollarSign, CreditCard, PiggyBank, Wallet } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/auth';

const StatCardsSection = () => {
  const { user } = useAuth();
  
  // Default values for authenticated users with no data
  const defaultValues = {
    balance: "$0.00",
    income: "$0.00",
    spending: "$0.00",
    savings: "$0.00"
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Balance"
        value={defaultValues.balance}
        icon={<Wallet className="h-5 w-5" />}
        className="animate-fade-in"
      />
      <StatCard
        title="Monthly Income"
        value={defaultValues.income}
        icon={<BadgeDollarSign className="h-5 w-5" />}
        trend={user ? { value: 0, isPositive: true } : { value: 12, isPositive: true }}
        className="animate-fade-in animate-delay-100"
      />
      <StatCard
        title="Monthly Spending"
        value={defaultValues.spending}
        icon={<CreditCard className="h-5 w-5" />}
        trend={user ? { value: 0, isPositive: true } : { value: 8, isPositive: false }}
        className="animate-fade-in animate-delay-200"
      />
      <StatCard
        title="Savings"
        value={defaultValues.savings}
        icon={<PiggyBank className="h-5 w-5" />}
        trend={user ? { value: 0, isPositive: true } : { value: 24, isPositive: true }}
        className="animate-fade-in animate-delay-300"
      />
    </div>
  );
};

export default StatCardsSection;
