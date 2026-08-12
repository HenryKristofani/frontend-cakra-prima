import { useState, useCallback } from 'react';
import { transactionService } from '@/lib/services/transactionService';
import { PaginatedResponse, Transaction, TransactionFilters, TransactionSummary } from '@/types/transaction';

export function useTransactions(
  initialData: PaginatedResponse<Transaction>,
  initialSummary: TransactionSummary,
  initialFilters: TransactionFilters = {}
) {
  const [data, setData] = useState<PaginatedResponse<Transaction>>(initialData);
  const [summary, setSummary] = useState<TransactionSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Current active filters (initialised from props, updated on page change)
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  // Fetch logic wrapped in useCallback to avoid unnecessary re-renders
  const fetchTransactions = useCallback(async (currentFilters: TransactionFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      // Execute in parallel
      const [transactionsData, summaryData] = await Promise.all([
        transactionService.getTransactions(currentFilters),
        transactionService.getSummary(currentFilters)
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
      if (filters.project_id) {
        // If we are in project context, use nested route
        const { project_id, ...restPayload } = payload;
        await transactionService.createProjectTransaction(filters.project_id, restPayload as Omit<Transaction, 'id' | 'project_id' | 'created_at' | 'updated_at'>);
      } else {
        await transactionService.createTransaction(payload);
      }
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

  const deleteTransaction = useCallback(async (id: number, projectId?: number | string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionService.deleteTransaction(id, projectId);
      await fetchTransactions(filters);
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
      setIsLoading(false);
      throw err;
    }
  }, [filters, fetchTransactions]);

  const bulkSaveTransactions = useCallback(async (
    newItems: Array<Omit<Transaction, 'id'>>,
    dirtyItems: Array<Partial<Transaction> & { id: number }>,
    projectId?: number | string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (newItems.length > 0 && projectId) {
        // Strip project_id from each item (server uses route param)
        const payloads = newItems.map(({ project_id, ...rest }) => rest);
        await transactionService.bulkCreateProjectTransactions(projectId, payloads as any);
      } else if (newItems.length > 0) {
        // Global context: use global bulk create endpoint
        await transactionService.bulkCreateTransactions(newItems as any);
      }
      if (dirtyItems.length > 0) {
        await transactionService.bulkUpdateTransactions(dirtyItems as any);
      }
      // Refresh page 1 after all saves
      await fetchTransactions({ ...filters, page: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to bulk save transactions');
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
    bulkSaveTransactions,
  };
}
