
import { useTransactionData } from './useTransactionData';
import { useTransactionFilters } from './useTransactionFilters';
import { useTransactionOperations } from './useTransactionOperations';
import { useAuth } from '@/contexts/auth';

export const useTransactions = () => {
  const { user } = useAuth();
  
  const { 
    transactions, 
    setTransactions, 
    isLoading, 
    realtimeConnected, 
    refreshTransactions 
  } = useTransactionData(user);
  
  const { 
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory, 
    filteredTransactions 
  } = useTransactionFilters(transactions);
  
  const operations = useTransactionOperations(transactions, setTransactions, user);

  return {
    transactions,
    filteredTransactions,
    categories: operations.categories,
    isLoading,
    realtimeConnected,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTransaction: operations.selectedTransaction,
    isDialogOpen: operations.isDialogOpen,
    setIsDialogOpen: operations.setIsDialogOpen,
    isEditMode: operations.isEditMode,
    isDeleteDialogOpen: operations.isDeleteDialogOpen,
    setIsDeleteDialogOpen: operations.setIsDeleteDialogOpen,
    isReceiptDialogOpen: operations.isReceiptDialogOpen,
    setIsReceiptDialogOpen: operations.setIsReceiptDialogOpen,
    defaultFormValues: operations.defaultFormValues,
    getFormValuesFromTransaction: operations.getFormValuesFromTransaction,
    handleEditTransaction: operations.handleEditTransaction,
    handleDeleteTransaction: operations.handleDeleteTransaction,
    handleOpenReceiptDialog: operations.handleOpenReceiptDialog,
    handleCloseDialog: operations.handleCloseDialog,
    handleFormSubmit: operations.handleFormSubmit,
    confirmDelete: operations.confirmDelete,
    refreshTransactions,
  };
};

export default useTransactions;
