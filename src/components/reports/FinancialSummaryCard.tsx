
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FinancialSummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const FinancialSummaryCard = ({ title, value, subtitle }: FinancialSummaryCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-3xl font-bold text-finsight-purple">
          {value}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;
