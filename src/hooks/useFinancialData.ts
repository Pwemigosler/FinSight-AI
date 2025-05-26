
import { useState, useEffect, useCallback } from 'react';
import { Account, Transaction } from '@/types/financial';
import { FinancialService } from '@/services/financialService';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useFinancialData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    
    try {
      const accountsData = await FinancialService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
      toast.error('Failed to load accounts');
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      const transactionsData = await FinancialService.getTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      toast.error('Failed to load transactions');
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchAccounts(), fetchTransactions()]);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccounts, fetchTransactions]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setAccounts([]);
      setTransactions([]);
      setIsLoading(false);
    }
  }, [user, fetchData]);

  const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newAccount = await FinancialService.createAccount(account);
      setAccounts(prev => [newAccount, ...prev]);
      toast.success('Account linked successfully');
      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('Failed to link account');
      throw error;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTransaction = await FinancialService.createTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transaction added successfully');
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await FinancialService.updateTransaction(id, updates);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      toast.success('Transaction updated successfully');
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await FinancialService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      throw error;
    }
  };

  return {
    accounts,
    transactions,
    isLoading,
    error,
    addAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshData: fetchData
  };
};
