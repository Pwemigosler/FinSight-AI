
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bill, BillFrequency, BillStatus } from '@/types/bill';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  
  const fetchBills = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('next_due_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Type casting the data to ensure it matches the Bill type
      const typedData: Bill[] = data?.map(item => ({
        ...item,
        frequency: item.frequency as BillFrequency,
        status: item.status as BillStatus
      })) || [];
      
      setBills(typedData);
      console.log('Bills fetched:', typedData.length);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addBill = async (bill: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([{ ...bill, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Cast the returned data to ensure it matches the Bill type
      const newBill: Bill = {
        ...data,
        frequency: data.frequency as BillFrequency,
        status: data.status as BillStatus
      };
      
      // Immediately add the new bill to the local state for instant UI update
      setBills(prevBills => [...prevBills, newBill]);
      toast.success('Bill added successfully');
      
      console.log('Bill added:', newBill);
      return newBill;
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill');
      return null;
    }
  };
  
  const updateBill = async (id: string, updates: Partial<Bill>) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Cast the returned data to ensure it matches the Bill type
      const updatedBill: Bill = {
        ...data,
        frequency: data.frequency as BillFrequency,
        status: data.status as BillStatus
      };
      
      // Immediately update the bill in the local state
      setBills(prevBills => 
        prevBills.map(bill => bill.id === id ? updatedBill : bill)
      );
      
      toast.success('Bill updated successfully');
      console.log('Bill updated:', updatedBill);
      return updatedBill;
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Failed to update bill');
      return null;
    }
  };
  
  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Immediately remove the bill from the local state
      setBills(prevBills => prevBills.filter(bill => bill.id !== id));
      toast.success('Bill deleted successfully');
      console.log('Bill deleted:', id);
      return true;
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
      return false;
    }
  };
  
  // Mark a bill as paid
  const markAsPaid = async (id: string) => {
    return updateBill(id, { status: 'paid' });
  };
  
  // Calculate monthly total amount of all bills
  const billsTotal = bills.reduce((sum, bill) => {
    // Adjust amount based on frequency
    let adjustedAmount = bill.amount;
    if (bill.frequency === 'quarterly') adjustedAmount /= 3;
    if (bill.frequency === 'annually') adjustedAmount /= 12;
    if (bill.frequency === 'weekly') adjustedAmount *= 4.345; // Average weeks in a month
    if (bill.frequency === 'biweekly') adjustedAmount *= 2.175; // Average biweekly in a month
    
    return sum + adjustedAmount;
  }, 0);
  
  // Check for and update overdue bills
  const checkOverdueBills = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    bills.forEach(bill => {
      if (bill.status === 'upcoming' && bill.next_due_date < todayString) {
        updateBill(bill.id, { status: 'overdue' });
      }
    });
  };
  
  // Subscribe to real-time updates from Supabase
  const subscribeToUpdates = () => {
    if (!user) return null;
    
    console.log('Setting up real-time subscription for bills');
    
    // Clean up any existing subscription first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    const channel = supabase
      .channel('bills-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bills',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // Handle different event types
          if (payload.eventType === 'INSERT') {
            const newBill = payload.new as Bill;
            console.log('Inserting new bill via realtime:', newBill);
            setBills(prevBills => {
              // Check if bill already exists to avoid duplicates
              const exists = prevBills.some(bill => bill.id === newBill.id);
              if (exists) return prevBills;
              return [...prevBills, {
                ...newBill,
                frequency: newBill.frequency as BillFrequency,
                status: newBill.status as BillStatus
              }];
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedBill = payload.new as Bill;
            console.log('Updating bill via realtime:', updatedBill);
            setBills(prevBills => 
              prevBills.map(bill => bill.id === updatedBill.id ? {
                ...updatedBill,
                frequency: updatedBill.frequency as BillFrequency,
                status: updatedBill.status as BillStatus
              } : bill)
            );
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedBill = payload.old as Bill;
            console.log('Deleting bill via realtime:', deletedBill);
            setBills(prevBills => prevBills.filter(bill => bill.id !== deletedBill.id));
          }
          
          // Show toast notification for real-time updates
          if (payload.eventType === 'INSERT') {
            toast.info('New bill added');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Bill updated');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Bill deleted');
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setRealtimeConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          toast.success('Real-time updates enabled');
        } else if (status === 'CHANNEL_ERROR') {
          toast.error('Real-time connection error');
          // Attempt to reconnect after a delay
          setTimeout(subscribeToUpdates, 5000);
        }
      });
      
    channelRef.current = channel;
    return channel;
  };
  
  useEffect(() => {
    fetchBills();
    // Set up real-time subscription
    const channel = subscribeToUpdates();
    
    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [user]);
  
  useEffect(() => {
    checkOverdueBills();
  }, [bills]);
  
  return {
    bills,
    isLoading,
    billsTotal,
    addBill,
    updateBill,
    deleteBill,
    markAsPaid,
    refreshBills: fetchBills,
    realtimeConnected
  };
};

export default useBills;
