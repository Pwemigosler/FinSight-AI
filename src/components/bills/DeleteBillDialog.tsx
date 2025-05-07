
import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type DeleteBillDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
  billId: string | null;
};

const DeleteBillDialog = ({ 
  isOpen, 
  onOpenChange, 
  onConfirm,
  billId
}: DeleteBillDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!billId) {
      toast.error("No bill selected for deletion");
      return;
    }
    
    setIsDeleting(true);
    setError(null);

    try {
      console.log('Confirming deletion for bill:', billId);
      const success = await onConfirm();
      
      if (success) {
        console.log('Delete operation successful');
        toast.success('Bill deleted successfully');
        onOpenChange(false); // Close the dialog on success
      } else {
        console.error('Delete operation failed');
        setError('Failed to delete bill. Please try again.');
        toast.error('Failed to delete bill. Please try again.');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      setError('An unexpected error occurred during deletion');
      toast.error('An unexpected error occurred during deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    // Only allow closing if we're not in the middle of a delete operation
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={isDeleting ? () => {} : onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this bill? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="mb-4 p-3 text-sm border border-red-300 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
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

export default DeleteBillDialog;
