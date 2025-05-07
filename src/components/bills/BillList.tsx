
import React, { useState } from 'react';
import { Bill } from '@/types/bill';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BillForm from './BillForm';
import DeleteBillDialog from './DeleteBillDialog';
import useBills from '@/hooks/useBills';

interface BillListProps {
  bills: Bill[];
  isLoading: boolean;
}

const BillList: React.FC<BillListProps> = ({ bills, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editBill, setEditBill] = useState<{ id: string; values: any } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const { markAsPaid, deleteBill, refreshBills } = useBills();
  
  const handleEdit = (bill: Bill) => {
    setEditBill({
      id: bill.id,
      values: {
        ...bill,
        next_due_date: parseISO(bill.next_due_date)
      }
    });
  };
  
  const handleDelete = (billId: string) => {
    setSelectedBillId(billId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (selectedBillId) {
      await deleteBill(selectedBillId);
      setDeleteDialogOpen(false);
      setSelectedBillId(null);
    }
  };
  
  const handleMarkAsPaid = async (billId: string) => {
    await markAsPaid(billId);
    await refreshBills();
  };
  
  const filteredBills = bills.filter(bill => 
    bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getBillStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</span>;
      case 'upcoming':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Upcoming</span>;
      case 'unpaid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Unpaid</span>;
      default:
        return <span>{status}</span>;
    }
  };
  
  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {bills.length === 0
                    ? "No bills found. Add your first bill to get started!"
                    : "No bills match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map(bill => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.name}</TableCell>
                  <TableCell>${bill.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(parseISO(bill.next_due_date), 'MMM d, yyyy')}</span>
                      <span className="text-xs text-gray-500">Day {bill.due_date} of month</span>
                    </div>
                  </TableCell>
                  <TableCell>{bill.category}</TableCell>
                  <TableCell>{formatFrequency(bill.frequency)}</TableCell>
                  <TableCell>{getBillStatusBadge(bill.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {bill.status !== 'paid' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleMarkAsPaid(bill.id)}
                          title="Mark as paid"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(bill)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(bill.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editBill && (
        <BillForm
          isOpen={!!editBill}
          onOpenChange={(open) => !open && setEditBill(null)}
          editBill={editBill}
        />
      )}
      
      <DeleteBillDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        billId={selectedBillId}
      />
    </div>
  );
};

export default BillList;
