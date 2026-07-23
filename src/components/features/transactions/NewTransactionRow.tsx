"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Transaction } from "@/types/transaction";

export function NewTransactionRow({ onAdd }: { onAdd: (data: Omit<Transaction, 'id'>) => Promise<void> }) {
  const [date, setDate] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState<"cash" | "rek">("cash");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !company || !description) return alert("Date, company, and description are required");
    setIsSubmitting(true);
    try {
      await onAdd({
        date,
        company,
        description,
        payment_method: payment,
        income: income ? Number(income) : 0,
        expense: expense ? Number(expense) : 0,
      });
      setDate("");
      setCompany("");
      setDescription("");
      setPayment("cash");
      setIncome("");
      setExpense("");
    } catch (e) {
      console.error(e);
      alert("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="bg-muted/20 border-b-2 border-border text-foreground">
      <td className="px-6 py-3 font-medium text-xs text-muted-foreground text-center">NEW</td>
      <td className="px-6 py-3">
         <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <select value={payment} onChange={e => setPayment(e.target.value as "cash" | "rek")} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50">
            <option value="cash">Cash</option>
            <option value="rek">Rek</option>
         </select>
      </td>
      <td className="px-6 py-3">
         <input 
           type="number" 
           value={income} 
           onChange={(e) => setIncome(e.target.value)} 
           disabled={expense.length > 0} 
           placeholder="Income..." 
           className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-emerald-700 dark:text-emerald-400 placeholder:text-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed" 
         />
      </td>
      <td className="px-6 py-3">
         <input 
           type="number" 
           value={expense} 
           onChange={(e) => setExpense(e.target.value)} 
           disabled={income.length > 0} 
           placeholder="Expense..." 
           className="w-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-rose-700 dark:text-rose-400 placeholder:text-rose-600/40 disabled:opacity-50 disabled:cursor-not-allowed" 
         />
      </td>
      <td className="px-6 py-3 text-xs text-muted-foreground text-center">-</td>
      <td className="px-6 py-3 text-right">
         <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
           {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add"}
         </button>
      </td>
    </tr>
  );
}
