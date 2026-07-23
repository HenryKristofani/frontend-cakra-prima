"use client";

import { Search, Filter, Loader2, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Transaction } from "@/types/transaction";
import { NewTransactionRow } from "./NewTransactionRow";
import { EditableTransactionRow } from "./EditableTransactionRow";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
  isLoading: boolean;
  changePage: (page: number) => void;
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
}

export function TransactionTable({
  transactions,
  pagination,
  isLoading,
  changePage,
  addTransaction,
  updateTransaction,
  deleteTransaction
}: TransactionTableProps) {
  
  const [exportYear, setExportYear] = useState<string>(new Date().getFullYear().toString());
  const [exportMonth, setExportMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (exportYear) params.append('year', exportYear);
      if (exportMonth) params.append('month', exportMonth);
      const url = `${API_BASE}/transactions-export?${params.toString()}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-arus-kas.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsExporting(false);
    }
  };

  const months = [
    { label: 'Semua Bulan', value: '' },
    ...Array.from({ length: 12 }, (_, i) => ({
      label: new Date(2000, i).toLocaleString('id-ID', { month: 'long' }),
      value: (i + 1).toString(),
    }))
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 justify-between items-center bg-muted/30">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <select
            value={exportMonth}
            onChange={e => setExportMonth(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-foreground"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select
            value={exportYear}
            onChange={e => setExportYear(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-foreground"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-60"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        </div>
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
              <th className="px-6 py-4 font-medium">Rekap Saldo</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <NewTransactionRow onAdd={addTransaction} />
            {transactions.map((trx) => (
              <EditableTransactionRow 
                key={trx.id} 
                trx={trx} 
                onUpdate={updateTransaction}
                onDelete={deleteTransaction}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground bg-muted/20">
        <p>Showing {transactions.length} of {pagination.total} transactions</p>
        <div className="flex gap-1">
          <button 
            onClick={() => changePage(Math.max(1, pagination.current_page - 1))} 
            disabled={pagination.current_page <= 1}
            className="px-3 py-1 border border-border rounded bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground">
              Previous
          </button>
          <button 
            onClick={() => changePage(Math.min(pagination.last_page, pagination.current_page + 1))} 
            disabled={pagination.current_page >= pagination.last_page}
            className="px-3 py-1 border border-border rounded bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
          </button>
        </div>
      </div>
    </div>
  );
}
