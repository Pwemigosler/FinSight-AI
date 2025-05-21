
import { demoTransactions } from './demoData';
import { User } from '@/types/user';

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
  
  // In a real app, this would subscribe to changes on the transactions table
  // For now, we'll fake the connection status
  const timer = setTimeout(() => {
    callback(true);
  }, 1000);
  
  return () => {
    console.log('Cleaning up real-time subscription');
    clearTimeout(timer);
    callback(false);
  };
};
