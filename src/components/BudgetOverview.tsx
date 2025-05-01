
import { ArrowUpRight, Edit, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getBudgetCategories, updateCategoryAmount } from '@/services/fundAllocationService';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BudgetOverview = () => {
  const [categories, setCategories] = useState(getBudgetCategories());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Update categories whenever the component is mounted or shown
  useEffect(() => {
    setCategories(getBudgetCategories());
  }, []);

  const startEditing = (categoryId: string, currentAmount: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentAmount.toString());
  };

  const saveEditing = (categoryId: string) => {
    const newAmount = parseFloat(editValue);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid positive number",
      });
      return;
    }

    const result = updateCategoryAmount(categoryId, newAmount);
    
    if (result.success) {
      toast.success("Budget updated", {
        description: result.message,
      });
      setCategories(getBudgetCategories());
    } else {
      toast.error("Failed to update budget", {
        description: result.message,
      });
    }
    
    setEditingCategory(null);
  };

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
              
              {editingCategory === category.id ? (
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-20 h-7 text-xs"
                    step="0.01"
                    min="0"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => saveEditing(category.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={category.spent > category.allocated ? 'text-finsight-red font-medium' : ''}>
                    ${category.spent} <span className="text-gray-400">/ ${category.allocated}</span>
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => startEditing(category.id, category.allocated)}
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
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
