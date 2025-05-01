
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
}

// Mock database of budget categories that would normally come from an API
let budgetCategories: BudgetCategory[] = [
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

// Available colors for new categories
const availableColors = [
  'bg-finsight-purple',
  'bg-finsight-blue',
  'bg-finsight-orange',
  'bg-finsight-red',
  'bg-finsight-green',
];

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

// New function to update a category's allocated budget
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
