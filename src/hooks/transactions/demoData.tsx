
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { TransactionItemType } from './types';

// Sample transactions data for fallback when user is not logged in
export const demoTransactions: TransactionItemType[] = [
  {
    id: 't1',
    account_id: 'demo-account-1',
    name: 'Whole Foods Market',
    category: 'Groceries',
    date: '2023-08-21',
    amount: -128.42,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 't2',
    account_id: 'demo-account-1',
    name: 'Rent Payment',
    category: 'Housing',
    date: '2023-08-15',
    amount: -1800,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 't3',
    account_id: 'demo-account-1',
    name: 'Salary Deposit',
    category: 'Income',
    date: '2023-08-10',
    amount: 3450,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  }
];
