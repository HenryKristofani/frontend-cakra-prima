"use client";

import { useEffect, useState } from "react";
import { FundSourceBreakdown, fundSourceService } from "@/lib/services/fundSourceService";
import { ArrowLeft, PiggyBank } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp, ArrowLeftRight } from "lucide-react";
import { AllocateFundModal } from "./AllocateFundModal";
import { TransferFundModal } from "./TransferFundModal";
import { WithdrawFundModal } from "./WithdrawFundModal";

export function FundSourceDetail({ id }: { id: string }) {
  const [data, setData] = useState<FundSourceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawProjectId, setWithdrawProjectId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const result = await fundSourceService.getFundSourceBreakdown(id);
      setData(result);
    } catch (e) {
      console.error("Failed to fetch fund source breakdown", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "HutangBank": return "Hutang Bank";
      case "ModalInvestor": return "Modal Investor";
      case "ModalProjectLain": return "Modal Project Lain";
      default: return "Lainnya";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Memuat detail sumber modal...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Data tidak ditemukan.
      </div>
    );
  }

  const { fund_source, breakdown } = data;
  const totalAllocated = breakdown.reduce((sum, b) => sum + b.current_amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/fund-sources"
          className="p-2 hover:bg-muted rounded-full transition-colors"
          title="Kembali ke Daftar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-primary" />
            {fund_source.name}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Tipe: <span className="font-medium">{getTypeLabel(fund_source.type)}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowAllocateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-md transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          Alokasikan Dana
        </button>
        <button
          onClick={() => setShowTransferModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 rounded-md transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Realokasi Dana
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Modal</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(fund_source.initial_amount)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tersalurkan ke Project</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(totalAllocated)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Belum Dialokasikan</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{formatCurrency(fund_source.remaining_unallocated ?? (fund_source.initial_amount - totalAllocated))}</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Distribusi Dana per Project</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Jumlah neto dana yang saat ini dipegang masing-masing project.</p>
        </div>
        {breakdown.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground text-sm">
            Belum ada dana yang dialokasikan ke project manapun.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {breakdown.map((item) => (
              <div key={item.project_id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/projects/${item.project_id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {item.project_name}
                  </Link>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{item.percentage}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(item.current_amount)}</p>
                    <p className="text-xs text-muted-foreground">dari total modal</p>
                  </div>
                  <button
                    onClick={() => {
                      setWithdrawProjectId(item.project_id);
                      setShowWithdrawModal(true);
                    }}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 px-2.5 py-1.5 rounded transition-colors"
                  >
                    Tarik Modal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAllocateModal && (
        <AllocateFundModal
          fundSourceId={fund_source.id}
          fundSourceName={fund_source.name}
          onClose={() => setShowAllocateModal(false)}
          onSuccess={() => { setShowAllocateModal(false); loadData(); }}
        />
      )}
      
      {showTransferModal && (
        <TransferFundModal
          fundSourceId={fund_source.id}
          fundSourceName={fund_source.name}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => { setShowTransferModal(false); loadData(); }}
        />
      )}
      
      {showWithdrawModal && (
        <WithdrawFundModal
          fundSourceId={fund_source.id}
          fundSourceName={fund_source.name}
          sourceProjectId={withdrawProjectId!}
          onClose={() => { setShowWithdrawModal(false); setWithdrawProjectId(null); }}
          onSuccess={() => { setShowWithdrawModal(false); setWithdrawProjectId(null); loadData(); }}
        />
      )}
    </div>
  );
}
