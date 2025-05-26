
import { supabase } from "@/integrations/supabase/client";
import { TransactionItemType, FormValues } from './types';

export const addTransaction = async (values: FormValues, userId?: string): Promise<TransactionItemType> => {
  if (!userId) {
    throw new Error('User must be logged in to add transactions');
  }

  // Get user's first account or create a default one
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, account_name')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1);

  let accountId = accounts?.[0]?.id;

  // If no accounts exist, create a default one
  if (!accountId) {
    const { data: newAccount, error: accountError } = await supabase
      .from('accounts')
      .insert([{
        user_id: userId,
        institution_name: 'Manual Entry',
        account_name: 'Primary Account',
        account_type: 'checking',
        account_number_encrypted: 'manual',
        account_number_last4: '0000',
        current_balance: 0,
        currency_code: 'USD'
      }])
      .select('id')
      .single();

    if (accountError) {
      console.error('Error creating default account:', accountError);
      throw accountError;
    }

    accountId = newAccount.id;
  }

  const amount = parseFloat(values.amount);
  const transactionType = amount >= 0 ? 'credit' : 'debit';

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      account_id: accountId,
      amount: Math.abs(amount),
      description: values.name,
      category: values.category,
      transaction_type: transactionType,
      transaction_date: values.date,
      currency_code: 'USD',
      pending: false
    }])
    .select(`
      *,
      accounts!inner(account_name, institution_name)
    `)
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }

  // Transform to match existing interface
  return {
    id: data.id,
    name: data.description,
    amount: data.transaction_type === 'credit' ? data.amount : -data.amount,
    date: data.transaction_date,
    category: data.category,
    icon: getIconForCategory(data.category),
    iconColor: 'text-white',
    iconBg: getIconBgForCategory(data.category),
    account_id: data.account_id,
    account_name: data.accounts?.account_name || 'Unknown Account',
    pending: data.pending
  };
};

export const updateTransaction = (
  transaction: TransactionItemType, 
  values: FormValues
): TransactionItemType => {
  const amount = parseFloat(values.amount);
  
  return {
    ...transaction,
    name: values.name,
    amount: amount,
    category: values.category,
    date: values.date,
    icon: getIconForCategory(values.category),
    iconBg: getIconBgForCategory(values.category),
  };
};

export const deleteTransaction = async (transaction: TransactionItemType): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

export const getFormValuesFromTransaction = (transaction: TransactionItemType): FormValues => {
  return {
    name: transaction.name,
    amount: Math.abs(transaction.amount).toString(),
    category: transaction.category,
    date: transaction.date,
  };
};

// Helper functions
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
