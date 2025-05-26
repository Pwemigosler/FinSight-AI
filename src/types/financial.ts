
export interface Account {
  id: string;
  user_id: string;
  institution_name: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  account_number_encrypted: string;
  account_number_last4: string;
  routing_number_encrypted?: string;
  plaid_account_id?: string;
  plaid_access_token_encrypted?: string;
  current_balance: number;
  available_balance?: number;
  currency_code: string;
  is_active: boolean;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  plaid_transaction_id?: string;
  amount: number;
  currency_code: string;
  description: string;
  merchant_name?: string;
  category: string;
  subcategory?: string;
  transaction_type: 'debit' | 'credit';
  transaction_date: string;
  posted_date?: string;
  pending: boolean;
  location_address?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountBalance {
  id: string;
  account_id: string;
  balance: number;
  available_balance?: number;
  balance_date: string;
  created_at: string;
}

export interface PlaidItem {
  id: string;
  user_id: string;
  plaid_item_id: string;
  plaid_access_token_encrypted: string;
  institution_id: string;
  institution_name: string;
  webhook_url?: string;
  cursor?: string;
  is_active: boolean;
  error_code?: string;
  error_message?: string;
  last_successful_sync?: string;
  created_at: string;
  updated_at: string;
}
