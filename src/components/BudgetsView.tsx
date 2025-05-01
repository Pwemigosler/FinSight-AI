
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { getBudgetCategories, addBudgetCategory } from '@/services/fundAllocationService';

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  amount: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
});

const BudgetsView = () => {
  const [budgets, setBudgets] = useState(getBudgetCategories());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Refresh budgets from service
  useEffect(() => {
    setBudgets(getBudgetCategories());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "0",
    },
  });

  const getTotalAllocated = () => budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const getTotalSpent = () => budgets.reduce((sum, budget) => sum + budget.spent, 0);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const amount = values.amount ? parseFloat(values.amount) : 0;
    
    const result = addBudgetCategory(values.name, amount);
    
    if (result.success) {
      toast.success("Category created", {
        description: result.message,
      });
      setBudgets(getBudgetCategories());
      setIsDialogOpen(false);
      form.reset();
    } else {
      toast.error("Failed to create category", {
        description: result.message,
      });
    }
  };

  const getIconForCategory = (index: number) => {
    const icons = [PiggyBank, TrendingUp, AlertTriangle];
    return icons[index % icons.length];
  };

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
                  <Button type="submit">Create Category</Button>
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
            <div className="space-y-4">
              {budgets.map((budget, index) => {
                const Icon = getIconForCategory(index);
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${budget.color}`} />
                        <span className="font-medium">{budget.name}</span>
                      </div>
                      <span className={budget.spent > budget.allocated ? 'text-finsight-red font-bold' : ''}>
                        ${budget.spent} <span className="text-gray-400">/ ${budget.allocated}</span>
                      </span>
                    </div>
                    <Progress 
                      value={(budget.spent / budget.allocated) * 100} 
                      className="h-2 bg-gray-100" 
                      indicatorClassName={budget.spent > budget.allocated ? 'bg-finsight-red' : budget.color}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetsView;
