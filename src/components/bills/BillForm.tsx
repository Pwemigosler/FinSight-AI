import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { BillFormValues, BillFrequency, BillStatus } from "@/types/bill";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import useBills from "@/hooks/useBills";

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
  const initialValues: BillFormValues = editBill?.values || {
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
  
  const handleChange = (field: keyof BillFormValues, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Submitting bill form...');
    
    try {
      const billData = {
        ...formValues,
        amount: Number(formValues.amount),
        due_date: Number(formValues.due_date),
        next_due_date: formValues.next_due_date.toISOString().split('T')[0]
      };

      if (editBill) {
        console.log('Updating bill:', editBill.id);
        await updateBill(editBill.id, billData);
      } else {
        console.log('Adding new bill:', billData.name);
        await addBill(billData);
      }
      
      // Close the form and reset values
      onOpenChange(false);
      setFormValues(initialValues);
    } catch (error) {
      console.error("Error submitting bill:", error);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name</Label>
              <Input 
                id="name" 
                value={formValues.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g. Mortgage, Netflix, etc." 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                min="0"
                step="0.01" 
                value={formValues.amount} 
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date (Day of Month)</Label>
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
                <Label htmlFor="category">Category</Label>
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
                <Label htmlFor="frequency">Frequency</Label>
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
                <Label htmlFor="status">Status</Label>
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
              <Label htmlFor="next_due_date">Next Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editBill ? 'Update' : 'Add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillForm;
