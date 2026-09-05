"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Transaction, Project, Account } from "@/types/transaction";

interface EditableTransactionRowProps {
  trx: Transaction;
  onDirtyChange: (id: number, dirtyData: Partial<Transaction> | null) => void;
  onDelete: (id: number, projectId?: number | string | null) => Promise<void>;
  projects?: Project[];
  accounts?: Account[];
  lockedProjectId?: number | string;
  rapItems?: Array<{ id: number; description: string }>;
  rowError?: string | null;
  displayId?: number;
  isDirty?: boolean;
}

export function EditableTransactionRow({
  trx,
  onDirtyChange,
  onDelete,
  projects = [],
  accounts = [],
  lockedProjectId,
  rapItems = [],
  rowError,
  displayId,
  isDirty = false,
}: EditableTransactionRowProps) {
  const [date, setDate] = useState(trx.date?.split("T")[0] || "");
  const [projectId, setProjectId] = useState<string>(trx.project_id ? String(trx.project_id) : "");
  const [accountId, setAccountId] = useState<string>(trx.account_id ? String(trx.account_id) : "");
  const [company, setCompany] = useState(trx.company || "");
  const [description, setDescription] = useState(trx.description || "");
  const [payment, setPayment] = useState<"cash" | "rek">(trx.payment_method || "cash");

  const initialIncome = trx.income && Number(trx.income) > 0 ? Number(trx.income).toString() : "";
  const initialExpense = trx.expense && Number(trx.expense) > 0 ? Number(trx.expense).toString() : "";
  const [income, setIncome] = useState(initialIncome);
  const [expense, setExpense] = useState(initialExpense);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rapItemId, setRapItemId] = useState<string>(trx.rap_item_id ? String(trx.rap_item_id) : "");

  useEffect(() => {
    if (projects.length > 0 && trx.project_id) {
      if (projects.some(p => p.id === trx.project_id)) {
        setProjectId(String(trx.project_id));
      }
    }
  }, [projects, trx.project_id]);

  const allRapItems = [...rapItems];
  if (trx.rap_item && !allRapItems.find(i => i.id === trx.rap_item?.id)) {
    allRapItems.push(trx.rap_item);
  }

  const buildDirtyPayload = useCallback((overrides: Record<string, any> = {}) => {
    const d = overrides.date ?? date;
    const pid = overrides.projectId ?? projectId;
    const aid = overrides.accountId ?? accountId;
    const desc = overrides.description ?? description;
    const pay = overrides.payment ?? payment;
    const inc = overrides.income ?? income;
    const exp = overrides.expense ?? expense;
    const rid = overrides.rapItemId ?? rapItemId;
    const comp = overrides.company ?? company;
    return {
      id: trx.id,
      project_id: pid ? Number(pid) : (trx.project_id ?? null),
      date: d,
      account_id: aid ? Number(aid) : null,
      company: comp || undefined,
      description: desc,
      payment_method: pay as "cash" | "rek",
      income: inc ? Number(inc) : 0,
      expense: exp ? Number(exp) : 0,
      rap_item_id: rid ? Number(rid) : null,
    };
  }, [date, projectId, accountId, company, description, payment, income, expense, rapItemId, trx.id, trx.project_id]);

  const markDirty = useCallback((overrides: Record<string, any> = {}) => {
    onDirtyChange(trx.id, buildDirtyPayload(overrides));
  }, [buildDirtyPayload, trx.id, onDirtyChange]);

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    setIsDeleting(true);
    try {
      onDirtyChange(trx.id, null);
      await onDelete(trx.id, trx.project_id);
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus transaksi");
      setIsDeleting(false);
    }
  };

  const isIsolated = !!(lockedProjectId && projects.find(p => p.id === Number(lockedProjectId))?.is_isolated_cash);

  const rowBg = rowError
    ? "bg-rose-50/50 dark:bg-rose-900/10"
    : isDirty
    ? "bg-amber-50/60 dark:bg-amber-500/5 border-l-2 border-amber-400"
    : "bg-card hover:bg-muted/50 transition-colors";

  return (
    <tr className={`text-foreground ${rowBg}`}>
      <td className="px-4 py-3 font-medium text-xs text-muted-foreground">
        <div className="flex flex-col gap-0.5">
          <span>{displayId ?? trx.id}</span>
          {isDirty && !rowError && (
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 leading-none">DRAFT</span>
          )}
          {rowError && (
            <span className="text-[10px] font-semibold text-rose-600 leading-none">ERROR</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); markDirty({ date: e.target.value }); }}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={projectId}
          onChange={(e) => { setProjectId(e.target.value); markDirty({ projectId: e.target.value }); }}
          className="w-full min-w-[130px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <option value="">-- Pilih Project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </td>
      {!isIsolated && (
        <td className="px-4 py-3">
          <select
            value={accountId}
            onChange={(e) => { setAccountId(e.target.value); markDirty({ accountId: e.target.value }); }}
            className="w-full min-w-[130px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            <option value="">-- Pilih Akun --</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
            ))}
          </select>
        </td>
      )}
      <td className="px-4 py-3">
        <input
          type="text"
          value={description}
          onChange={(e) => { setDescription(e.target.value); markDirty({ description: e.target.value }); }}
          placeholder="Deskripsi..."
          className="w-full min-w-[180px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={payment}
          onChange={(e) => { setPayment(e.target.value as "cash" | "rek"); markDirty({ payment: e.target.value }); }}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <option value="cash">Cash</option>
          <option value="rek">Rek</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={income}
          onChange={(e) => { setIncome(e.target.value); markDirty({ income: e.target.value }); }}
          disabled={expense.length > 0}
          placeholder="Pemasukan..."
          className="w-full min-w-[120px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-emerald-700 dark:text-emerald-400 placeholder:text-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={expense}
          onChange={(e) => { setExpense(e.target.value); markDirty({ expense: e.target.value }); }}
          disabled={income.length > 0}
          placeholder="Pengeluaran..."
          className="w-full min-w-[120px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-rose-700 dark:text-rose-400 placeholder:text-rose-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-4 py-3 font-semibold text-sm text-right whitespace-nowrap">
        {trx.rekap_saldo !== undefined ? new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(trx.rekap_saldo) : "-"}
      </td>
      {lockedProjectId && (
        <td className="px-4 py-3">
          {allRapItems.length > 0 ? (
            <select
              value={rapItemId}
              onChange={(e) => { setRapItemId(e.target.value); markDirty({ rapItemId: e.target.value }); }}
              className="w-full min-w-[160px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              <option value="">-- Tanpa tag RAP --</option>
              {allRapItems.map((item) => (
                <option key={item.id} value={item.id}>{item.description}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-muted-foreground/40">-</span>
          )}
        </td>
      )}
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {trx.updated_at
          ? (() => {
              const diff = Date.now() - new Date(trx.updated_at).getTime();
              const mins = Math.floor(diff / 60000);
              const hours = Math.floor(diff / 3600000);
              const days = Math.floor(diff / 86400000);
              if (mins < 1) return 'Baru saja';
              if (mins < 60) return `${mins} menit lalu`;
              if (hours < 24) return `${hours} jam lalu`;
              if (days < 7) return `${days} hari lalu`;
              return new Date(trx.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            })()
          : '-'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {rowError && (
            <span className="text-[10px] text-rose-600 max-w-[100px] text-right leading-tight">{rowError}</span>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}