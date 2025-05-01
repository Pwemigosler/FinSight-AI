
import { 
  allocateFunds, 
  transferFunds, 
  getBudgetCategories,
  BudgetCategory
} from "@/services/fundAllocationService";

export interface ChatAction {
  type: string;
  status: "success" | "error";
  details?: any;
}

export interface ActionResult {
  action: ChatAction;
  response: string;
}

export const processActionRequest = (message: string): ActionResult | null => {
  const lowerMessage = message.toLowerCase();
  
  // Check for allocation requests
  const allocateMatch = lowerMessage.match(/allocate\s+\$?(\d+(?:\.\d+)?)\s+(?:to|for|towards)\s+(\w+)/i);
  if (allocateMatch) {
    const amount = parseFloat(allocateMatch[1]);
    const category = allocateMatch[2];
    
    const result = allocateFunds(category, amount);
    return {
      action: {
        type: "allocation",
        status: result.success ? "success" as const : "error" as const,
        details: result
      },
      response: result.message
    };
  }
  
  // Check for transfer requests
  const transferMatch = lowerMessage.match(/transfer\s+\$?(\d+(?:\.\d+)?)\s+from\s+(\w+)\s+to\s+(\w+)/i);
  if (transferMatch) {
    const amount = parseFloat(transferMatch[1]);
    const fromCategory = transferMatch[2];
    const toCategory = transferMatch[3];
    
    const result = transferFunds(fromCategory, toCategory, amount);
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
    const categories = getBudgetCategories();
    const categoryList = categories.map(cat => `${cat.name}: $${cat.allocated} (spent: $${cat.spent})`).join("\n");
    
    return {
      action: {
        type: "view",
        status: "success" as const,
        details: { categories }
      },
      response: `Here are your current budget categories:\n\n${categoryList}`
    };
  }
  
  // No action detected
  return null;
};

export const getDefaultResponse = (inputMessage: string): string => {
  const botResponses: { [key: string]: string } = {
    "budget": "I can help you manage your budget. You can ask me to allocate funds to different categories like 'Allocate $500 to bills' or 'Transfer $200 from entertainment to savings'.",
    "invest": "For investment advice, I recommend diversifying your portfolio. Would you like me to allocate some funds to your investment category?",
    "save": "To improve your savings, try allocating more funds there. Try saying 'Allocate $300 to savings' or 'Transfer $100 from entertainment to savings'.",
    "debt": "To tackle debt, allocate more funds to paying it off. Try saying 'Allocate $400 to bills' to set aside money for debt payments.",
  };
  
  // Generate a response based on keywords or use a default
  const lowerInput = inputMessage.toLowerCase();
  let botContent = "I can help you allocate your funds to different categories. Try saying 'Allocate $500 to bills', 'Transfer $200 from entertainment to savings', or 'Show my budget categories'.";
  
  // Check if message contains any keywords
  for (const [keyword, response] of Object.entries(botResponses)) {
    if (lowerInput.includes(keyword)) {
      botContent = response;
      break;
    }
  }
  
  return botContent;
};
