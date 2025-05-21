
import { toast } from 'sonner';
import { FormValues, TransactionItemType } from './types';
import { getCategoryIcon } from './categoryIcons';

export const addTransaction = (
  values: FormValues,
  userId?: string
): TransactionItemType => {
  const amount = parseFloat(values.amount);
  
  // Generate category styling
  const categoryStyle = getCategoryIcon(values.category);
  
  const newTransaction = {
    id: `t${Date.now()}`,
    user_id: userId,
    name: values.name,
    category: values.category,
    date: values.date,
    amount: amount,
    ...categoryStyle
  };

  console.log('Adding new transaction:', newTransaction);
  toast.success("Transaction added successfully");
  
  return newTransaction;
};

export const updateTransaction = (
  selectedTransaction: TransactionItemType,
  values: FormValues
): TransactionItemType => {
  const amount = parseFloat(values.amount);
  const categoryStyle = getCategoryIcon(values.category);

  const updatedTransaction = {
    ...selectedTransaction,
    name: values.name,
    category: values.category,
    date: values.date,
    amount: amount,
    ...categoryStyle
  };

  console.log('Updating transaction:', updatedTransaction);
  toast.success("Transaction updated successfully");
  
  return updatedTransaction;
};

export const deleteTransaction = async (
  selectedTransaction: TransactionItemType
): Promise<boolean> => {
  try {
    console.log('Deleting transaction:', selectedTransaction);
    // In a real app, this is where you'd delete from Supabase
    
    return true; // Return true to indicate successful deletion
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false; // Return false to indicate failed deletion
  }
};

export const getFormValuesFromTransaction = (transaction: TransactionItemType): FormValues => {
  return {
    name: transaction.name,
    amount: transaction.amount.toString(),
    category: transaction.category,
    date: transaction.date,
  };
};
