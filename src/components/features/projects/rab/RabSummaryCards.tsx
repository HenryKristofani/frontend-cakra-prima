import { RabSummary } from '@/types/rab';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, Scissors, CheckCircle } from 'lucide-react';

interface RabSummaryCardsProps {
  summary: RabSummary;
}

export function RabSummaryCards({ summary }: RabSummaryCardsProps) {
  const { total_rab_aktif, total_deduction, final_total, overall_progress_percentage } = summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total RAB Aktif */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">Total RAB Aktif</p>
          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(total_rab_aktif)}</p>
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progress Keseluruhan</span>
            <span className="ml-auto text-sm font-semibold text-blue-600 dark:text-blue-400">
              {overall_progress_percentage}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(overall_progress_percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total Pengurangan */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">Total Pengurangan</p>
          <div className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          {formatCurrency(total_deduction)}
        </p>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Item berstatus <span className="font-medium text-rose-500">dikurangi</span> tidak masuk kalkulasi progress
        </p>
      </div>

      {/* Jumlah Akhir */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">Jumlah Akhir</p>
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatCurrency(final_total)}
        </p>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Total RAB Aktif dikurangi item pengurangan
        </p>
      </div>
    </div>
  );
}
