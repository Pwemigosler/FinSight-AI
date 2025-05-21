
import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

import useTransactions from '@/hooks/useTransactions';
import TransactionForm from './transactions/TransactionForm';
import TransactionItem from './transactions/TransactionItem';
import TransactionFilters from './transactions/TransactionFilters';
import DeleteTransactionDialog from './transactions/DeleteTransactionDialog';
import ReceiptDialog from './transactions/ReceiptDialog';
import BankCardBanner from './transactions/BankCardBanner';
import ManageLinkedCardsDialog from './cards/ManageLinkedCardsDialog';
import LinkBankCardDialog from './cards/LinkBankCardDialog';

const TransactionsView = () => {
  const { linkedCards, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    filteredTransactions,
    categories,
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
    isLoading,
    realtimeConnected
  } = useTransactions();

  const formValues = isEditMode && selectedTransaction 
    ? getFormValuesFromTransaction(selectedTransaction) 
    : defaultFormValues;
    
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshTransactions();
      toast.success("Transactions refreshed successfully");
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleAddTransaction = () => {
    if (!user) {
      toast.error("Please sign in to add transactions");
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Transactions</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh transactions"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {linkedCards.length > 0 && (
              <ManageLinkedCardsDialog />
            )}
            
            <LinkBankCardDialog />
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button onClick={handleAddTransaction}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
                </DialogHeader>
                <TransactionForm 
                  onSubmit={handleFormSubmit}
                  onCancel={handleCloseDialog}
                  defaultValues={formValues}
                  categories={categories}
                  isEditMode={isEditMode}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <TransactionFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        <BankCardBanner linkedCardsCount={linkedCards.length} />
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No transactions found.</p>
              </div>
            ) : (
              filteredTransactions.map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                  onViewReceipts={handleOpenReceiptDialog}
                />
              ))
            )}
          </div>
        )}

        <DeleteTransactionDialog 
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
        />

        <ReceiptDialog 
          isOpen={isReceiptDialogOpen}
          onOpenChange={setIsReceiptDialogOpen}
          transaction={selectedTransaction}
        />
      </CardContent>
    </Card>
  );
};

export default TransactionsView;
