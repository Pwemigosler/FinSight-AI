
import { ActionResult, ReceiptInfo } from "@/types/chat";
import { getRecentReceipts } from "@/services/receiptService";

// Handle receipt-related actions from the chatbot
export const handleReceiptAction = async (message: string): Promise<ActionResult | null> => {
  const lowerMessage = message.toLowerCase();
  
  // Check for receipt viewing requests
  if (
    (lowerMessage.includes("show") || lowerMessage.includes("view") || lowerMessage.includes("get")) &&
    lowerMessage.includes("receipt")
  ) {
    try {
      let receipts: ReceiptInfo[] = [];
      let responseText = "";
      
      // Check for receipt query parameters
      const transactionMatch = lowerMessage.match(/receipt(?:s)?\s+(?:for|from)\s+(?:transaction\s+)?["']?([^"']+)["']?/i);
      const dateMatch = lowerMessage.match(/receipt(?:s)?\s+(?:from|on|for)\s+(?:date\s+)?["']?([^"']+)["']?/i);
      const recentMatch = lowerMessage.match(/(?:recent|latest|last)\s+(\d+)?\s*receipt/i);
      
      if (transactionMatch) {
        const transactionName = transactionMatch[1].trim();
        // In a real app, we would query by transaction name and use receipts associated with that transaction
        receipts = await getRecentReceipts(3);
        responseText = `Here are the receipts for transaction "${transactionName}":`;
      } else if (dateMatch) {
        const dateText = dateMatch[1].trim();
        // In a real app, we would parse the date and query by date range
        receipts = await getRecentReceipts(2);
        responseText = `Here are the receipts from ${dateText}:`;
      } else if (recentMatch) {
        const count = recentMatch[1] ? parseInt(recentMatch[1]) : 5;
        receipts = await getRecentReceipts(count);
        responseText = `Here are your ${count} most recent receipts:`;
      } else {
        // General receipt request
        receipts = await getRecentReceipts(5);
        responseText = "Here are your recent receipts:";
      }
      
      return {
        action: {
          type: "receipts_view",
          status: "success",
          details: { 
            success: true,
            message: "Retrieved receipts successfully",
            receipts 
          }
        },
        response: responseText,
        receipts
      };
    } catch (error) {
      console.error("Error processing receipt request:", error);
      return {
        action: {
          type: "receipts_view",
          status: "error",
          details: { 
            success: false,
            message: `I couldn't retrieve your receipts: ${(error as Error).message}`
          }
        },
        response: "I couldn't retrieve your receipts at this time. Please try again later."
      };
    }
  }
  
  // No receipt action detected
  return null;
};
