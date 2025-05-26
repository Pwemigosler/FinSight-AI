
import { supabase } from "@/integrations/supabase/client";
import { Account, Transaction, AccountBalance, PlaidItem } from "@/types/financial";

export class FinancialService {
  // Account management
  static async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
    
    return data || [];
  }

  static async createAccount(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ ...account, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating account:', error);
      throw error;
    }
    
    return data;
  }

  static async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating account:', error);
      throw error;
    }
    
    return data;
  }

  static async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  }

  // Transaction management
  static async getTransactions(accountId?: string, limit = 100): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .limit(limit);
    
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    return data || [];
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    
    return data;
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    
    return data;
  }

  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Balance tracking
  static async recordBalance(accountId: string, balance: number, availableBalance?: number): Promise<AccountBalance> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('account_balances')
      .upsert({
        account_id: accountId,
        balance,
        available_balance: availableBalance,
        balance_date: today
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error recording balance:', error);
      throw error;
    }
    
    return data;
  }

  static async getBalanceHistory(accountId: string, days = 30): Promise<AccountBalance[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('account_balances')
      .select('*')
      .eq('account_id', accountId)
      .gte('balance_date', startDate.toISOString().split('T')[0])
      .order('balance_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching balance history:', error);
      throw error;
    }
    
    return data || [];
  }

  // Plaid item management
  static async getPlaidItems(): Promise<PlaidItem[]> {
    const { data, error } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching Plaid items:', error);
      throw error;
    }
    
    return data || [];
  }

  static async createPlaidItem(item: Omit<PlaidItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<PlaidItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plaid_items')
      .insert([{ ...item, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating Plaid item:', error);
      throw error;
    }
    
    return data;
  }

  static async updatePlaidItem(id: string, updates: Partial<PlaidItem>): Promise<PlaidItem> {
    const { data, error } = await supabase
      .from('plaid_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating Plaid item:', error);
      throw error;
    }
    
    return data;
  }
}
