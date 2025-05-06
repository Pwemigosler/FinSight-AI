
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { TransactionItemType } from '@/components/transactions/TransactionItem';

// Sample transactions data
const initialTransactions = [
  {
    id: 't1',
    name: 'Whole Foods Market',
    category: 'Groceries',
    date: '2023-08-21',
    amount: -128.42,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 't2',
    name: 'Rent Payment',
    category: 'Housing',
    date: '2023-08-15',
    amount: -1800,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 't3',
    name: 'Starbucks',
    category: 'Dining',
    date: '2023-08-18',
    amount: -5.67,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    id: 't4',
    name: 'Netflix',
    category: 'Subscriptions',
    date: '2023-08-14',
    amount: -17.99,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    id: 't5',
    name: 'Salary Deposit',
    category: 'Income',
    date: '2023-08-10',
    amount: 3450,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 't6',
    name: 'Credit Card Payment',
    category: 'Transfers',
    date: '2023-08-05',
    amount: -450,
    icon: <ShoppingCart className="h-4 w-4" />,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

type FormValues = {
  name: string;
  amount: string;
  category: string;
  date: string;
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionItemType[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItemType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const categories = [...new Set(transactions.map(t => t.category))];
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? transaction.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const defaultFormValues = {
    name: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
  };

  const getFormValuesFromTransaction = (transaction: TransactionItemType): FormValues => {
    return {
      name: transaction.name,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date,
    };
  };

  const handleAddTransaction = (values: FormValues) => {
    const newTransaction = {
      id: `t${transactions.length + 1}`,
      name: values.name,
      category: values.category,
      date: values.date,
      amount: parseFloat(values.amount),
      icon: <ShoppingCart className="h-4 w-4" />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    };

    setTransactions([newTransaction, ...transactions]);
    setIsDialogOpen(false);
    
    toast({
      title: "Transaction added",
      description: "Your transaction has been successfully added.",
    });
  };

  const handleEditTransaction = (transaction: TransactionItemType) => {
    setSelectedTransaction(transaction);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUpdateTransaction = (values: FormValues) => {
    if (!selectedTransaction) return;

    const updatedTransactions = transactions.map(transaction => {
      if (transaction.id === selectedTransaction.id) {
        return {
          ...transaction,
          name: values.name,
          category: values.category,
          date: values.date,
          amount: parseFloat(values.amount),
        };
      }
      return transaction;
    });
    
    setTransactions(updatedTransactions);
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
    
    toast({
      title: "Transaction updated",
      description: "Your transaction has been successfully updated.",
    });
  };

  const handleDeleteTransaction = (transaction: TransactionItemType) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTransaction) {
      const updatedTransactions = transactions.filter(
        t => t.id !== selectedTransaction.id
      );
      setTransactions(updatedTransactions);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Transaction deleted",
        description: "The transaction has been successfully deleted.",
      });
    }
  };

  const handleOpenReceiptDialog = (transaction: TransactionItemType) => {
    setSelectedTransaction(transaction);
    setIsReceiptDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
  };

  const handleFormSubmit = (values: FormValues) => {
    if (isEditMode) {
      handleUpdateTransaction(values);
    } else {
      handleAddTransaction(values);
    }
  };

  return {
    transactions,
    filteredTransactions,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTransaction,
    isDialogOpen,
    setIsDialogOpen,
    isEditMode,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isReceiptDialogOpen,
    setIsReceiptDialogOpen,
    defaultFormValues,
    getFormValuesFromTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    handleOpenReceiptDialog,
    handleCloseDialog,
    handleFormSubmit,
    confirmDelete,
  };
};

export default useTransactions;
