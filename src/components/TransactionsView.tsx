
import { useState } from 'react';
import { Search, Filter, ShoppingCart, Home, CreditCard, Coffee, ArrowDownToLine, ArrowUpFromLine, Plus, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import LinkBankCardDialog from './LinkBankCardDialog';
import ManageLinkedCardsDialog from './ManageLinkedCardsDialog';
import { useAuth } from '@/contexts/auth';
import ReceiptUploader from './receipts/ReceiptUploader';
import ReceiptGallery from './receipts/ReceiptGallery';

const transactions = [
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
    name: 'Starbucks',
    category: 'Dining',
    date: '2023-08-18',
    amount: -5.67,
    icon: <Coffee className="h-4 w-4" />,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    id: 't4',
    name: 'Netflix',
    category: 'Subscriptions',
    date: '2023-08-14',
    amount: -17.99,
    icon: <CreditCard className="h-4 w-4" />,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    id: 't5',
    name: 'Salary Deposit',
    category: 'Income',
    date: '2023-08-10',
    amount: 3450,
    icon: <ArrowDownToLine className="h-4 w-4" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 't6',
    name: 'Credit Card Payment',
    category: 'Transfers',
    date: '2023-08-05',
    amount: -450,
    icon: <ArrowUpFromLine className="h-4 w-4" />,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

const formSchema = z.object({
  name: z.string().min(1, "Transaction name is required"),
  amount: z.string().regex(/^-?\d*\.?\d+$/, "Must be a valid number"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});

const TransactionsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionsList, setTransactionsList] = useState(transactions);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [receiptRefreshTrigger, setReceiptRefreshTrigger] = useState(0);
  const { linkedCards } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newTransaction = {
      id: `t${transactionsList.length + 1}`,
      name: values.name,
      category: values.category,
      date: values.date,
      amount: parseFloat(values.amount),
      icon: <ShoppingCart className="h-4 w-4" />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    };

    setTransactionsList([newTransaction, ...transactionsList]);
    setIsDialogOpen(false);
    form.reset();
    
    toast({
      title: "Transaction added",
      description: "Your transaction has been successfully added.",
    });
  };

  const categories = [...new Set(transactionsList.map(t => t.category))];
  
  const filteredTransactions = transactionsList.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? transaction.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

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

  const handleOpenReceiptDialog = (transaction: typeof transactions[0]) => {
    setSelectedTransaction(transaction);
    setIsReceiptDialogOpen(true);
  };

  const handleReceiptUploadComplete = (success: boolean) => {
    if (success) {
      // Increment to trigger a refresh of ReceiptGallery
      setReceiptRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Transactions</h2>
          <div className="flex gap-2">
            {linkedCards.length > 0 && (
              <ManageLinkedCardsDialog />
            )}
            <LinkBankCardDialog />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter amount (use - for expenses)" 
                              {...field} 
                              type="number"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button type="submit">Add Transaction</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search transactions..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="whitespace-nowrap"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {linkedCards.length === 0 && (
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <div className="mr-3">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-blue-700">Link your bank cards</h3>
                <p className="text-sm text-blue-600">
                  Connect your bank cards to automatically import your transactions.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleOpenReceiptDialog(transaction)}
                >
                  <Receipt className="h-4 w-4" />
                  <span className="sr-only">Receipts</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Receipt Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Transaction Receipts</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="py-4">
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`${selectedTransaction.iconBg} p-1.5 rounded-full`}>
                        <div className={selectedTransaction.iconColor}>
                          {selectedTransaction.icon}
                        </div>
                      </div>
                      <span className="font-medium">{selectedTransaction.name}</span>
                    </div>
                    <span className={`font-medium ${selectedTransaction.amount >= 0 ? 'text-green-600' : ''}`}>
                      {formatAmount(selectedTransaction.amount)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex justify-between">
                    <div>{formatDate(selectedTransaction.date)}</div>
                    <Badge variant="outline" className="text-xs font-normal">
                      {selectedTransaction.category}
                    </Badge>
                  </div>
                </div>
                
                <Tabs defaultValue="gallery">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="gallery">Receipts</TabsTrigger>
                    <TabsTrigger value="upload">Upload New</TabsTrigger>
                  </TabsList>
                  <TabsContent value="gallery">
                    <ReceiptGallery 
                      transactionId={selectedTransaction.id} 
                      refreshTrigger={receiptRefreshTrigger}
                    />
                  </TabsContent>
                  <TabsContent value="upload">
                    <ReceiptUploader 
                      transactionId={selectedTransaction.id}
                      onUploadComplete={handleReceiptUploadComplete}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TransactionsView;
