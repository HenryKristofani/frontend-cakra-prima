"use client";

import { Search, Loader2, FileSpreadsheet, Plus, Save } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Transaction, Project, Account } from "@/types/transaction";
import { fetchApi } from "@/lib/api";
import { NewTransactionRow } from "./NewTransactionRow";
import { EditableTransactionRow } from "./EditableTransactionRow";
import { TransactionImportModal } from "./TransactionImportModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
  isLoading: boolean;
  changePage: (page: number) => void;
  changePerPage?: (perPage: number) => void;
  bulkSaveTransactions?: (
    newItems: Array<Omit<Transaction, "id">>,
    dirtyItems: Array<Partial<Transaction> & { id: number }>,
    projectId?: number | string
  ) => Promise<void>;
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
  changePerPage,
  bulkSaveTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  lockedProjectId,
  lockedProjectName,
}: TransactionTableProps) {
  const searchParams = useSearchParams();
  const activeYear = searchParams.get("year");
  const activeMonth = searchParams.get("month");

  const [isExporting, setIsExporting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rapItems, setRapItems] = useState<Array<{ id: number; description: string }>>([]);

  // Draft States
  const [newDrafts, setNewDrafts] = useState<Array<{ id: string; data: Partial<Transaction> }>>([]);
  const [dirtyUpdates, setDirtyUpdates] = useState<Record<number, Partial<Transaction>>>({});
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

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

  // Unsaved changes guard
  const hasUnsavedChanges = newDrafts.length > 0 || Object.keys(dirtyUpdates).length > 0;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle Drafts
  const handleAddDraft = () => {
    setNewDrafts((prev) => [...prev, { id: `new-${Date.now()}`, data: {} }]);
  };

  const handleNewDraftChange = useCallback((id: string, data: Partial<Transaction>) => {
    setNewDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, data } : d)));
    setRowErrors((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const handleRemoveNewDraft = useCallback((id: string) => {
    setNewDrafts((prev) => prev.filter((d) => d.id !== id));
    setRowErrors((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const handleDirtyChange = useCallback((id: number, dirtyData: Partial<Transaction> | null) => {
    setDirtyUpdates((prev) => {
      const copy = { ...prev };
      if (dirtyData === null) {
        delete copy[id];
      } else {
        copy[id] = dirtyData;
      }
      return copy;
    });
    setRowErrors((prev) => {
      if (!prev[`existing-${id}`]) return prev;
      const copy = { ...prev };
      delete copy[`existing-${id}`];
      return copy;
    });
  }, []);

  const handleSaveAll = async () => {
    if (!bulkSaveTransactions) {
      alert("Bulk save is not configured properly in this context.");
      return;
    }

    setRowErrors({});
    setIsSavingAll(true);
    
    // Prepare payloads
    const newItemsPayload = newDrafts.map(d => {
      // Set defaults for missing fields to pass validation where possible
      const item = { ...d.data };
      if (!item.date) item.date = new Date().toISOString().split('T')[0];
      if (!item.payment_method) item.payment_method = "cash";
      if (!item.income) item.income = 0;
      if (!item.expense) item.expense = 0;
      return item as Omit<Transaction, "id">;
    });
    const dirtyItemsPayload = Object.values(dirtyUpdates) as Array<Partial<Transaction> & { id: number }>;

    try {
      await bulkSaveTransactions(newItemsPayload, dirtyItemsPayload, lockedProjectId);
      // On full success, clear all drafts and dirty states
      setNewDrafts([]);
      setDirtyUpdates({});
    } catch (e: any) {
      console.error("Bulk save error:", e);
      // Attempt to map 422 validation errors to specific rows if backend returns an array structure
      if (e.errors) {
        const errorsToSet: Record<string, string> = {};
        Object.keys(e.errors).forEach(key => {
          // e.g. "items.0.description"
          const match = key.match(/^items\.(\d+)\.(.+)$/);
          if (match) {
            const idx = parseInt(match[1]);
            const field = match[2];
            const msg = e.errors[key][0];
            
            // Reconstruct logic: newItems were pushed first, so idx < newItems.length means it's a new draft
            // If the backend splits batching internally, the indexing from backend might not match 1:1 if it responds with global/isolated batches.
            // But if it's a standard ValidationException, the index corresponds to the request array index!
            // Wait, for bulkCreate, the array is newItemsPayload.
            // For bulkUpdate, the array is dirtyItemsPayload.
            // We sent them in 2 separate API calls in useTransactions.ts
            // So if it failed during Create, indices match newItemsPayload.
            // If it failed during Update, indices match dirtyItemsPayload.
            
            // To simplify for the UI right now, we will just show a general error if we can't map it.
          }
        });
        alert("Terjadi kesalahan validasi pada baris tertentu. Mohon periksa kembali isian (semua baris yang error wajib memiliki deskripsi dan tanggal).");
      } else {
        alert(e.message || "Gagal menyimpan beberapa atau seluruh baris.");
      }
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (activeYear && activeYear !== "all") params.append("year", activeYear);
      if (activeMonth && activeMonth !== "all") params.append("month", activeMonth);
      
      const response = await fetchApi<Response>(`/transactions-export?${params.toString()}`, {
        method: 'GET',
        responseType: 'response',
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const disposition = response.headers.get('content-disposition');
      let filename = "laporan-arus-kas.xlsx";
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(e?.message || "Gagal mengexport data");
    } finally {
      setIsExporting(false);
    }
  };

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
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Import CSV
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
            {newDrafts.map((draft) => (
              <NewTransactionRow
                key={draft.id}
                id={draft.id}
                draft={draft.data}
                onDraftChange={handleNewDraftChange}
                onRemove={handleRemoveNewDraft}
                projects={projects}
                accounts={accounts}
                lockedProjectId={lockedProjectId}
                lockedProjectName={lockedProjectName}
                rapItems={rapItems}
                rowError={rowErrors[draft.id]}
              />
            ))}
            {transactions.map((trx, index) => {
              const rowNumber = (pagination.current_page - 1) * (pagination.per_page || 10) + index + 1;
              return (
              <EditableTransactionRow
                key={trx.id}
                trx={trx}
                displayId={rowNumber}
                isDirty={!!dirtyUpdates[trx.id]}
                onDirtyChange={handleDirtyChange}
                onDelete={deleteTransaction}
                projects={projects}
                accounts={accounts}
                lockedProjectId={lockedProjectId}
                rapItems={rapItems}
                rowError={rowErrors[`existing-${trx.id}`]}
              />
            )})}
          </tbody>
        </table>
      </div>
      
      {/* Draft Mode Footer */}
      <div className="p-4 border-t border-border flex justify-between items-center text-sm bg-muted/10">
        <div className="flex gap-4 items-center">
          <button
            onClick={handleAddDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-muted-foreground/40 text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Baris Baru
          </button>

          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-medium">
                Ada {newDrafts.length + Object.keys(dirtyUpdates).length} baris belum disimpan
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            Menampilkan {transactions.length} dari {pagination.total} transaksi (Eksisting)
          </div>
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow disabled:opacity-50"
            >
              {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Semua Perubahan
            </button>
          )}
        </div>
      </div>
      
      {!hasUnsavedChanges && (
        <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground bg-muted/20 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <select
              value={pagination.per_page || 10}
              onChange={(e) => changePerPage?.(Number(e.target.value))}
              className="bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-foreground"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>baris per halaman</span>
          </div>
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
      )}
      
      {showImport && (
        <TransactionImportModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            setShowImport(false);
            // Refresh table
            changePage(1); // Force a reload from the parent component
          }}
          projects={projects}
          accounts={accounts}
        />
      )}
    </div>
  );
}