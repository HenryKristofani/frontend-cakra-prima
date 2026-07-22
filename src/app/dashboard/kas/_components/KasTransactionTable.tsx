"use client";

import { Search, Filter, MoreHorizontal } from "lucide-react";
import { useState } from "react";

function NewTransactionRow() {
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");

  return (
    <tr className="bg-muted/20 border-b-2 border-border text-foreground">
      <td className="px-6 py-3 font-medium text-xs text-muted-foreground text-center">NEW</td>
      <td className="px-6 py-3">
         <input type="date" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <input type="text" placeholder="Company..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <input type="text" placeholder="Description..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50">
            <option value="Cash">Cash</option>
            <option value="Rek">Rek</option>
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
      <td className="px-6 py-3 font-medium text-xs text-muted-foreground text-center"></td>
      <td className="px-6 py-3 text-right">
         <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
           Add
         </button>
      </td>
    </tr>
  );
}

function EditableTransactionRow({ trx }: { trx: any }) {
  const initialIncome = trx.type === 'income' ? trx.amount.replace(/[^0-9]/g, '') : '';
  const initialExpense = trx.type === 'expense' ? trx.amount.replace(/[^0-9]/g, '') : '';
  const [income, setIncome] = useState(initialIncome);
  const [expense, setExpense] = useState(initialExpense);

  return (
    <tr className="bg-card hover:bg-muted/50 transition-colors text-foreground">
      <td className="px-6 py-3 font-medium text-xs text-muted-foreground">{trx.id}</td>
      <td className="px-6 py-3">
         <input type="date" defaultValue={trx.date} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <input type="text" defaultValue={trx.company} placeholder="Company..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <input type="text" defaultValue={trx.description} placeholder="Description..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50" />
      </td>
      <td className="px-6 py-3">
         <select defaultValue={trx.payment} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50">
            <option value="Cash">Cash</option>
            <option value="Rek">Rek</option>
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
      <td className="px-6 py-3 font-medium text-xs text-muted-foreground">{trx.rekapsaldo}</td>
      <td className="px-6 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md transition-colors">
            Save
          </button>
          <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function KasTransactionTable() {
  const transactions = [
    { id: "TRX-001", date: "2026-10-25", company: "Kopi Kenangan", description: "Pembelian Cat", type: "income", amount: "Rp 15.000.000", payment: "Cash", rekapsaldo: "Rp 39.500.000" },
    { id: "TRX-002", date: "2026-10-24", company: "Cakra Prima",description: "Pembelian ATK Kantor", type: "expense", amount: "Rp 320.000", payment: "Cash", rekapsaldo: "Rp 39.180.000" },
    { id: "TRX-003", date: "2026-10-23", company: "Cakra Prima",description: "Donasi Kegiatan Sosial", type: "income", amount: "Rp 500.000", payment: "Rek", rekapsaldo: "Rp 39.680.000" },
    { id: "TRX-004", date: "2026-10-22", company: "Cakra Prima",description: "Biaya Internet & Listrik", type: "expense", amount: "Rp 850.000", payment: "Rek", rekapsaldo: "Rp 38.830.000" },
    { id: "TRX-005", date: "2026-10-20", company: "Cakra Prima",description: "Pembayaran Iuran Bulanan", type: "income", amount: "Rp 150.000", payment: "Cash", rekapsaldo: "Rp 38.980.000" },
  ];

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
      
      <div className="overflow-x-auto">
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
            <NewTransactionRow />
            {transactions.map((trx) => (
              <EditableTransactionRow key={trx.id} trx={trx} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground bg-muted/20">
        <p>Showing 5 of 24 transactions</p>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-border rounded bg-background hover:bg-muted transition-colors opacity-50 cursor-not-allowed">Previous</button>
          <button className="px-3 py-1 border border-border rounded bg-background text-foreground hover:bg-muted transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}