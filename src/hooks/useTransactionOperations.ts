
import { useState } from 'react';
import { toast } from 'sonner';
import { TransactionItemType, FormValues } from '@/types/transaction';
import { getCategoryIcon } from '@/utils/transactionUtils';

export const useTransactionOperations = (
  transactions: TransactionItemType[],
  setTransactions: React.Dispatch<React.SetStateAction<TransactionItemType[]>>,
  user: any
) => {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItemType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  // Extract unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category))];
  
  const defaultFormValues = {
    name: "",
    amount: "",
    category: categories.length > 0 ? categories[0] : "Other",
    date: new Date().toISOString().split('T')[0],
  };

  const getFormValuesFromTransaction = (transaction: TransactionItemType): FormValues => {
    return {
      name: transaction.name,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date,
    };
  };

  const handleAddTransaction = (values: FormValues) => {
    const amount = parseFloat(values.amount);
    
    // Generate category styling
    const categoryStyle = getCategoryIcon(values.category);
    
    const newTransaction = {
      id: `t${Date.now()}`,
      user_id: user?.id,
      name: values.name,
      category: values.category,
      date: values.date,
      amount: amount,
      ...categoryStyle
    };

    console.log('Adding new transaction:', newTransaction);
    
    // In a real app, this is where you'd save to Supabase
    setTransactions(prev => [newTransaction, ...prev]);
    setIsDialogOpen(false);
    
    toast.success("Transaction added successfully");
  };

  const handleEditTransaction = (transaction: TransactionItemType) => {
    console.log('Editing transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUpdateTransaction = (values: FormValues) => {
    if (!selectedTransaction) return;

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
    
    // In a real app, this is where you'd update in Supabase
    setTransactions(prevTransactions => {
      return prevTransactions.map(transaction => 
        transaction.id === selectedTransaction.id ? updatedTransaction : transaction
      );
    });
    
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
    
    toast.success("Transaction updated successfully");
  };

  const handleDeleteTransaction = (transaction: TransactionItemType) => {
    console.log('Preparing to delete transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  // Updated confirmDelete to return a Promise<boolean>
  const confirmDelete = async (): Promise<boolean> => {
    if (!selectedTransaction) return false;
    
    console.log('Deleting transaction:', selectedTransaction);
    
    try {
      // In a real app, this is where you'd delete from Supabase
      setTransactions(prevTransactions => 
        prevTransactions.filter(t => t.id !== selectedTransaction.id)
      );
      
      setIsDeleteDialogOpen(false);
      setSelectedTransaction(null);
      
      return true; // Return true to indicate successful deletion
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false; // Return false to indicate failed deletion
    }
  };

  const handleOpenReceiptDialog = (transaction: TransactionItemType) => {
    console.log('Opening receipt dialog for transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsReceiptDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log('Closing dialog');
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
  };

  const handleFormSubmit = (values: FormValues) => {
    console.log('Form submitted with values:', values);
    if (isEditMode) {
      handleUpdateTransaction(values);
    } else {
      handleAddTransaction(values);
    }
  };

  return {
    selectedTransaction,
    isDialogOpen,
    setIsDialogOpen,
    isEditMode,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isReceiptDialogOpen,
    setIsReceiptDialogOpen,
    categories,
    defaultFormValues,
    getFormValuesFromTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    handleOpenReceiptDialog,
    handleCloseDialog,
    handleFormSubmit,
    confirmDelete,
  };
};
