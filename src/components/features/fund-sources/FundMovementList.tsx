"use client";

import { useEffect, useState } from "react";
import { FundMovement, fundMovementService } from "@/lib/services/fundMovementService";
import { formatCurrency } from "@/utils/formatters";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { ReverseMovementModal } from "./ReverseMovementModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface FundMovementListProps {
  initialFundSourceId?: number;
  initialProjectId?: number;
}

export function FundMovementList({ initialFundSourceId, initialProjectId }: FundMovementListProps) {
  const [movements, setMovements] = useState<FundMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundSourceId, setFundSourceId] = useState(initialFundSourceId?.toString() ?? "");
  const [projectId, setProjectId] = useState(initialProjectId?.toString() ?? "");
  const [reversingMovement, setReversingMovement] = useState<FundMovement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fundMovementService.getFundMovements({
        fund_source_id: fundSourceId ? Number(fundSourceId) : undefined,
        project_id: projectId ? Number(projectId) : undefined,
      });
      setMovements(data);
    } catch (e) {
      console.error("Failed to fetch fund movements", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
            Histori Mutasi Modal
          </h1>
          <p className="text-muted-foreground mt-1">
            Semua pergerakan dana modal antar project.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Filter Fund Source ID</label>
          <input
            type="number"
            placeholder="Semua"
            value={fundSourceId}
            onChange={(e) => setFundSourceId(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Filter Project ID</label>
          <input
            type="number"
            placeholder="Semua"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          Terapkan Filter
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                <th className="px-6 py-4 whitespace-nowrap">Tipe</th>
                <th className="px-6 py-4 whitespace-nowrap">Sumber Modal</th>
                <th className="px-6 py-4 whitespace-nowrap">Asal → Tujuan</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Jumlah</th>
                <th className="px-6 py-4 whitespace-nowrap">Referensi</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Memuat histori mutasi...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Belum ada mutasi modal yang tercatat.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(m.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {m.type === "InitialAllocation" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Alokasi Awal
                        </span>
                      ) : m.type === "Withdrawal" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                          Tarik Modal
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          Realokasi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {m.fund_source?.name ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span>{m.source_project?.name ?? <span className="text-xs italic">Sumber Baru</span>}</span>
                        <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium text-foreground">{m.destination_project?.name ?? "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground">
                      {formatCurrency(m.amount)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground flex flex-col gap-1">
                      <span>{m.reference_number}</span>
                      {m.reversal_of_id && (
                        <span className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 px-1.5 py-0.5 rounded w-fit">
                          Reversal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {m.reversal_of_id ? (
                        <span className="text-[10px] text-muted-foreground/60 italic">Sudah Dibatalkan / Reversal</span>
                      ) : (
                        <button
                          onClick={() => setReversingMovement(m)}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                          title="Batalkan Mutasi"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reversingMovement && (
        <ReverseMovementModal
          movement={reversingMovement}
          onClose={() => setReversingMovement(null)}
          onSuccess={() => {
            setReversingMovement(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
