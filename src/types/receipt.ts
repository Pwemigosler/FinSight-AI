
export interface Receipt {
  id: string;
  transaction_id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: Date;
}

export interface ReceiptUploadResponse {
  receipt?: Receipt;
  error?: string;
}

export interface ReceiptQuery {
  transactionId?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}
