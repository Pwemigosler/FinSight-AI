
// Type definitions for fund allocation
export interface FundAllocation {
  category: string;
  amount: number;
  description?: string;
  date: Date;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  user_id: string; // Changed from optional to required for Supabase integration
}

// Available colors for categories
export const availableColors = [
  'bg-finsight-purple',
  'bg-finsight-blue',
  'bg-finsight-orange',
  'bg-finsight-red',
  'bg-finsight-green',
];
