
import { BudgetCategory } from "@/types/budget";

// Mock database of budget categories that would normally come from an API
export let budgetCategories: BudgetCategory[] = [
  {
    id: 'housing',
    name: 'Housing',
    allocated: 2000,
    spent: 1800,
    color: 'bg-finsight-purple',
  },
  {
    id: 'food',
    name: 'Food',
    allocated: 800,
    spent: 650,
    color: 'bg-finsight-blue',
  },
  {
    id: 'transportation',
    name: 'Transportation',
    allocated: 500,
    spent: 320,
    color: 'bg-finsight-orange',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    allocated: 400,
    spent: 410,
    color: 'bg-finsight-red',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    allocated: 350,
    spent: 310,
    color: 'bg-finsight-green',
  },
  {
    id: 'savings',
    name: 'Savings',
    allocated: 1000,
    spent: 800,
    color: 'bg-finsight-blue',
  },
  {
    id: 'bills',
    name: 'Bills',
    allocated: 500,
    spent: 450,
    color: 'bg-finsight-purple',
  },
  {
    id: 'spending',
    name: 'Weekly Spending',
    allocated: 300,
    spent: 200,
    color: 'bg-finsight-green',
  },
];
