
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bill, BillFrequency, BillStatus } from '@/types/bill';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
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
      
      setBills(prevBills => [...prevBills, newBill]);
      toast.success('Bill added successfully');
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
      
      setBills(prevBills => 
        prevBills.map(bill => bill.id === id ? updatedBill : bill)
      );
      
      toast.success('Bill updated successfully');
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
      
      setBills(prevBills => prevBills.filter(bill => bill.id !== id));
      toast.success('Bill deleted successfully');
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
  
  useEffect(() => {
    fetchBills();
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
    refreshBills: fetchBills
  };
};

export default useBills;
