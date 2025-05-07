
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteTransactionDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

const DeleteTransactionDialog = ({ 
  isOpen, 
  onOpenChange, 
  onConfirm 
}: DeleteTransactionDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      console.log('Confirming transaction deletion');
      const success = await onConfirm();
      
      if (success) {
        console.log('Transaction delete operation successful');
        toast.success('Transaction deleted successfully');
        onOpenChange(false); // Close dialog on success
      } else {
        console.error('Transaction delete operation failed');
        setError('Failed to delete transaction');
        toast.error('Failed to delete transaction');
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred during deletion');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={isDeleting ? () => {} : onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="mb-4 p-3 text-sm border border-red-300 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionDialog;
