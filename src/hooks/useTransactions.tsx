
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { TransactionItemType, FormValues } from './transactions/types';
import { fetchTransactions, setupRealtimeSubscription } from './transactions/dataFetching';
import { addTransaction, updateTransaction, deleteTransaction, getFormValuesFromTransaction } from './transactions/transactionOperations';

export type { TransactionItemType } from './transactions/types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItemType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const { user } = useAuth();

  // Fetch transactions from database
  const fetchTransactionsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransactions(user);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to real-time updates
  const subscribeToUpdates = useCallback(() => {
    return setupRealtimeSubscription(user, setRealtimeConnected);
  }, [user]);

  // Listen for manual refresh events
  useEffect(() => {
    const handleTransactionsUpdated = () => {
      fetchTransactionsData();
    };

    window.addEventListener('transactions-updated', handleTransactionsUpdated);
    return () => window.removeEventListener('transactions-updated', handleTransactionsUpdated);
  }, [fetchTransactionsData]);

  // Initialize data and subscriptions
  useEffect(() => {
    fetchTransactionsData();
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchTransactionsData, subscribeToUpdates]);

  // Filter transactions based on search term and category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? transaction.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category))];
  
  const defaultFormValues = {
    name: "",
    amount: "",
    category: categories.length > 0 ? categories[0] : "Other",
    date: new Date().toISOString().split('T')[0],
  };

  const handleAddTransactionSubmit = async (values: FormValues) => {
    try {
      const newTransaction = await addTransaction(values, user?.id);
      setTransactions(prev => [newTransaction, ...prev]);
      setIsDialogOpen(false);
      toast.success('Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const handleEditTransaction = (transaction: TransactionItemType) => {
    console.log('Editing transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUpdateTransactionSubmit = async (values: FormValues) => {
    if (!selectedTransaction) return;

    try {
      const updatedTransaction = updateTransaction(selectedTransaction, values);
      
      setTransactions(prevTransactions => {
        return prevTransactions.map(transaction => 
          transaction.id === selectedTransaction.id ? updatedTransaction : transaction
        );
      });
      
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedTransaction(null);
      toast.success('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = (transaction: TransactionItemType) => {
    console.log('Preparing to delete transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async (): Promise<boolean> => {
    if (!selectedTransaction) return false;
    
    const success = await deleteTransaction(selectedTransaction);
    
    if (success) {
      setTransactions(prevTransactions => 
        prevTransactions.filter(t => t.id !== selectedTransaction.id)
      );
      
      setIsDeleteDialogOpen(false);
      setSelectedTransaction(null);
      toast.success('Transaction deleted successfully');
      
      return true;
    } else {
      toast.error('Failed to delete transaction');
    }
    
    return false;
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
      handleUpdateTransactionSubmit(values);
    } else {
      handleAddTransactionSubmit(values);
    }
  };
  
  const refreshTransactions = useCallback(() => {
    console.log('Manually refreshing transactions');
    return fetchTransactionsData();
  }, [fetchTransactionsData]);

  return {
    transactions,
    filteredTransactions,
    categories,
    isLoading,
    realtimeConnected,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTransaction,
    isDialogOpen,
    setIsDialogOpen,
    isEditMode,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isReceiptDialogOpen,
    setIsReceiptDialogOpen,
    defaultFormValues,
    getFormValuesFromTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    handleOpenReceiptDialog,
    handleCloseDialog,
    handleFormSubmit,
    confirmDelete,
    refreshTransactions,
  };
};

export default useTransactions;
