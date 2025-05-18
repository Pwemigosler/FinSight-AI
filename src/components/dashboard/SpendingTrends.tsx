
import React from 'react';
import { ArrowUpRight, LineChart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="font-bold text-finsight-purple">{`$${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

interface SpendingTrendsProps {
  data: Array<{ name: string; amount: number }>;
  onViewDetails?: () => void;
}

const SpendingTrends = ({ data, onViewDetails }: SpendingTrendsProps) => {
  return (
    <Card className="lg:col-span-2 animate-fade-in animate-delay-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Spending Trends</h2>
          <div 
            className="flex items-center gap-1 text-sm font-medium text-finsight-purple cursor-pointer hover:underline"
            onClick={onViewDetails}
          >
            View Details
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#9b87f5"
                strokeWidth={2}
                dot={{ fill: '#9b87f5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#6E59A5' }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default SpendingTrends;
