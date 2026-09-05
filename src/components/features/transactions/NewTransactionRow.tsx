"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Transaction, Project, Account } from "@/types/transaction";

interface NewTransactionRowProps {
  id: string;
  draft: Partial<Transaction>;
  onDraftChange: (id: string, data: Partial<Transaction>) => void;
  onRemove: (id: string) => void;
  projects?: Project[];
  accounts?: Account[];
  lockedProjectId?: number | string;
  lockedProjectName?: string;
  rapItems?: Array<{ id: number; description: string }>;
  rowError?: string | null;
}

export function NewTransactionRow({
  id,
  draft,
  onDraftChange,
  onRemove,
  projects = [],
  accounts = [],
  lockedProjectId,
  lockedProjectName,
  rapItems = [],
  rowError,
}: NewTransactionRowProps) {
  const searchParams = useSearchParams();
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  
  const initialDate = (year && year !== 'all' && month && month !== 'all') 
    ? `${year}-${month.padStart(2, '0')}-01` 
    : "";

  const [date, setDate] = useState(draft.date || initialDate);
  const [projectId, setProjectId] = useState<string>(draft.project_id ? String(draft.project_id) : (lockedProjectId ? String(lockedProjectId) : ""));
  const [accountId, setAccountId] = useState<string>(draft.account_id ? String(draft.account_id) : "");
  const [company, setCompany] = useState(draft.company || "");
  const [description, setDescription] = useState(draft.description || "");
  const [payment, setPayment] = useState<"cash" | "rek">(draft.payment_method || "cash");
  const [income, setIncome] = useState(draft.income ? String(draft.income) : "");
  const [expense, setExpense] = useState(draft.expense ? String(draft.expense) : "");
  const [rapItemId, setRapItemId] = useState<string>(draft.rap_item_id ? String(draft.rap_item_id) : "");

  const emitChange = useCallback((overrides: Record<string, any> = {}) => {
    const d = overrides.date ?? date;
    const pid = overrides.projectId ?? projectId;
    const aid = overrides.accountId ?? accountId;
    const desc = overrides.description ?? description;
    const pay = overrides.payment ?? payment;
    const inc = overrides.income ?? income;
    const exp = overrides.expense ?? expense;
    const rid = overrides.rapItemId ?? rapItemId;
    const comp = overrides.company ?? company;

    onDraftChange(id, {
      date: d,
      project_id: pid ? Number(pid) : null,
      account_id: aid ? Number(aid) : null,
      company: comp || undefined,
      description: desc,
      payment_method: pay as "cash" | "rek",
      income: inc ? Number(inc) : 0,
      expense: exp ? Number(exp) : 0,
      rap_item_id: rid ? Number(rid) : null,
    });
  }, [id, date, projectId, accountId, company, description, payment, income, expense, rapItemId, onDraftChange]);

  const rowBg = rowError
    ? "bg-rose-50/50 dark:bg-rose-900/10"
    : "bg-muted/20 border-b-2 border-border text-foreground";

  return (
    <tr className={rowBg}>
      <td className="px-4 py-3 font-medium text-xs text-muted-foreground text-center">
        <div className="flex flex-col gap-0.5">
          <span>BARU</span>
          {rowError && (
            <span className="text-[10px] font-semibold text-rose-600 leading-none">ERROR</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); emitChange({ date: e.target.value }); }}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        {lockedProjectId ? (
          <div className="w-full min-w-[130px] bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-sm font-medium flex items-center h-[34px] overflow-hidden whitespace-nowrap text-ellipsis">
            {lockedProjectName || "Project"}
          </div>
        ) : (
          <select
            value={projectId}
            onChange={(e) => { setProjectId(e.target.value); emitChange({ projectId: e.target.value }); }}
            className="w-full min-w-[130px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            <option value="">-- Pilih Project --</option>
            {projects.filter(p => !p.is_isolated_cash).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </td>
      {!(lockedProjectId && projects.find(p => p.id === Number(lockedProjectId))?.is_isolated_cash) && (
        <td className="px-4 py-3">
          <select
            value={accountId}
            onChange={(e) => { setAccountId(e.target.value); emitChange({ accountId: e.target.value }); }}
            className="w-full min-w-[130px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            <option value="">-- Pilih Akun --</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </td>
      )}
      <td className="px-4 py-3">
        <input
          type="text"
          value={description}
          onChange={(e) => { setDescription(e.target.value); emitChange({ description: e.target.value }); }}
          placeholder="Deskripsi..."
          className="w-full min-w-[180px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={payment}
          onChange={(e) => { setPayment(e.target.value as "cash" | "rek"); emitChange({ payment: e.target.value }); }}
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
          onChange={(e) => { setIncome(e.target.value); emitChange({ income: e.target.value }); }}
          disabled={expense.length > 0}
          placeholder="Pemasukan..."
          className="w-full min-w-[120px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-emerald-700 dark:text-emerald-400 placeholder:text-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={expense}
          onChange={(e) => { setExpense(e.target.value); emitChange({ expense: e.target.value }); }}
          disabled={income.length > 0}
          placeholder="Pengeluaran..."
          className="w-full min-w-[120px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-rose-700 dark:text-rose-400 placeholder:text-rose-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground text-right">-</td>
      
      {lockedProjectId && (
        <td className="px-4 py-3">
          {rapItems.length > 0 ? (
            <select
              value={rapItemId}
              onChange={(e) => { setRapItemId(e.target.value); emitChange({ rapItemId: e.target.value }); }}
              className="w-full min-w-[160px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              <option value="">-- Tanpa tag RAP --</option>
              {rapItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.description}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-muted-foreground/40">-</span>
          )}
        </td>
      )}
      
      <td className="px-4 py-3 text-xs text-muted-foreground">-</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {rowError && (
            <span className="text-[10px] text-rose-600 max-w-[100px] text-right leading-tight">{rowError}</span>
          )}
          <button
            onClick={() => onRemove(id)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
            title="Hapus baris ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}