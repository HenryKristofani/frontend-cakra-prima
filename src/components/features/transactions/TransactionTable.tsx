"use client";

import { Search, Loader2, FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Transaction, Project, Account } from "@/types/transaction";
import { fetchApi } from "@/lib/api";
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
  addTransaction: (data: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  lockedProjectId?: number | string;
  lockedProjectName?: string;
}

export function TransactionTable({
  transactions,
  pagination,
  isLoading,
  changePage,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  lockedProjectId,
  lockedProjectName,
}: TransactionTableProps) {
  // Read the active period filter from the URL (same source as Navbar)
  const searchParams = useSearchParams();
  const activeYear = searchParams.get("year");
  const activeMonth = searchParams.get("month");

  const [isExporting, setIsExporting] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rapItems, setRapItems] = useState<Array<{ id: number; description: string }>>([]);

  useEffect(() => {
    fetchApi<Project[]>('/projects')
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Failed to load projects", e));

    fetchApi<Account[]>('/accounts')
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Failed to load accounts", e));
      
    if (lockedProjectId) {
      fetchApi<Array<{ id: number; description: string }>>(`/projects/${lockedProjectId}/rap-items`)
        .then((data) => setRapItems(Array.isArray(data) ? data : []))
        .catch((e) => console.error("Failed to load rap items", e));
    }
  }, [lockedProjectId]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      // Use the same year/month that's active in the Navbar filter
      if (activeYear && activeYear !== "all") params.append("year", activeYear);
      if (activeMonth && activeMonth !== "all") params.append("month", activeMonth);
      const url = `${API_BASE}/transactions-export?${params.toString()}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = "laporan-arus-kas.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsExporting(false);
    }
  };

  // Build a human-readable label for the active period (shown on the export button tooltip)
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const periodLabel = (activeYear && activeYear !== "all")
    ? `${(activeMonth && activeMonth !== "all") ? monthNames[parseInt(activeMonth) - 1] + " " : ""}${activeYear}`
    : "Semua Periode";

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 justify-between items-center bg-muted/30">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Read-only badge showing which period will be exported */}
          <span className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Periode: <strong className="text-foreground">{periodLabel}</strong>
          </span>
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
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Project</th>
              {!(lockedProjectId && projects.find(p => p.id === Number(lockedProjectId))?.is_isolated_cash) && (
                <th className="px-4 py-3 font-medium">Akun</th>
              )}
              <th className="px-4 py-3 font-medium">Deskripsi</th>
              <th className="px-4 py-3 font-medium">Metode</th>
              <th className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-500">Pemasukan</th>
              <th className="px-4 py-3 font-medium text-rose-600 dark:text-rose-500">Pengeluaran</th>
              <th className="px-4 py-3 font-medium">Rekap Saldo</th>
              {lockedProjectId && (
                <th className="px-4 py-3 font-medium">Item RAP</th>
              )}
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <NewTransactionRow 
              onAdd={addTransaction} 
              projects={projects} 
              accounts={accounts} 
              lockedProjectId={lockedProjectId}
              lockedProjectName={lockedProjectName}
              rapItems={rapItems}
            />
            {transactions.map((trx) => (
              <EditableTransactionRow
                key={trx.id}
                trx={trx}
                onUpdate={updateTransaction}
                onDelete={deleteTransaction}
                projects={projects}
                accounts={accounts}
                lockedProjectId={lockedProjectId}
                rapItems={rapItems}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground bg-muted/20">
        <p>
          Menampilkan {transactions.length} dari {pagination.total} transaksi
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => changePage(Math.max(1, pagination.current_page - 1))}
            disabled={pagination.current_page <= 1}
            className="px-3 py-1 border border-border rounded bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
          >
            Sebelumnya
          </button>
          <button
            onClick={() => changePage(Math.min(pagination.last_page, pagination.current_page + 1))}
            disabled={pagination.current_page >= pagination.last_page}
            className="px-3 py-1 border border-border rounded bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}
