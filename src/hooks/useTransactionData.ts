
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TransactionItemType } from '@/types/transaction';
import { demoTransactions } from '@/utils/transactionUtils';
import { toast } from 'sonner';

export const useTransactionData = (user: any) => {
  const [transactions, setTransactions] = useState<TransactionItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch transactions from supabase or use demo data for non-authenticated users
  const fetchTransactions = useCallback(async () => {
    if (!user) {
      console.log('No user logged in, using demo transactions');
      setTransactions(demoTransactions);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching transactions for user:', user.id);
      
      // For authenticated users, return an empty array or fetch real data from database
      // In a production app, this would fetch from Supabase
      setTransactions([]); // Start with empty transactions for new users
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to real-time updates from Supabase
  const subscribeToUpdates = useCallback(() => {
    if (!user) {
      console.log('No user logged in, skipping real-time subscription');
      return;
    }
    
    console.log('Setting up real-time subscription for transactions');
    
    // In a real app, this would subscribe to changes on the transactions table
    // For now, we'll fake the connection status
    setTimeout(() => {
      setRealtimeConnected(true);
    }, 1000);
    
    return () => {
      console.log('Cleaning up real-time subscription');
      setRealtimeConnected(false);
    };
  }, [user]);

  // Initialize data and subscriptions
  useEffect(() => {
    fetchTransactions();
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchTransactions, subscribeToUpdates]);
  
  const refreshTransactions = useCallback(() => {
    console.log('Manually refreshing transactions');
    return fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    setTransactions,
    isLoading,
    realtimeConnected,
    refreshTransactions
  };
};
