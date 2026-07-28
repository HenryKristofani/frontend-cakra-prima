"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Transaction, Project, Account } from "@/types/transaction";

interface NewTransactionRowProps {
  onAdd: (data: Omit<Transaction, "id">) => Promise<void>;
  projects?: Project[];
  accounts?: Account[];
  lockedProjectId?: number | string;
  lockedProjectName?: string;
}

export function NewTransactionRow({ onAdd, projects = [], accounts = [], lockedProjectId, lockedProjectName }: NewTransactionRowProps) {
  const searchParams = useSearchParams();
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  
  const initialDate = (year && year !== 'all' && month && month !== 'all') 
    ? `${year}-${month.padStart(2, '0')}-01` 
    : "";

  const [date, setDate] = useState(initialDate);

  // Sync date if URL changes
  useEffect(() => {
    if (year && year !== 'all' && month && month !== 'all') {
      setDate(`${year}-${month.padStart(2, '0')}-01`);
    } else {
      setDate("");
    }
  }, [year, month]);
  const [projectId, setProjectId] = useState<string>("");
  // ... rest initialized
  const [accountId, setAccountId] = useState<string>("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState<"cash" | "rek">("cash");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !description) return alert("Tanggal dan Deskripsi wajib diisi");
    setIsSubmitting(true);
    try {
      await onAdd({
        date,
        project_id: lockedProjectId ? Number(lockedProjectId) : (projectId ? Number(projectId) : null),
        account_id: accountId ? Number(accountId) : null,
        company: company || undefined,
        description,
        payment_method: payment,
        income: income ? Number(income) : 0,
        expense: expense ? Number(expense) : 0,
      });
      setDate(initialDate);
      if (!lockedProjectId) setProjectId("");
      setAccountId("");
      setCompany("");
      setDescription("");
      setPayment("cash");
      setIncome("");
      setExpense("");
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="bg-muted/20 border-b-2 border-border text-foreground">
      <td className="px-4 py-3 font-medium text-xs text-muted-foreground text-center">BARU</td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
        )}
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
      <td className="px-4 py-3 text-xs text-muted-foreground text-center">-</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-3.5 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Tambah"}
        </button>
      </td>
    </tr>
  );
}
