
import React from 'react';

export type TransactionItemType = {
  id: string;
  user_id?: string;
  account_id: string;
  account_name?: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  pending?: boolean;
  merchant_name?: string;
  subcategory?: string;
  location?: string;
};

export type FormValues = {
  name: string;
  amount: string;
  category: string;
  date: string;
};
