import { debugLog } from '@/utils/debug';

import { User } from '@/types/user';
import { supabase } from "@/integrations/supabase/client";
import { TransactionItemType } from './types';

export const fetchTransactions = async (user: User | null): Promise<TransactionItemType[]> => {
  if (!user) {
    debugLog('No user logged in, returning empty transactions');
    return [];
  }
  
  try {
    debugLog('Fetching real transactions from database for user:', user.id);
    
    // Fetch transactions from the database
    const { data: transactionsData, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts!inner(
          id,
          account_name,
          institution_name,
          account_type
        )
      `)
      .order('transaction_date', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Transform database transactions to match the existing TransactionItemType
    const transformedTransactions: TransactionItemType[] = (transactionsData || []).map(tx => ({
      id: tx.id,
      name: tx.description || tx.merchant_name || 'Unknown Transaction',
      amount: tx.transaction_type === 'credit' ? Math.abs(tx.amount) : -Math.abs(tx.amount),
      date: tx.transaction_date,
      category: tx.category,
      icon: getIconForCategory(tx.category),
      iconColor: getIconColorForCategory(tx.category),
      iconBg: getIconBgForCategory(tx.category),
      account_id: tx.account_id,
      account_name: tx.accounts?.account_name || 'Unknown Account',
      pending: tx.pending,
      merchant_name: tx.merchant_name,
      subcategory: tx.subcategory,
      location: [tx.location_city, tx.location_state].filter(Boolean).join(', ') || undefined
    }));
    
    debugLog(`Fetched ${transformedTransactions.length} transactions from database`);
    return transformedTransactions;
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Helper functions to maintain existing UI styles
const getIconForCategory = (category: string) => {
  const iconMap: Record<string, string> = {
    'Food and Drink': '🍕',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Healthcare': '🏥',
    'Bills': '💡',
    'Transfer': '💸',
    'Income': '💰',
    'Other': '📄'
  };
  return iconMap[category] || '📄';
};

const getIconColorForCategory = (category: string) => {
  return 'text-white';
};

const getIconBgForCategory = (category: string) => {
  const bgMap: Record<string, string> = {
    'Food and Drink': 'bg-orange-500',
    'Transportation': 'bg-blue-500',
    'Shopping': 'bg-purple-500',
    'Entertainment': 'bg-pink-500',
    'Healthcare': 'bg-red-500',
    'Bills': 'bg-yellow-500',
    'Transfer': 'bg-green-500',
    'Income': 'bg-emerald-500',
    'Other': 'bg-gray-500'
  };
  return bgMap[category] || 'bg-gray-500';
};

export const setupRealtimeSubscription = (user: User | null, 
  callback: (connected: boolean) => void
) => {
  if (!user) {
    debugLog('No user logged in, skipping real-time subscription');
    return;
  }
  
  debugLog('Setting up real-time subscription for transactions');
  
  // Set up Supabase realtime subscription for transactions
  const channel = supabase
    .channel('transactions-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        debugLog('Transaction change detected:', payload);
        // Trigger a refresh of transaction data
        window.dispatchEvent(new CustomEvent('transactions-updated'));
      }
    )
    .subscribe((status) => {
      debugLog('Realtime subscription status:', status);
      callback(status === 'SUBSCRIBED');
    });
  
  return () => {
    debugLog('Cleaning up real-time subscription');
    supabase.removeChannel(channel);
    callback(false);
  };
};
