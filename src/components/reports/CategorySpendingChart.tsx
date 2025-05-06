
import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { FilePieChart, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from './ReportTooltip';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategorySpendingChartProps {
  data: CategoryData[];
  onViewDetails?: () => void;
}

const CategorySpendingChart = ({ data, onViewDetails }: CategorySpendingChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FilePieChart className="h-5 w-5 text-finsight-purple" />
            Spending by Category
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
        <div className="h-[300px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.map((category) => (
            <div key={category.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
              <span className="text-xs truncate">{category.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySpendingChart;
