
import { ReactNode } from 'react';

export type TransactionItemType = {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
};

export type FormValues = {
  name: string;
  amount: string;
  category: string;
  date: string;
};
