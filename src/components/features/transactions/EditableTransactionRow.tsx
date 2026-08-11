"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Transaction, Project, Account } from "@/types/transaction";
import { fetchApi } from "@/lib/api";

interface EditableTransactionRowProps {
  trx: Transaction;
  onUpdate: (id: number, data: Partial<Transaction>) => Promise<void>;
  onDelete: (id: number, projectId?: number | string | null) => Promise<void>;
  projects?: Project[];
  accounts?: Account[];
  lockedProjectId?: number | string;
  rapItems?: Array<{ id: number; description: string }>;
}

export function EditableTransactionRow({
  trx,
  onUpdate,
  onDelete,
  projects = [],
  accounts = [],
  lockedProjectId,
  rapItems = [],
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync projectId when projects load, but only if it matches a valid project
  useEffect(() => {
    if (projects.length > 0 && trx.project_id) {
      // Ensure the project_id exists in the loaded projects
      if (projects.some(p => p.id === trx.project_id)) {
        setProjectId(String(trx.project_id));
      }
    }
  }, [projects, trx.project_id]);

  // Make sure if the transaction already has a rap_item, it is included in the options
  const allRapItems = [...rapItems];
  if (trx.rap_item && !allRapItems.find(i => i.id === trx.rap_item?.id)) {
    allRapItems.push(trx.rap_item);
  }

  const [rapItemId, setRapItemId] = useState<string>(trx.rap_item_id ? String(trx.rap_item_id) : "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(trx.id, {
        date,
        project_id: projectId ? Number(projectId) : null,
        account_id: accountId ? Number(accountId) : null,
        company: company || undefined,
        description,
        payment_method: payment,
        income: income ? Number(income) : 0,
        expense: expense ? Number(expense) : 0,
        rap_item_id: rapItemId ? Number(rapItemId) : null,
      });
    } catch (e) {
      console.error(e);
      alert("Gagal memperbarui transaksi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    setIsDeleting(true);
    try {
      await onDelete(trx.id, trx.project_id);
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus transaksi");
      setIsDeleting(false);
    }
  };

  return (
    <tr className="bg-card hover:bg-muted/50 transition-colors text-foreground">
      <td className="px-4 py-3 font-medium text-xs text-muted-foreground">{trx.id}</td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full min-w-[130px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <option value="">-- Pilih Project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </td>
      {!(lockedProjectId && projects.find(p => p.id === Number(lockedProjectId))?.is_isolated_cash) && (
        <td className="px-4 py-3">
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
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
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi..."
          className="w-full min-w-[180px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value as "cash" | "rek")}
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
          onChange={(e) => setIncome(e.target.value)}
          disabled={expense.length > 0}
          placeholder="Pemasukan..."
          className="w-full min-w-[120px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-emerald-700 dark:text-emerald-400 placeholder:text-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={expense}
          onChange={(e) => setExpense(e.target.value)}
          disabled={income.length > 0}
          placeholder="Pengeluaran..."
          className="w-full min-w-[120px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-rose-700 dark:text-rose-400 placeholder:text-rose-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-4 py-3 font-semibold text-sm text-right whitespace-nowrap">
        {trx.rekap_saldo !== undefined ? trx.rekap_saldo.toLocaleString("id-ID") : "-"}
      </td>
      {lockedProjectId && (
        <td className="px-4 py-3">
          {/* RAP Item dropdown — tampil hanya kalau project punya RAP */}
          {allRapItems.length > 0 ? (
            <select
              value={rapItemId}
              onChange={(e) => setRapItemId(e.target.value)}
              className="w-full min-w-[160px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              <option value="">-- Tanpa tag RAP --</option>
              {allRapItems.map((item) => (
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
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
          </button>
          <button
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}
