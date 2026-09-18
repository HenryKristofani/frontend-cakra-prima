"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, HardHat, FileText, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { StockUsage } from "@/types/inventory";
import { PostToKasModal } from "./PostToKasModal";

export function UsagePendingList() {
  const [usages, setUsages] = useState<StockUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeUsage, setActiveUsage] = useState<{ id: number; total: number; isIsolated: boolean } | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getPendingUsages();
      setUsages(data);
    } catch (e: any) {
      setError("Gagal memuat daftar pemakaian tertunda");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleKasSuccess = () => {
    setActiveUsage(null);
    setSuccessMsg("Berhasil memposting ke Kas!");
    setTimeout(() => setSuccessMsg(null), 3000);
    fetchPending();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        Memuat daftar pemakaian pending...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Menunggu Diposting ke Kas</h3>
          <p className="text-sm text-muted-foreground">Daftar pemakaian material yang belum dibukukan sebagai pengeluaran kas.</p>
        </div>
        <div className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider">
          {usages.length} Pending
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {usages.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
          <h4 className="text-lg font-medium">Semua Pemakaian Telah Diposting</h4>
          <p className="text-muted-foreground text-sm mt-1">Tidak ada data usage yang mengantri untuk dijadikan kas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Referensi / Tanggal</th>
                <th className="px-4 py-3">Lokasi Project</th>
                <th className="px-4 py-3 text-right">Total Beban</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usages.map((usage) => (
                <tr key={usage.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          {usage.stock_transfer_line?.stock_transfer?.reference_number || `USAGE-${usage.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(usage.used_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">{usage.warehouse?.name || 'Project Tidak Diketahui'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-amber-600 dark:text-amber-500">
                      Rp {Number(usage.stock_transfer_line?.total_price || 0).toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => setActiveUsage({
                        id: usage.id,
                        total: Number(usage.stock_transfer_line?.total_price || 0),
                        isIsolated: usage.warehouse?.project?.is_isolated_cash ?? false
                      })}
                      className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:border-amber-800 dark:hover:text-amber-400 rounded-md text-xs font-medium transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Jadikan Kas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeUsage && (
        <PostToKasModal 
          usageId={activeUsage.id} 
          totalValue={activeUsage.total}
          isIsolated={activeUsage.isIsolated}
          onClose={() => setActiveUsage(null)} 
          onSuccess={handleKasSuccess}
        />
      )}
    </div>
  );
}
