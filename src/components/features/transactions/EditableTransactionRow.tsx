"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Transaction, Project, Account } from "@/types/transaction";

interface EditableTransactionRowProps {
  trx: Transaction;
  onUpdate: (id: number, data: Partial<Transaction>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  projects?: Project[];
  accounts?: Account[];
}

export function EditableTransactionRow({
  trx,
  onUpdate,
  onDelete,
  projects = [],
  accounts = [],
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
      await onDelete(trx.id);
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
      <td className="px-4 py-3 font-semibold text-sm">
        {trx.rekap_saldo !== undefined ? trx.rekap_saldo.toLocaleString("id-ID") : "-"}
      </td>
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
