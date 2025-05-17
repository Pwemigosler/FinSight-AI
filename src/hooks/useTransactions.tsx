import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, CreditCard, Home, Coffee, Film, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

// Define Transaction type
export type TransactionItemType = {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

type FormValues = {
  name: string;
  amount: string;
  category: string;
  date: string;
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'housing':
      return { 
        icon: <Home className="h-4 w-4" />,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      };
    case 'dining':
    case 'food':
      return { 
        icon: <Coffee className="h-4 w-4" />,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      };
    case 'entertainment':
      return { 
        icon: <Film className="h-4 w-4" />,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      };
    case 'fitness':
      return { 
        icon: <Dumbbell className="h-4 w-4" />,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    case 'income':
      return { 
        icon: <CreditCard className="h-4 w-4" />,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    default:
      return { 
        icon: <ShoppingCart className="h-4 w-4" />,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600'
      };
  }
};

// Sample transactions data for fallback when user is not logged in or preview mode
const demoTransactions = [
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
    icon: <Home className="h-4 w-4" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 't3',
    name: 'Salary Deposit',
    category: 'Income',
    date: '2023-08-10',
    amount: 3450,
    icon: <CreditCard className="h-4 w-4" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  }
];

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItemType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const { user } = useAuth();
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch transactions from supabase or use demo data for non-authenticated users
  const fetchTransactions = useCallback(async () => {
    if (!user) {
      console.log('No user logged in, using demo transactions');
      setTransactions(demoTransactions);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching transactions for user:', user.id);
      
      // For authenticated users, return an empty array or fetch real data from database
      // In a production app, this would fetch from Supabase
      setTransactions([]); // Start with empty transactions for new users
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to real-time updates from Supabase
  const subscribeToUpdates = useCallback(() => {
    if (!user) {
      console.log('No user logged in, skipping real-time subscription');
      return;
    }
    
    console.log('Setting up real-time subscription for transactions');
    
    // In a real app, this would subscribe to changes on the transactions table
    // For now, we'll fake the connection status
    setTimeout(() => {
      setRealtimeConnected(true);
    }, 1000);
    
    return () => {
      console.log('Cleaning up real-time subscription');
      setRealtimeConnected(false);
    };
  }, [user]);

  // Initialize data and subscriptions
  useEffect(() => {
    fetchTransactions();
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchTransactions, subscribeToUpdates]);

  // Filter transactions based on search term and category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? transaction.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category))];
  
  const defaultFormValues = {
    name: "",
    amount: "",
    category: categories.length > 0 ? categories[0] : "Other",
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
    const amount = parseFloat(values.amount);
    
    // Generate category styling
    const categoryStyle = getCategoryIcon(values.category);
    
    const newTransaction = {
      id: `t${Date.now()}`,
      user_id: user?.id,
      name: values.name,
      category: values.category,
      date: values.date,
      amount: amount,
      ...categoryStyle
    };

    console.log('Adding new transaction:', newTransaction);
    
    // In a real app, this is where you'd save to Supabase
    setTransactions(prev => [newTransaction, ...prev]);
    setIsDialogOpen(false);
    
    toast.success("Transaction added successfully");
  };

  const handleEditTransaction = (transaction: TransactionItemType) => {
    console.log('Editing transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUpdateTransaction = (values: FormValues) => {
    if (!selectedTransaction) return;

    const amount = parseFloat(values.amount);
    const categoryStyle = getCategoryIcon(values.category);

    const updatedTransaction = {
      ...selectedTransaction,
      name: values.name,
      category: values.category,
      date: values.date,
      amount: amount,
      ...categoryStyle
    };

    console.log('Updating transaction:', updatedTransaction);
    
    // In a real app, this is where you'd update in Supabase
    setTransactions(prevTransactions => {
      return prevTransactions.map(transaction => 
        transaction.id === selectedTransaction.id ? updatedTransaction : transaction
      );
    });
    
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
    
    toast.success("Transaction updated successfully");
  };

  const handleDeleteTransaction = (transaction: TransactionItemType) => {
    console.log('Preparing to delete transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  // Updated confirmDelete to return a Promise<boolean>
  const confirmDelete = async (): Promise<boolean> => {
    if (!selectedTransaction) return false;
    
    console.log('Deleting transaction:', selectedTransaction);
    
    try {
      // In a real app, this is where you'd delete from Supabase
      setTransactions(prevTransactions => 
        prevTransactions.filter(t => t.id !== selectedTransaction.id)
      );
      
      setIsDeleteDialogOpen(false);
      setSelectedTransaction(null);
      
      return true; // Return true to indicate successful deletion
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false; // Return false to indicate failed deletion
    }
  };

  const handleOpenReceiptDialog = (transaction: TransactionItemType) => {
    console.log('Opening receipt dialog for transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsReceiptDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log('Closing dialog');
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
  };

  const handleFormSubmit = (values: FormValues) => {
    console.log('Form submitted with values:', values);
    if (isEditMode) {
      handleUpdateTransaction(values);
    } else {
      handleAddTransaction(values);
    }
  };
  
  const refreshTransactions = useCallback(() => {
    console.log('Manually refreshing transactions');
    return fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    filteredTransactions,
    categories,
    isLoading,
    realtimeConnected,
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
    refreshTransactions,
  };
};

export default useTransactions;
