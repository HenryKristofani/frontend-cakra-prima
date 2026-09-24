"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionSummary } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";
import { Wallet, TrendingUp, TrendingDown, Landmark } from "lucide-react";
import { KasByFundSourceBreakdown } from "./KasByFundSourceBreakdown";

interface TransactionSummaryCardsProps {
  summary: TransactionSummary;
  projectId?: number | string;
}

export function TransactionSummaryCards({ summary, projectId }: TransactionSummaryCardsProps) {
  const searchParams = useSearchParams();
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth() + 1);

  const isAllPeriod = !year && !month;
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const incomeLabel = useMemo(() => {
    if (isAllPeriod) return "Pemasukan Semua Periode";
    return isCurrentMonth ? "Pemasukan Bulan Ini" : "Pemasukan Periode Ini";
  }, [isAllPeriod, isCurrentMonth]);

  const expenseLabel = useMemo(() => {
    if (isAllPeriod) return "Pengeluaran Semua Periode";
    return isCurrentMonth ? "Pengeluaran Bulan Ini" : "Pengeluaran Periode Ini";
  }, [isAllPeriod, isCurrentMonth]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-start justify-between md:col-span-2 lg:col-span-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">Total Saldo Kas</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total_saldo_kas)}</p>
          <KasByFundSourceBreakdown projectId={projectId} totalSaldoKas={summary.total_saldo_kas} />
        </div>
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand flex-shrink-0 ml-4">
          <Wallet className="w-5 h-5" />
        </div>
      </div>

      
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{incomeLabel}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formatCurrency(summary.pemasukan_bulan_ini)}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{expenseLabel}</p>
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
