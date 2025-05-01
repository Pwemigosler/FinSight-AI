
import { BudgetCategory, availableColors } from "@/types/budget";
import { budgetCategories } from "@/data/budgetData";

export const getBudgetCategories = (): BudgetCategory[] => {
  return [...budgetCategories];
};

export const addBudgetCategory = (
  name: string,
  initialAllocation: number = 0
): { success: boolean; message: string; category?: BudgetCategory } => {
  if (!name || name.trim() === '') {
    return {
      success: false,
      message: 'Category name cannot be empty'
    };
  }

  // Create ID from name (lowercase, remove spaces)
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  // Check if category already exists
  if (budgetCategories.some(cat => cat.id === id)) {
    return {
      success: false,
      message: `Category '${name}' already exists`
    };
  }
  
  // Select a random color from available colors
  const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
  
  // Create new category
  const newCategory: BudgetCategory = {
    id,
    name,
    allocated: initialAllocation,
    spent: 0,
    color: randomColor,
  };
  
  // Add to categories
  budgetCategories.push(newCategory);
  
  return {
    success: true,
    message: `Successfully created new category '${name}'${
      initialAllocation > 0 ? ` with initial allocation of $${initialAllocation}` : ''
    }`,
    category: newCategory
  };
};

// Update a category's allocated budget
export const updateCategoryAmount = (
  categoryId: string,
  newAmount: number
): { success: boolean; message: string; category?: BudgetCategory } => {
  // Find the category to update
  const categoryIndex = budgetCategories.findIndex(cat => cat.id.toLowerCase() === categoryId.toLowerCase());
  
  if (categoryIndex === -1) {
    return { 
      success: false, 
      message: `Category '${categoryId}' not found` 
    };
  }
  
  if (newAmount < 0) {
    return { 
      success: false, 
      message: 'Amount cannot be negative' 
    };
  }

  // Update the category allocation
  const previousAmount = budgetCategories[categoryIndex].allocated;
  budgetCategories[categoryIndex].allocated = newAmount;
  
  return { 
    success: true, 
    message: `Successfully updated ${budgetCategories[categoryIndex].name} budget from $${previousAmount} to $${newAmount}`,
    category: budgetCategories[categoryIndex]
  };
};
