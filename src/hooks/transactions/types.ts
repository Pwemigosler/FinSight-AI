
import React from 'react';

export type TransactionItemType = {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

export type FormValues = {
  name: string;
  amount: string;
  category: string;
  date: string;
};
