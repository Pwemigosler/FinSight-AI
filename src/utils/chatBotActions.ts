
import { 
  allocateFunds, 
  transferFunds, 
  getBudgetCategories,
  addBudgetCategory,
  updateCategoryAmount,
} from "@/services/fundAllocationService";
import { BudgetCategory } from "@/types/budget";
import { ActionResult, FinancialInsight } from "@/types/chat";
import { handleReceiptAction } from "./receiptBotActions";

export interface ChatAction {
  type: string;
  status: "success" | "error";
  details?: any;
}

// Mock financial data - in a real app, this would come from your data service
const generateFinancialInsights = (): FinancialInsight[] => {
  return [
    {
      type: "saving",
      title: "Saving Opportunity",
      description: "You could save $125 monthly by reducing dining expenses.",
      impact: "positive",
      value: 125,
      category: "dining"
    },
    {
      type: "spending",
      title: "Spending Alert",
      description: "Your entertainment spending is 30% higher than last month.",
      impact: "negative",
      value: 30,
      category: "entertainment"
    },
    {
      type: "budget",
      title: "Budget Status",
      description: "You're on track with your savings goal this month.",
      impact: "positive"
    },
    {
      type: "suggestion",
      title: "Recommendation",
      description: "Consider allocating 15% more to your emergency fund.",
      impact: "neutral",
      value: 15,
      category: "emergency"
    }
  ];
};

// Handle budget and fund allocation actions
const handleBudgetAction = async (message: string): Promise<ActionResult | null> => {
  const lowerMessage = message.toLowerCase();
  
  // Check for allocation requests
  const allocateMatch = lowerMessage.match(/allocate\s+\$?(\d+(?:\.\d+)?)\s+(?:to|for|towards)\s+(\w+)/i);
  if (allocateMatch) {
    const amount = parseFloat(allocateMatch[1]);
    const category = allocateMatch[2];
    
    const result = await allocateFunds(category, amount);
    return {
      action: {
        type: "allocation",
        status: result.success ? "success" as const : "error" as const,
        details: result
      },
      response: result.message
    };
  }
  
  // Check for new category creation requests
  const categoryCreationMatch = lowerMessage.match(/(?:create|add|new)\s+(?:budget\s+)?category\s+([a-z0-9\s]+)(?:\s+with\s+\$?(\d+(?:\.\d+)?))?/i);
  if (categoryCreationMatch) {
    const categoryName = categoryCreationMatch[1].trim();
    const initialAmount = categoryCreationMatch[2] ? parseFloat(categoryCreationMatch[2]) : 0;
    
    const result = await addBudgetCategory(categoryName, initialAmount);
    return {
      action: {
        type: "category_creation",
        status: result.success ? "success" as const : "error" as const,
        details: result
      },
      response: result.message
    };
  }
  
  // Check for set/update category amount requests
  const updateBudgetMatch = lowerMessage.match(/(?:set|update|change)\s+(?:budget\s+for\s+|(\w+)\s+budget\s+to\s+|\w+\s+allocation\s+to\s+)\$?(\d+(?:\.\d+)?)/i);
  if (updateBudgetMatch) {
    let category = updateBudgetMatch[1]?.trim();
    const amount = parseFloat(updateBudgetMatch[2]);
    
    // If category is not captured in first group, try to extract it from the full message
    if (!category) {
      const categoryMatch = lowerMessage.match(/(?:set|update|change)\s+budget\s+for\s+(\w+)/i);
      if (categoryMatch) {
        category = categoryMatch[1].trim();
      } else {
        const altMatch = lowerMessage.match(/(?:set|update|change)\s+(\w+)\s+allocation/i);
        if (altMatch) {
          category = altMatch[1].trim();
        }
      }
    }
    
    if (category) {
      const result = await updateCategoryAmount(category, amount);
      return {
        action: {
          type: "budget_update",
          status: result.success ? "success" as const : "error" as const,
          details: result
        },
        response: result.message
      };
    }
  }
  
  // Check for transfer requests
  const transferMatch = lowerMessage.match(/transfer\s+\$?(\d+(?:\.\d+)?)\s+from\s+(\w+)\s+to\s+(\w+)/i);
  if (transferMatch) {
    const amount = parseFloat(transferMatch[1]);
    const fromCategory = transferMatch[2];
    const toCategory = transferMatch[3];
    
    const result = await transferFunds(fromCategory, toCategory, amount);
    return {
      action: {
        type: "transfer",
        status: result.success ? "success" as const : "error" as const,
        details: result
      },
      response: result.message
    };
  }
  
  // Check for viewing budget request
  if (lowerMessage.includes("show") && (lowerMessage.includes("budget") || lowerMessage.includes("category") || lowerMessage.includes("funds"))) {
    const categories = await getBudgetCategories();
    const categoryList = categories.map(cat => `${cat.name}: $${cat.allocated} (spent: $${cat.spent})`).join("\n");
    
    return {
      action: {
        type: "view",
        status: "success" as const,
        details: categories
      },
      response: `Here are your current budget categories:\n\n${categoryList}`
    };
  }
  
  return null;
};

