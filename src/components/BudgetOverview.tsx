
import { ArrowUpRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getBudgetCategories } from '@/services/fundAllocationService';
import { useState, useEffect } from 'react';

const BudgetOverview = () => {
  const [categories, setCategories] = useState(getBudgetCategories());

  // Update categories whenever the component is mounted or shown
  useEffect(() => {
    setCategories(getBudgetCategories());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Budget Overview</h2>
        <div className="flex items-center gap-1 text-sm font-medium text-finsight-purple">
          View All
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-4">
        {categories.slice(0, 5).map((category) => (
          <div key={category.id} className="space-y-1">
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
