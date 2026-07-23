import { useState, useCallback } from 'react';
import { transactionService } from '@/lib/services/transactionService';
import { PaginatedResponse, Transaction, TransactionFilters, TransactionSummary } from '@/types/transaction';

export function useTransactions(initialData: PaginatedResponse<Transaction>, initialSummary: TransactionSummary) {
  const [data, setData] = useState<PaginatedResponse<Transaction>>(initialData);
  const [summary, setSummary] = useState<TransactionSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Current active filters
  const [filters, setFilters] = useState<TransactionFilters>({ page: initialData.current_page });

  // Fetch logic wrapped in useCallback to avoid unnecessary re-renders
  const fetchTransactions = useCallback(async (currentFilters: TransactionFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      // Execute in parallel
      const [transactionsData, summaryData] = await Promise.all([
        transactionService.getTransactions(currentFilters),
        transactionService.getSummary()
      ]);
      setData(transactionsData);
      setSummary(summaryData);
      setFilters(currentFilters);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePage = useCallback((page: number) => {
    fetchTransactions({ ...filters, page });
  }, [filters, fetchTransactions]);

  const addTransaction = useCallback(async (payload: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionService.createTransaction(payload);
      // Reset to page 1 after adding
      await fetchTransactions({ ...filters, page: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
      setIsLoading(false);
      throw err;
    }
  }, [filters, fetchTransactions]);

  const updateTransaction = useCallback(async (id: number, payload: Partial<Transaction>) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionService.updateTransaction(id, payload);
      // Stay on the same page after update
      await fetchTransactions(filters);
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
      setIsLoading(false);
      throw err;
    }
  }, [filters, fetchTransactions]);

  const deleteTransaction = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionService.deleteTransaction(id);
      await fetchTransactions(filters);
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
      setIsLoading(false);
      throw err;
    }
  }, [filters, fetchTransactions]);

  return {
    transactions: data.data,
    pagination: {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
    },
    summary,
    isLoading,
    error,
    changePage,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