// Handle financial analysis actions
const handleAnalysisAction = async (message: string): Promise<ActionResult | null> => {
  const lowerMessage = message.toLowerCase();
  
  if ((lowerMessage.includes("analyze") || lowerMessage.includes("analysis")) && 
      (lowerMessage.includes("finance") || lowerMessage.includes("spending") || 
       lowerMessage.includes("budget") || lowerMessage.includes("money"))) {
    const insights = generateFinancialInsights();
    
    return {
      action: {
        type: "analysis",
        status: "success" as const,
        details: { insights }
      },
      response: "Here's my analysis of your financial situation:"
    };
  }
  
  return null;
};

// Process all possible chatbot actions
export const processActionRequest = async (message: string): Promise<ActionResult | null> => {
  // First check for budget-related actions
  const budgetAction = await handleBudgetAction(message);
  if (budgetAction) return budgetAction;
  
  // Then check for receipt-related actions
  const receiptAction = await handleReceiptAction(message);
  if (receiptAction) return receiptAction;
  
  // Then check for analysis-related actions
  const analysisAction = await handleAnalysisAction(message);
  if (analysisAction) return analysisAction;
  
  // No action detected
  return null;
};

export const getDefaultResponse = (inputMessage: string): string => {
  const botResponses: { [key: string]: string } = {
    "budget": "I can help you manage your budget. You can ask me to allocate funds to different categories like 'Allocate $500 to bills' or 'Transfer $200 from entertainment to savings'.",
    "invest": "For investment advice, I recommend diversifying your portfolio. Would you like me to allocate some funds to your investment category?",
    "save": "To improve your savings, try allocating more funds there. Try saying 'Allocate $300 to savings' or 'Transfer $100 from entertainment to savings'.",
    "debt": "To tackle debt, allocate more funds to paying it off. Try saying 'Allocate $400 to bills' to set aside money for debt payments.",
    "analyze": "I can analyze your finances to help identify saving opportunities and spending patterns. Try asking me to 'Analyze my finances' or 'Give me a spending analysis'.",
    "category": "You can create new budget categories by saying 'Create category Travel' or 'Add category Healthcare with $300'.",
    "update": "You can update your budget amounts by saying 'Set budget for housing to $2000' or 'Update food budget to $500'.",
    "receipt": "I can help you manage and view your receipts. Try saying 'Show my recent receipts', 'View receipts for Whole Foods', or 'Get receipts from last month'."
  };
  
  // Generate a response based on keywords or use a default
  const lowerInput = inputMessage.toLowerCase();
  let botContent = "I can help you allocate your funds to different categories, manage receipts, and analyze your finances. Try saying 'Allocate $500 to bills', 'Transfer $200 from entertainment to savings', 'Show my budget categories', 'View my recent receipts', or 'Analyze my finances'.";
  
  // Check if message contains any keywords
  for (const [keyword, response] of Object.entries(botResponses)) {
    if (lowerInput.includes(keyword)) {
      botContent = response;
      break;
    }
  }
  
  return botContent;
};
