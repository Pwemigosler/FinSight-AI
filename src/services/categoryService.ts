
import { BudgetCategory, availableColors } from "@/types/budget";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Get all budget categories for the current authenticated user
export const getBudgetCategories = async (): Promise<BudgetCategory[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      console.warn("No authenticated user found, returning empty categories list");
      return [];
    }
    
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching budget categories:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Failed to fetch budget categories:", error);
    return [];
  }
};

// Add a new budget category
export const addBudgetCategory = async (
  name: string,
  initialAllocation: number = 0
): Promise<{ success: boolean; message: string; category?: BudgetCategory }> => {
  try {
    if (!name || name.trim() === '') {
      return {
        success: false,
        message: 'Category name cannot be empty'
      };
    }
    
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      return {
        success: false,
        message: 'You must be logged in to create budget categories'
      };
    }
    
    // Create ID from name (lowercase, remove spaces)
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category already exists for this user
    const { data: existingCategories } = await supabase
      .from('budget_categories')
      .select('id')
      .eq('user_id', session.session.user.id)
      .eq('name', name);
    
    if (existingCategories && existingCategories.length > 0) {
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
      user_id: session.session.user.id
    };
    
    const { data, error } = await supabase
      .from('budget_categories')
      .insert([newCategory])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating budget category:", error);
      return {
        success: false,
        message: `Failed to create category: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: `Successfully created new category '${name}'${
        initialAllocation > 0 ? ` with initial allocation of $${initialAllocation}` : ''
      }`,
      category: data
    };
  } catch (error) {
    console.error("Failed to create budget category:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${(error as Error).message}`
    };
  }
};

// Update a category's allocated budget
export const updateCategoryAmount = async (
  categoryId: string,
  newAmount: number
): Promise<{ success: boolean; message: string; category?: BudgetCategory }> => {
  try {
    if (newAmount < 0) {
      return { 
        success: false, 
        message: 'Amount cannot be negative' 
      };
    }
    
    // Find the category to update
    const { data: categoryData, error: fetchError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (fetchError || !categoryData) {
      return { 
        success: false, 
        message: `Category '${categoryId}' not found` 
      };
    }
    
    const previousAmount = categoryData.allocated;
    
    // Update the category
    const { data, error } = await supabase
      .from('budget_categories')
      .update({ allocated: newAmount, updated_at: new Date().toISOString() })
      .eq('id', categoryId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating budget category:", error);
      return {
        success: false,
        message: `Failed to update category: ${error.message}`
      };
    }
    
    return { 
      success: true, 
      message: `Successfully updated ${data.name} budget from $${previousAmount} to $${newAmount}`,
      category: data
    };
  } catch (error) {
    console.error("Failed to update budget category:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${(error as Error).message}`
    };
  }
};
