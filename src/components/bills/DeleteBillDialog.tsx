
import React from 'react';
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
import { useState } from 'react';
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

  const handleConfirm = async () => {
    if (!billId) {
      toast.error("No bill selected for deletion");
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log('Confirming deletion for bill:', billId);
      const success = await onConfirm();
      
      if (success) {
        console.log('Delete operation successful');
        onOpenChange(false); // Close the dialog on success
      } else {
        console.error('Delete operation failed');
        toast.error('Failed to delete bill. Please try again.');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
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
