
import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { FileBarChart, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from './ReportTooltip';

interface SavingsChartProps {
  data: Array<{
    month: string;
    amount: number;
  }>;
  onViewDetails?: () => void;
}

const SavingsChart = ({ data, onViewDetails }: SavingsChartProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileBarChart className="h-5 w-5 text-finsight-purple" />
            Savings History
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-finsight-purple"
            onClick={onViewDetails}
          >
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#9b87f5"
                strokeWidth={2}
                name="Savings"
                dot={{ fill: '#9b87f5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#6E59A5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsChart;
