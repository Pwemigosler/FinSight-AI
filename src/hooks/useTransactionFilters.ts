
import { useState, useMemo } from 'react';
import { TransactionItemType } from '@/types/transaction';

export const useTransactionFilters = (transactions: TransactionItemType[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter transactions based on search term and category
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? transaction.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchTerm, selectedCategory]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredTransactions
  };
};
