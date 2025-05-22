
import { demoTransactions } from './demoData';
import { User } from '@/types/user';
import { supabase } from "@/integrations/supabase/client";

export const fetchTransactions = async (user: User | null) => {
  if (!user) {
    console.log('No user logged in, using demo transactions');
    return demoTransactions;
  }
  
  try {
    // For now, we'll continue using the mock data
    // In a real application, you would fetch from Supabase here
    console.log('Fetching transactions for user:', user.id);
    
    // Using mock data for now 
    // In a production app, replace with actual Supabase query
    const mockTransactions = demoTransactions.map(t => ({
      ...t,
      user_id: user.id
    }));
    
    // Simulate fetch delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions;
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const setupRealtimeSubscription = (user: User | null, 
  callback: (connected: boolean) => void
) => {
  if (!user) {
    console.log('No user logged in, skipping real-time subscription');
    return;
  }
  
  console.log('Setting up real-time subscription for transactions');
  
  // Set up Supabase realtime subscription for receipts
  const channel = supabase
    .channel('receipts-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'receipts' },
      (payload) => {
        console.log('Receipt change detected:', payload);
        // We'll handle this event in the UI components
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
      callback(status === 'SUBSCRIBED');
    });
  
  return () => {
    console.log('Cleaning up real-time subscription');
    supabase.removeChannel(channel);
    callback(false);
  };
};
