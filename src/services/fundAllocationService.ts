
// Re-export everything from the new modular services
export { getBudgetCategories, addBudgetCategory, updateCategoryAmount } from './categoryService';
export { allocateFunds, transferFunds } from './fundService';
export type { BudgetCategory, FundAllocation } from '@/types/budget';
