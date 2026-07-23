"use client";

import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { transactionService } from "@/lib/services/transactionService";
import { Transaction } from "@/types/transaction";
import { NewTransactionRow } from "./NewTransactionRow";
import { EditableTransactionRow } from "./EditableTransactionRow";

export function KasTransactionTable() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchTransactions = async (p: number = 1) => {
    setIsLoading(true);
    try {
      const data = await transactionService.getTransactions({ page: p });
      setTransactions(data.data);
      setPage(data.current_page);
      setLastPage(data.last_page);
      setTotalItems(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  const handleAdd = async (data: Omit<Transaction, "id" | "created_at" | "updated_at">) => {
    await transactionService.createTransaction(data);
    fetchTransactions(1); 
  };

  const handleUpdate = async (id: number, data: Partial<Omit<Transaction, "id" | "created_at" | "updated_at">>) => {
    await transactionService.updateTransaction(id, data);
    fetchTransactions(page); 
  };

  const handleDelete = async (id: number) => {
    await transactionService.deleteTransaction(id);
    fetchTransactions(page);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-foreground"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap text-foreground">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
      
      <div className="overflow-x-auto relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        )}
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Transaction ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Company</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Payment</th>
              <th className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-500">In (Income)</th>
              <th className="px-6 py-4 font-medium text-rose-600 dark:text-rose-500">Out (Expense)</th>
              <th className="px-6 py-4 font-medium text-rose-600 dark:text-rose-500">Rekap Saldo</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <NewTransactionRow onAdd={handleAdd} />
            {transactions.map((trx) => (
              <EditableTransactionRow key={trx.id} trx={trx} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground bg-muted/20">
        <p>Showing {transactions.length} of {totalItems} transactions</p>
        <div className="flex gap-1">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page <= 1}
            className="px-3 py-1 border border-border rounded bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground">
              Previous
          </button>
          <button 
            onClick={() => setPage(p => Math.min(lastPage, p + 1))} 
            disabled={page >= lastPage}
            className="px-3 py-1 border border-border rounded bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
          </button>
        </div>
      </div>
    </div>
  );
}