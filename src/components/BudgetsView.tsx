import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, TrendingUp, AlertTriangle, Plus, Edit, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { getBudgetCategories, addBudgetCategory, updateCategoryAmount, BudgetCategory } from '@/services/fundAllocationService';
import { useAuth } from '@/contexts/auth';

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  amount: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
});

const editFormSchema = z.object({
  amount: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
});

const BudgetsView = () => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Fetch budgets from Supabase
  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const data = await getBudgetCategories();
        setBudgets(data);
      } else {
        setBudgets([]);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budgets", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load budgets on mount and when auth state changes
  useEffect(() => {
    fetchBudgets();
  }, [isAuthenticated]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "0",
    },
  });

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      amount: "0",
    },
  });

  const getTotalAllocated = () => budgets.reduce((sum, budget) => sum + Number(budget.allocated), 0);
  const getTotalSpent = () => budgets.reduce((sum, budget) => sum + Number(budget.spent), 0);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const amount = values.amount ? parseFloat(values.amount) : 0;
    
    try {
      const result = await addBudgetCategory(values.name, amount);
      
      if (result.success) {
        toast.success("Category created", {
          description: result.message,
        });
        fetchBudgets(); // Refresh the budgets
        setIsDialogOpen(false);
        form.reset();
      } else {
        toast.error("Failed to create category", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error creating category", {
        description: (error as Error).message,
      });
    }
  };

  const startEditing = (category: BudgetCategory) => {
    setEditingCategory(category.id);
    setEditValue(category.allocated.toString());
    editForm.setValue("amount", category.allocated.toString());
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
        fetchBudgets(); // Refresh the budgets
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

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  const getIconForCategory = (index: number) => {
    const icons = [PiggyBank, TrendingUp, AlertTriangle];
    return icons[index % icons.length];
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-bold mb-4">Login Required</h2>
              <p className="text-gray-500 mb-4">Please login to view and manage your budgets.</p>
              <Button onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Monthly Budgets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget Category</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Travel, Healthcare" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Budget Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0.00" 
                          {...field} 
                          type="number"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Category"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Budget Overview</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Allocated</span>
                  <span>${getTotalAllocated()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Spent</span>
                  <span>${getTotalSpent()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Remaining Budget</span>
                  <span>${getTotalAllocated() - getTotalSpent()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Budget Categories */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Budget Breakdown</h2>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-finsight-purple" />
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No budget categories found.</p>
                <p className="text-sm mt-2">Create your first budget category to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget, index) => {
                  const Icon = getIconForCategory(index);
                  const isEditing = editingCategory === budget.id;
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${budget.color}`} />
                          <span className="font-medium">{budget.name}</span>
                        </div>
                        
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 h-8 text-sm"
                              step="0.01"
                              min="0"
                            />
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => saveEditing(budget.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={Number(budget.spent) > Number(budget.allocated) ? 'text-finsight-red font-bold' : ''}>
                              ${budget.spent} <span className="text-gray-400">/ ${budget.allocated}</span>
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => startEditing(budget)}
                              className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <Progress 
                        value={(Number(budget.spent) / Number(budget.allocated)) * 100} 
                        className="h-2 bg-gray-100" 
                        indicatorClassName={Number(budget.spent) > Number(budget.allocated) ? 'bg-finsight-red' : budget.color}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetsView;
