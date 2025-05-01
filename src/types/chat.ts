
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
    } | {
      insights: FinancialInsight[];
    };
  };
  response: string;
}

export interface FinancialInsight {
  type: "saving" | "spending" | "budget" | "suggestion";
  title: string;
  description: string;
  impact?: "positive" | "negative" | "neutral";
  value?: number;
  category?: string;
}
