import { debugLog } from '@/utils/debug';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { BillFormValues, BillFrequency, BillStatus } from "@/types/bill";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import useBills from "@/hooks/useBills";
import { toast } from 'sonner';

interface BillFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editBill?: {
    id: string;
    values: BillFormValues;
  };
}

const categories = [
  "Housing", "Utilities", "Insurance", "Transportation", "Subscriptions", 
  "Entertainment", "Healthcare", "Food", "Debt", "Other"
];

const frequencyOptions: BillFrequency[] = ["monthly", "quarterly", "annually", "weekly", "biweekly"];
const statusOptions: BillStatus[] = ["upcoming", "paid", "unpaid", "overdue"];

const BillForm: React.FC<BillFormProps> = ({ isOpen, onOpenChange, editBill }) => {
  const initialValues: BillFormValues = {
    name: '',
    amount: 0,
    due_date: 1,
    category: 'Other',
    frequency: 'monthly',
    status: 'upcoming',
    auto_pay: false,
    next_due_date: new Date(),
    notes: '',
  };

  const [formValues, setFormValues] = useState<BillFormValues>(initialValues);
  const { addBill, updateBill } = useBills();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when dialog opens/closes or when editBill changes
  useEffect(() => {
    if (isOpen) {
      // If editing, set form values from the bill being edited
      if (editBill?.values) {
        setFormValues(editBill.values);
      } else {
        // Reset to initial state when adding a new bill
        setFormValues(initialValues);
      }
    }
  }, [isOpen, editBill]);
  
  const handleChange = (field: keyof BillFormValues, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formValues.name.trim()) {
      toast.error('Please enter a bill name');
      return;
    }
    
    if (formValues.amount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    
    setIsSubmitting(true);
    debugLog('Submitting bill form...', formValues);
    
    try {
      const billData = {
        ...formValues,
        amount: Number(formValues.amount),
        due_date: Number(formValues.due_date),
        next_due_date: formValues.next_due_date.toISOString().split('T')[0]
      };

      let success = false;
      
      if (editBill) {
        debugLog('Updating bill:', editBill.id);
        const result = await updateBill(editBill.id, billData);
        success = !!result;
      } else {
        debugLog('Adding new bill:', billData.name);
        const result = await addBill(billData);
        success = !!result;
      }
      
      // Only close the form if the operation was successful
      if (success) {
        debugLog('Form submission successful, closing dialog');
        onOpenChange(false);
      } else {
        console.error('Form submission failed, keeping dialog open');
      }
    } catch (error) {
      console.error("Error submitting bill:", error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateDueDate = (value: number): number => {
    let numValue = Number(value);
    if (isNaN(numValue)) return 1;
    if (numValue < 1) return 1;
    if (numValue > 31) return 31;
    return Math.floor(numValue);
  };

  const handleCancel = () => {
    if (isSubmitting) return; // Prevent closing during submission
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name*</Label>
              <Input 
                id="name" 
                value={formValues.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g. Mortgage, Netflix, etc." 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)*</Label>
              <Input 
                id="amount" 
                type="number" 
                min="0.01"
                step="0.01" 
                value={formValues.amount} 
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date (Day of Month)*</Label>
                <Input 
                  id="due_date" 
                  type="number" 
                  min="1" 
                  max="31" 
                  value={formValues.due_date} 
                  onChange={(e) => handleChange('due_date', validateDueDate(Number(e.target.value)))} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select 
                  value={formValues.category} 
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency*</Label>
                <Select 
                  value={formValues.frequency} 
                  onValueChange={(value: BillFrequency) => handleChange('frequency', value)}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(frequency => (
                      <SelectItem key={frequency} value={frequency}>
                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select 
                  value={formValues.status} 
                  onValueChange={(value: BillStatus) => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="next_due_date">Next Due Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="next_due_date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formValues.next_due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formValues.next_due_date ? (
                      format(formValues.next_due_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formValues.next_due_date}
                    onSelect={(date) => handleChange('next_due_date', date || new Date())}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="auto_pay" 
                checked={formValues.auto_pay} 
                onCheckedChange={(checked) => handleChange('auto_pay', Boolean(checked))} 
              />
              <Label htmlFor="auto_pay">Auto Pay</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={formValues.notes || ''} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                placeholder="Any additional details about this bill..." 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editBill ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editBill ? 'Update' : 'Add'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillForm;
