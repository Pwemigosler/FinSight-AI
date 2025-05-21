import React from 'react';
import { MoreHorizontal, Pencil, Receipt, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionItemType } from '@/hooks/transactions/types';

type TransactionItemProps = {
  transaction: TransactionItemType;
  onEdit: (transaction: TransactionItemType) => void;
  onDelete: (transaction: TransactionItemType) => void;
  onViewReceipts: (transaction: TransactionItemType) => void;
};

const TransactionItem = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  onViewReceipts 
}: TransactionItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`${transaction.iconBg} p-2 rounded-full`}>
          <div className={transaction.iconColor}>
            {transaction.icon}
          </div>
        </div>
        <div>
          <p className="font-medium">{transaction.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
            <Badge variant="outline" className="text-xs font-normal">
              {transaction.category}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : ''}`}>
          {formatAmount(transaction.amount)}
        </span>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewReceipts(transaction)}
          >
            <Receipt className="h-4 w-4" />
            <span className="sr-only">Receipts</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(transaction)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(transaction)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
