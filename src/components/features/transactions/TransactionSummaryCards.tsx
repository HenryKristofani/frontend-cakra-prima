import { TransactionSummary } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";
import { Wallet, TrendingUp, TrendingDown, Landmark } from "lucide-react";

export function TransactionSummaryCards({ summary }: { summary: TransactionSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Saldo Kas</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total_saldo_kas)}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
          <Wallet className="w-5 h-5" />
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Pemasukan Bulan Ini</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formatCurrency(summary.pemasukan_bulan_ini)}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Pengeluaran Bulan Ini</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-500">{formatCurrency(summary.pengeluaran_bulan_ini)}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-500">
          <TrendingDown className="w-5 h-5" />
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Saldo Cash</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total_saldo_cash)}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
          <Landmark className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
