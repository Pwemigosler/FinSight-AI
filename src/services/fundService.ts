
import { budgetCategories } from "@/data/budgetData";
import { BudgetCategory } from "@/types/budget";

export const allocateFunds = (
  categoryId: string, 
  amount: number, 
  description?: string
): { success: boolean; message: string; category?: BudgetCategory } => {
  // Find the category to allocate funds to
  const categoryIndex = budgetCategories.findIndex(cat => cat.id.toLowerCase() === categoryId.toLowerCase());
  
  if (categoryIndex === -1) {
    return { 
      success: false, 
      message: `Category '${categoryId}' not found. Available categories are: ${budgetCategories.map(c => c.name).join(', ')}`
    };
  }
  
  if (amount <= 0) {
    return { 
      success: false, 
      message: 'Amount must be greater than zero'
    };
  }

  // Update the category
  budgetCategories[categoryIndex].allocated += amount;
  
  return { 
    success: true, 
    message: `Successfully allocated $${amount} to ${budgetCategories[categoryIndex].name}`,
    category: budgetCategories[categoryIndex]
  };
};

export const transferFunds = (
  fromCategoryId: string, 
  toCategoryId: string, 
  amount: number
): { success: boolean; message: string; fromCategory?: BudgetCategory; toCategory?: BudgetCategory } => {
  // Find the categories
  const fromCategoryIndex = budgetCategories.findIndex(cat => 
    cat.id.toLowerCase() === fromCategoryId.toLowerCase()
  );
  
  const toCategoryIndex = budgetCategories.findIndex(cat => 
    cat.id.toLowerCase() === toCategoryId.toLowerCase()
  );
  
  if (fromCategoryIndex === -1) {
    return { 
      success: false, 
      message: `Source category '${fromCategoryId}' not found`
    };
  }
  
  if (toCategoryIndex === -1) {
    return { 
      success: false, 
      message: `Destination category '${toCategoryId}' not found`
    };
  }
  
  if (amount <= 0) {
    return { 
      success: false, 
      message: 'Amount must be greater than zero'
    };
  }
  
  // Check if source has enough funds
  if (budgetCategories[fromCategoryIndex].allocated < amount) {
    return { 
      success: false, 
      message: `Not enough funds in ${budgetCategories[fromCategoryIndex].name}. Available: $${budgetCategories[fromCategoryIndex].allocated}`
    };
  }
  
  // Transfer the funds
  budgetCategories[fromCategoryIndex].allocated -= amount;
  budgetCategories[toCategoryIndex].allocated += amount;
  
  return { 
    success: true, 
    message: `Successfully transferred $${amount} from ${budgetCategories[fromCategoryIndex].name} to ${budgetCategories[toCategoryIndex].name}`,
    fromCategory: budgetCategories[fromCategoryIndex],
    toCategory: budgetCategories[toCategoryIndex]
  };
};
