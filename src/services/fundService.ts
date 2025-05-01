
import { supabase } from "@/integrations/supabase/client";
import { BudgetCategory } from "@/types/budget";

export const allocateFunds = async (
  categoryId: string, 
  amount: number, 
  description?: string
): Promise<{ success: boolean; message: string; category?: BudgetCategory }> => {
  try {
    // Find the category to allocate funds to
    const { data: category, error: fetchError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (fetchError) {
      const { data: allCategories } = await supabase
        .from('budget_categories')
        .select('name');
      
      const availableCategories = allCategories ? allCategories.map(c => c.name).join(', ') : 'none';
      
      return { 
        success: false, 
        message: `Category '${categoryId}' not found. Available categories are: ${availableCategories}`
      };
    }
    
    if (amount <= 0) {
      return { 
        success: false, 
        message: 'Amount must be greater than zero'
      };
    }

    // Update the category
    const newAllocated = Number(category.allocated) + Number(amount);
    
    const { data, error } = await supabase
      .from('budget_categories')
      .update({ 
        allocated: newAllocated,
        updated_at: new Date().toISOString() 
      })
      .eq('id', categoryId)
      .select()
      .single();
    
    if (error) {
      console.error("Error allocating funds:", error);
      return {
        success: false,
        message: `Failed to allocate funds: ${error.message}`
      };
    }
    
    return { 
      success: true, 
      message: `Successfully allocated $${amount} to ${data.name}`,
      category: data
    };
  } catch (error) {
    console.error("Failed to allocate funds:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${(error as Error).message}`
    };
  }
};

export const transferFunds = async (
  fromCategoryId: string, 
  toCategoryId: string, 
  amount: number
): Promise<{ success: boolean; message: string; fromCategory?: BudgetCategory; toCategory?: BudgetCategory }> => {
  try {
    // Find the source category
    const { data: fromCategory, error: fromError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('id', fromCategoryId)
      .single();
    
    if (fromError || !fromCategory) {
      return { 
        success: false, 
        message: `Source category '${fromCategoryId}' not found`
      };
    }
    
    // Find the destination category
    const { data: toCategory, error: toError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('id', toCategoryId)
      .single();
    
    if (toError || !toCategory) {
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
    if (fromCategory.allocated < amount) {
      return { 
        success: false, 
        message: `Not enough funds in ${fromCategory.name}. Available: $${fromCategory.allocated}`
      };
    }
    
    // Start a Supabase transaction using two separate updates
    // Update source category
    const { error: fromUpdateError } = await supabase
      .from('budget_categories')
      .update({ 
        allocated: Number(fromCategory.allocated) - Number(amount),
        updated_at: new Date().toISOString() 
      })
      .eq('id', fromCategoryId);
    
    if (fromUpdateError) {
      console.error("Error updating source category:", fromUpdateError);
      return {
        success: false,
        message: `Failed to transfer funds: ${fromUpdateError.message}`
      };
    }
    
    // Update destination category
    const { error: toUpdateError } = await supabase
      .from('budget_categories')
      .update({ 
        allocated: Number(toCategory.allocated) + Number(amount),
        updated_at: new Date().toISOString() 
      })
      .eq('id', toCategoryId);
    
    if (toUpdateError) {
      // Attempt to rollback the first update
      await supabase
        .from('budget_categories')
        .update({ 
          allocated: fromCategory.allocated,
          updated_at: new Date().toISOString() 
        })
        .eq('id', fromCategoryId);
      
      console.error("Error updating destination category:", toUpdateError);
      return {
        success: false,
        message: `Failed to transfer funds: ${toUpdateError.message}`
      };
    }
    
    // Get the updated categories
    const { data: updatedFromCategory } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('id', fromCategoryId)
      .single();
    
    const { data: updatedToCategory } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('id', toCategoryId)
      .single();
    
    return { 
      success: true, 
      message: `Successfully transferred $${amount} from ${fromCategory.name} to ${toCategory.name}`,
      fromCategory: updatedFromCategory,
      toCategory: updatedToCategory
    };
  } catch (error) {
    console.error("Failed to transfer funds:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${(error as Error).message}`
    };
  }
};
