
import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid 
} from 'recharts';
import { FileBarChart, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from './ReportTooltip';

interface MonthlyExpensesChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  onViewDetails?: () => void;
}

const MonthlyExpensesChart = ({ data, onViewDetails }: MonthlyExpensesChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileBarChart className="h-5 w-5 text-finsight-purple" />
            Income vs. Expenses
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
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar name="Income" dataKey="income" fill="#9b87f5" />
              <Bar name="Expenses" dataKey="expenses" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpensesChart;
