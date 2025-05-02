
import { BudgetCategory } from "@/services/fundAllocationService";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  action?: {
    type: string;
    status: "success" | "error";
    details?: any;
  };
  receipts?: ReceiptInfo[];
}

export interface ActionResult {
  action: {
    type: string;
    status: "success" | "error";
    details?: BudgetCategory[] | {
      success: boolean;
      message: string;
      category?: BudgetCategory;
      fromCategory?: BudgetCategory;
      toCategory?: BudgetCategory;
      receipts?: ReceiptInfo[];
    } | {
      insights: FinancialInsight[];
    };
  };
  response: string;
  receipts?: ReceiptInfo[];
}

export interface FinancialInsight {
  type: "saving" | "spending" | "budget" | "suggestion";
  title: string;
  description: string;
  impact?: "positive" | "negative" | "neutral";
  value?: number;
  category?: string;
}

export interface ReceiptInfo {
  id: string;
  transaction_id: string;
  file_path: string;
  file_name: string;
  thumbnail_url?: string;
  full_url?: string;
}
