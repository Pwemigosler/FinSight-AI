
import { BudgetCategory } from "@/types/budget";

// Mock database of budget categories that would normally come from an API
export let budgetCategories: BudgetCategory[] = [
  {
    id: 'housing',
    name: 'Housing',
    allocated: 2000,
    spent: 1800,
    color: 'bg-finsight-purple',
    user_id: 'mock-user-id', // Added user_id field
  },
  {
    id: 'food',
    name: 'Food',
    allocated: 800,
    spent: 650,
    color: 'bg-finsight-blue',
    user_id: 'mock-user-id', // Added user_id field
  },
  {
    id: 'transportation',
    name: 'Transportation',
    allocated: 500,
    spent: 320,
    color: 'bg-finsight-orange',
    user_id: 'mock-user-id', // Added user_id field
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    allocated: 400,
    spent: 410,
    color: 'bg-finsight-red',
    user_id: 'mock-user-id', // Added user_id field
  },
  {
    id: 'utilities',
    name: 'Utilities',
    allocated: 350,
    spent: 310,
    color: 'bg-finsight-green',
    user_id: 'mock-user-id', // Added user_id field
  },
  {
    id: 'savings',
    name: 'Savings',
    allocated: 1000,
    spent: 800,
    color: 'bg-finsight-blue',
    user_id: 'mock-user-id', // Added user_id field
  },
  {
    id: 'bills',
    name: 'Bills',
    allocated: 500,
    spent: 450,
    color: 'bg-finsight-purple',
    user_id: 'mock-user-id', // Added user_id field
  },
  {
    id: 'spending',
    name: 'Weekly Spending',
    allocated: 300,
    spent: 200,
    color: 'bg-finsight-green',
    user_id: 'mock-user-id', // Added user_id field
  },
];
