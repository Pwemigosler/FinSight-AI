
import { supabase } from "@/integrations/supabase/client";
import { Receipt, ReceiptQuery, ReceiptUploadResponse } from "@/types/receipt";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ReceiptInfo } from "@/types/chat";

// Upload a receipt file and create metadata record
export const uploadReceipt = async (
  file: File,
  transactionId: string
): Promise<ReceiptUploadResponse> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      return { error: "You must be logged in to upload receipts" };
    }
    
    const userId = sessionData.session.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${transactionId}/${fileName}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error("Error uploading receipt:", uploadError);
      return { error: `Failed to upload receipt: ${uploadError.message}` };
    }
    
    // Create receipt metadata record
    const receiptData = {
      transaction_id: transactionId,
      user_id: userId,
      file_path: filePath,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size
    };
    
    const { data, error } = await supabase
      .from('receipts')
      .insert(receiptData)
      .select('*')
      .single();
      
    if (error) {
      console.error("Error creating receipt record:", error);
      return { error: `Failed to create receipt record: ${error.message}` };
    }
    
    return { 
      receipt: {
        ...data,
        uploaded_at: new Date(data.uploaded_at)
      } 
    };
  } catch (error) {
    console.error("Failed to upload receipt:", error);
    return { error: `An unexpected error occurred: ${(error as Error).message}` };
  }
};

// Get receipts for a specific transaction
export const getReceiptsByTransactionId = async (
  transactionId: string
): Promise<Receipt[]> => {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('transaction_id', transactionId);
      
    if (error) {
      console.error("Error fetching receipts:", error);
      throw error;
    }
    
    return data.map(receipt => ({
      ...receipt,
      uploaded_at: new Date(receipt.uploaded_at)
    }));
  } catch (error) {
    console.error("Failed to fetch receipts:", error);
    return [];
  }
};

// Query receipts based on various filters
export const queryReceipts = async (
  query: ReceiptQuery
): Promise<Receipt[]> => {
  try {
    let supabaseQuery = supabase.from('receipts').select('*');
    
    if (query.transactionId) {
      supabaseQuery = supabaseQuery.eq('transaction_id', query.transactionId);
    }
    
    // Note: Additional filters for date ranges, amounts, etc. would require
    // joining with the transactions table, which we'll implement if needed
    
    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }
    
    const { data, error } = await supabaseQuery;
    
    if (error) {
      console.error("Error querying receipts:", error);
      throw error;
    }
    
    return data.map(receipt => ({
      ...receipt,
      uploaded_at: new Date(receipt.uploaded_at)
    }));
  } catch (error) {
    console.error("Failed to query receipts:", error);
    return [];
  }
};

// Delete a receipt
export const deleteReceipt = async (receiptId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // First get the receipt to know the file path
    const { data: receipt, error: fetchError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching receipt for deletion:", fetchError);
      return { success: false, message: `Receipt not found: ${fetchError.message}` };
    }
    
    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('receipts')
      .remove([receipt.file_path]);
      
    if (storageError) {
      console.error("Error deleting receipt file:", storageError);
      return { success: false, message: `Failed to delete receipt file: ${storageError.message}` };
    }
    
    // Delete the metadata record
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', receiptId);
      
    if (error) {
      console.error("Error deleting receipt record:", error);
      return { success: false, message: `Failed to delete receipt record: ${error.message}` };
    }
    
    return { success: true, message: "Receipt deleted successfully" };
  } catch (error) {
    console.error("Failed to delete receipt:", error);
    return { success: false, message: `An unexpected error occurred: ${(error as Error).message}` };
  }
};

// Convert receipt to info format with URLs for display
export const getReceiptInfo = async (receipt: Receipt): Promise<ReceiptInfo> => {
  // Get URLs for the receipt file
  const { data: urlData } = await supabase.storage
    .from('receipts')
    .createSignedUrl(receipt.file_path, 3600); // 1 hour expiry
    
  return {
    id: receipt.id,
    transaction_id: receipt.transaction_id,
    file_path: receipt.file_path,
    file_name: receipt.file_name,
    file_type: receipt.file_type,
    file_size: receipt.file_size,
    full_url: urlData?.signedUrl
  };
};

// Get recent receipts
export const getRecentReceipts = async (limit = 5): Promise<ReceiptInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error("Error fetching recent receipts:", error);
      throw error;
    }
    
    const receiptsWithUrls = await Promise.all(
      data.map(async receipt => {
        return await getReceiptInfo({
          ...receipt,
          uploaded_at: new Date(receipt.uploaded_at)
        });
      })
    );
    
    return receiptsWithUrls;
  } catch (error) {
    console.error("Failed to fetch recent receipts:", error);
    return [];
  }
};
