import { ArrowUpRight, Edit, Check, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getBudgetCategories, updateCategoryAmount } from '@/services/fundAllocationService';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BudgetCategory } from '@/types/budget';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';

const BudgetOverview = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch categories whenever the component is mounted or shown
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          const data = await getBudgetCategories();
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated]);

  const startEditing = (categoryId: string, currentAmount: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentAmount.toString());
  };

  const saveEditing = async (categoryId: string) => {
    const newAmount = parseFloat(editValue);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid positive number",
      });
      return;
    }

    try {
      const result = await updateCategoryAmount(categoryId, newAmount);
      
      if (result.success) {
        toast.success("Budget updated", {
          description: result.message,
        });
        
        // Update local state
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === categoryId ? {...cat, allocated: newAmount} : cat
          )
        );
      } else {
        toast.error("Failed to update budget", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error updating budget", {
        description: (error as Error).message,
      });
    }
    
    setEditingCategory(null);
  };

  const handleViewAllClick = () => {
    navigate('/');
    // We need to wait for navigation to complete and then set the active view to "budgets"
    setTimeout(() => {
      const budgetsButton = document.querySelector('button[data-view="budgets"]');
      if (budgetsButton) {
        (budgetsButton as HTMLButtonElement).click();
      }
    }, 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Budget Overview</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Please login to view your budgets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Budget Overview</h2>
        <button 
          onClick={handleViewAllClick}
          className="flex items-center gap-1 text-sm font-medium text-finsight-purple hover:underline"
        >
          View All
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-finsight-purple" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No budget categories found.</p>
        </div>
      ) : (
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
                    <span className={Number(category.spent) > Number(category.allocated) ? 'text-finsight-red font-medium' : ''}>
                      ${category.spent} <span className="text-gray-400">/ ${category.allocated}</span>
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => startEditing(category.id, Number(category.allocated))}
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <Progress 
                value={(Number(category.spent) / Number(category.allocated)) * 100} 
                className="h-2 bg-gray-100" 
                indicatorClassName={Number(category.spent) > Number(category.allocated) ? 'bg-finsight-red' : category.color}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
