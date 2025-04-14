
import { ArrowUpRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const categories = [
  {
    name: 'Housing',
    allocated: 2000,
    spent: 1800,
    color: 'bg-finsight-purple',
  },
  {
    name: 'Food',
    allocated: 800,
    spent: 650,
    color: 'bg-finsight-blue',
  },
  {
    name: 'Transportation',
    allocated: 500,
    spent: 320,
    color: 'bg-finsight-orange',
  },
  {
    name: 'Entertainment',
    allocated: 400,
    spent: 410,
    color: 'bg-finsight-red',
  },
  {
    name: 'Utilities',
    allocated: 350,
    spent: 310,
    color: 'bg-finsight-green',
  },
];

const BudgetOverview = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">August Budget</h2>
        <div className="flex items-center gap-1 text-sm font-medium text-finsight-purple">
          View All
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{category.name}</span>
              <span className={category.spent > category.allocated ? 'text-finsight-red font-medium' : ''}>
                ${category.spent} <span className="text-gray-400">/ ${category.allocated}</span>
              </span>
            </div>
            <Progress 
              value={(category.spent / category.allocated) * 100} 
              className="h-2 bg-gray-100" 
              indicatorClassName={category.spent > category.allocated ? 'bg-finsight-red' : category.color}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetOverview;
