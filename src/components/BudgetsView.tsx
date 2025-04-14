
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, TrendingUp, AlertTriangle } from 'lucide-react';

const budgetCategories = [
  {
    name: 'Housing',
    allocated: 2000,
    spent: 1800,
    color: 'bg-finsight-purple',
    icon: PiggyBank,
  },
  {
    name: 'Food',
    allocated: 800,
    spent: 650,
    color: 'bg-finsight-blue',
    icon: TrendingUp,
  },
  {
    name: 'Transportation',
    allocated: 500,
    spent: 320,
    color: 'bg-finsight-orange',
    icon: AlertTriangle,
  },
  {
    name: 'Entertainment',
    allocated: 400,
    spent: 410,
    color: 'bg-finsight-red',
    icon: PiggyBank,
  },
  {
    name: 'Utilities',
    allocated: 350,
    spent: 310,
    color: 'bg-finsight-green',
    icon: TrendingUp,
  },
];

const BudgetsView = () => {
  const [budgets] = useState(budgetCategories);

  const getTotalAllocated = () => budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const getTotalSpent = () => budgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Monthly Budgets</h1>

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
              {budgets.map((budget) => (
                <div key={budget.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <budget.icon className={`h-5 w-5 ${budget.color}`} />
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetsView;

