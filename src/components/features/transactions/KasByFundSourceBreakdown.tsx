"use client";

import { useState, useCallback } from "react";
import { fundSourceService, FundSourceSummary } from "@/lib/services/fundSourceService";
import { formatCurrency } from "@/utils/formatters";
import { ChevronDown, ChevronUp, Landmark, Loader2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  HutangBank: "Hutang Bank",
  ModalInvestor: "Modal Investor",
  ModalProjectLain: "Modal Project Lain",
  Lainnya: "Lainnya",
};

interface KasByFundSourceBreakdownProps {
  /**
   * When provided, calls the per-project endpoint
   * (GET /projects/{projectId}/kas-breakdown-by-fund-source).
   * When omitted, calls the global endpoint
   * (GET /transactions-summary/by-fund-source).
   */
  projectId?: number | string;
  /**
   * Optionally pass the already-known total_saldo_kas so the backend can
   * compute percentage_of_kas without a second query.
   */
  totalSaldoKas?: number;
}

export function KasByFundSourceBreakdown({ projectId, totalSaldoKas }: KasByFundSourceBreakdownProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<FundSourceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (data) return; // already loaded — don't refetch
    setLoading(true);
    setError(null);
    try {
      const result = projectId
        ? await fundSourceService.getProjectKasBreakdownByFundSource(projectId, totalSaldoKas)
        : await fundSourceService.getSummaryByFundSource();
      setData(result);
    } catch {
      setError("Gagal memuat breakdown sumber modal.");
    } finally {
      setLoading(false);
    }
  }, [data, projectId, totalSaldoKas]);

  const toggle = () => {
    if (!open) load();
    setOpen((v) => !v);
  };

  return (
    <div className="mt-2">
      <button
        onClick={toggle}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand/80 hover:text-brand transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {open ? "Sembunyikan sumber" : "Lihat sumber modal"}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Memuat breakdown...
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-500">{error}</p>
          )}

          {data && (
            <>
              {/* Progress bar: tracked vs untracked */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{data.percentage_tracked}% dari total kas punya sumber tercatat</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${Math.min(data.percentage_tracked, 100)}%` }}
                  />
                </div>
              </div>

              {/* Breakdown per fund source */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {data.breakdown.length === 0 && (
                  <p className="text-xs text-muted-foreground">Belum ada alokasi modal tercatat.</p>
                )}
                {data.breakdown.map((item) => (
                  <div key={item.fund_source_id} className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-foreground truncate">{item.fund_source_name}</span>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {item.percentage_of_kas}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                        <span>{TYPE_LABELS[item.fund_source_type] ?? item.fund_source_type}</span>
                        <span className="font-medium text-foreground">{formatCurrency(item.total_allocated)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Untracked manual transactions */}
              {data.untracked_amount !== 0 && (
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <div className="w-3.5 h-3.5 flex-shrink-0" />
                  <div className="flex-1 flex justify-between text-xs text-muted-foreground">
                    <span>Transaksi manual (tanpa sumber modal)</span>
                    <span className="font-medium">{formatCurrency(data.untracked_amount)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
