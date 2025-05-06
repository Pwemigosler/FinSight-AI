
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/auth';

import useTransactions from '@/hooks/useTransactions';
import TransactionForm from './transactions/TransactionForm';
import TransactionItem from './transactions/TransactionItem';
import TransactionFilters from './transactions/TransactionFilters';
import DeleteTransactionDialog from './transactions/DeleteTransactionDialog';
import ReceiptDialog from './transactions/ReceiptDialog';
import BankCardBanner from './transactions/BankCardBanner';
import ManageLinkedCardsDialog from './ManageLinkedCardsDialog';
import LinkBankCardDialog from './LinkBankCardDialog';

const TransactionsView = () => {
  const { linkedCards } = useAuth();
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
  } = useTransactions();

  const formValues = isEditMode && selectedTransaction 
    ? getFormValuesFromTransaction(selectedTransaction) 
    : defaultFormValues;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Transactions</h2>
          <div className="flex gap-2">
            {linkedCards.length > 0 && (
              <ManageLinkedCardsDialog />
            )}
            <LinkBankCardDialog />
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
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
        
        <div className="space-y-3">
          {filteredTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onViewReceipts={handleOpenReceiptDialog}
            />
          ))}
        </div>

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
