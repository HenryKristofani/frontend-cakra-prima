import { fetchApi } from '@/lib/api';
import { 
  PaginatedResponse, 
  Transaction, 
  TransactionFilters, 
  TransactionSummary 
} from '@/types/transaction';

export const transactionService = {
  /**
   * Fetch a paginated list of transactions, optionally filtered by month and year.
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
    return fetchApi<PaginatedResponse<Transaction>>('/transactions', {
      method: 'GET',
      params: filters as Record<string, string | number | undefined>,
    });
  },

  /**
   * Fetch the summary of transactions (balances and monthly totals).
   */
  async getSummary(filters: TransactionFilters = {}): Promise<TransactionSummary> {
    return fetchApi<TransactionSummary>('/transactions-summary', {
      method: 'GET',
      params: filters as Record<string, string | number | undefined>,
    });
  },

  /**
   * Create a new transaction.
   */
  async createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    return fetchApi<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create a new transaction specifically for a project (nested route).
   */
  async createProjectTransaction(projectId: number | string, data: Omit<Transaction, 'id' | 'project_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    return fetchApi<Transaction>(`/projects/${projectId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing transaction.
   */
  async updateTransaction(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<Transaction> {
    return fetchApi<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a transaction.
   */
  async deleteTransaction(id: number, projectId?: number | string | null): Promise<void> {
    const params = projectId ? { project_id: projectId } : undefined;
    return fetchApi<void>(`/transactions/${id}`, {
      method: 'DELETE',
      params: params as Record<string, string | number | undefined>,
    });
  },

  /**
   * Bulk create transactions for a project (uses /projects/{id}/transactions/bulk).
   */
  async bulkCreateProjectTransactions(
    projectId: number | string,
    items: Array<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Transaction[]> {
    return fetchApi<Transaction[]>(`/projects/${projectId}/transactions/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  /**
   * Bulk update existing transactions (each item MUST include project_id for routing).
   */
  async bulkUpdateTransactions(
    items: Array<Partial<Transaction> & { id: number; project_id?: number | null }>
  ): Promise<Transaction[]> {
    return fetchApi<Transaction[]>('/transactions/bulk', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  /**
   * Bulk create new transactions (each item MUST include project_id for routing).
   */
  async bulkCreateTransactions(
    items: Array<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Transaction[]> {
    return fetchApi<Transaction[]>('/transactions/bulk', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};
