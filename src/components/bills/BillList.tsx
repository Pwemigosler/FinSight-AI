import React, { useState } from 'react';
import { Bill } from '@/types/bill';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, AlertCircle, Clock, CheckCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BillForm from './BillForm';
import DeleteBillDialog from './DeleteBillDialog';
import useBills from '@/hooks/useBills';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BillListProps {
  bills: Bill[];
  isLoading: boolean;
  realtimeConnected?: boolean;
  onRefresh?: () => void;
}

const BillList: React.FC<BillListProps> = ({ 
  bills, 
  isLoading, 
  realtimeConnected = false,
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editBill, setEditBill] = useState<{ id: string; values: any } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const { markAsPaid, deleteBill } = useBills();
  
  const handleEdit = (bill: Bill) => {
    console.log('Opening edit form for bill:', bill.id);
    setEditBill({
      id: bill.id,
      values: {
        ...bill,
        next_due_date: parseISO(bill.next_due_date)
      }
    });
  };
  
  const handleDelete = (billId: string) => {
    console.log('Opening delete dialog for bill:', billId);
    setSelectedBillId(billId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (selectedBillId) {
      console.log('Deleting bill:', selectedBillId);
      const success = await deleteBill(selectedBillId);
      if (success) {
        console.log('Delete operation successful');
        setDeleteDialogOpen(false);
        setSelectedBillId(null);
        
        // If the real-time connection isn't working, manually refresh
        if (!realtimeConnected && onRefresh) {
          console.log('No real-time connection, manually refreshing bills');
          setTimeout(onRefresh, 300);
        }
      }
      return success;
    }
    return false;
  };
  
  const handleMarkAsPaid = async (billId: string) => {
    console.log('Marking bill as paid:', billId);
    await markAsPaid(billId);
    
    // If the real-time connection isn't working, manually refresh
    if (!realtimeConnected && onRefresh) {
      console.log('No real-time connection, manually refreshing bills after marking as paid');
      setTimeout(onRefresh, 300);
    }
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
      <div className="p-4 border-b flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRefresh} 
              title="Refresh bills"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {realtimeConnected ? (
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                      <Wifi className="h-3 w-3" /> Live
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
                      <WifiOff className="h-3 w-3" /> Offline
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {realtimeConnected 
                  ? "Real-time updates are active" 
                  : "Real-time updates are not available"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          onOpenChange={(open) => {
            if (!open) {
              setEditBill(null);
              // If the real-time connection isn't working, manually refresh
              if (!realtimeConnected && onRefresh) {
                console.log('No real-time connection, manually refreshing bills after edit form closed');
                setTimeout(onRefresh, 300);
              }
            }
          }}
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

// Helper functions
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

export default BillList;
