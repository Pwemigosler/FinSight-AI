
import React from 'react';
import { BadgeDollarSign, CreditCard, PiggyBank, Wallet } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

const StatCardsSection = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Balance"
        value="$24,562.00"
        icon={<Wallet className="h-5 w-5" />}
        className="animate-fade-in"
      />
      <StatCard
        title="Monthly Income"
        value="$8,350.00"
        icon={<BadgeDollarSign className="h-5 w-5" />}
        trend={{ value: 12, isPositive: true }}
        className="animate-fade-in animate-delay-100"
      />
      <StatCard
        title="Monthly Spending"
        value="$4,300.00"
        icon={<CreditCard className="h-5 w-5" />}
        trend={{ value: 8, isPositive: false }}
        className="animate-fade-in animate-delay-200"
      />
      <StatCard
        title="Savings"
        value="$12,680.00"
        icon={<PiggyBank className="h-5 w-5" />}
        trend={{ value: 24, isPositive: true }}
        className="animate-fade-in animate-delay-300"
      />
    </div>
  );
};

export default StatCardsSection;
