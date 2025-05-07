
export type BillFrequency = 'monthly' | 'quarterly' | 'annually' | 'weekly' | 'biweekly';

export type BillStatus = 'paid' | 'unpaid' | 'upcoming' | 'overdue';

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: number;
  category: string;
  frequency: BillFrequency;
  status: BillStatus;
  auto_pay: boolean;
  payment_method_id?: string | null;
  next_due_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillFormValues {
  name: string;
  amount: number;
  due_date: number;
  category: string;
  frequency: BillFrequency;
  status: BillStatus;
  auto_pay: boolean;
  payment_method_id?: string;
  next_due_date: Date;
  notes?: string;
}
