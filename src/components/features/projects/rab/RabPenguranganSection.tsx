import { RabDeduction } from '@/types/rab';
import { formatCurrency } from '@/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RabPenguranganSectionProps {
  deductions: RabDeduction[];
  totalDeduction: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function RabPenguranganSection({
  deductions,
  totalDeduction,
  isExpanded,
  onToggle,
}: RabPenguranganSectionProps) {
  if (deductions.length === 0) return null;

  return (
    <div className="rounded-xl border border-rose-200 dark:border-rose-800 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 dark:bg-rose-950/30 text-left transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/50"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 shrink-0 text-rose-500" />
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0 text-rose-500" />
          )}
          <span className="font-semibold text-sm text-rose-700 dark:text-rose-400">PENGURANGAN</span>
          <span className="text-xs text-rose-500 dark:text-rose-500">
            ({deductions.length} item)
          </span>
        </div>
        <span className="font-semibold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
          {formatCurrency(totalDeduction)}
        </span>
      </button>

      {/* Table */}
      {isExpanded && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-800 text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium w-8">No</th>
                  <th className="px-4 py-2 text-left font-medium min-w-[200px]">Item Tidak Jadi Dikerjakan</th>
                  <th className="px-4 py-2 text-right font-medium w-20">Volume</th>
                  <th className="px-4 py-2 text-center font-medium w-16">Satuan</th>
                  <th className="px-4 py-2 text-right font-medium w-32">Harga Satuan</th>
                  <th className="px-4 py-2 text-right font-medium w-36">Jumlah Harga</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-rose-100 dark:border-rose-900/50 ${
                      idx % 2 === 0 ? 'bg-background' : 'bg-rose-50/30 dark:bg-rose-950/10'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{item.description}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{item.volume}</td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground">{item.unit}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-end gap-4 px-4 py-2 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-200 dark:border-rose-800 text-sm font-semibold">
            <span className="text-rose-700 dark:text-rose-400">Total Pengurangan:</span>
            <span className="text-rose-600 dark:text-rose-400 tabular-nums">
              {formatCurrency(totalDeduction)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
