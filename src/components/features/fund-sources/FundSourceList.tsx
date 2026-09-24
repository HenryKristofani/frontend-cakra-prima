"use client";

import { useEffect, useState } from "react";
import { FundSource, fundSourceService } from "@/lib/services/fundSourceService";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatters";
import { PiggyBank, Plus, TrendingUp } from "lucide-react";
import { AddFundSourceModal } from "./AddFundSourceModal";
import { AllocateFundModal } from "./AllocateFundModal";
import { EditFundSourceModal } from "./EditFundSourceModal";
import { Pencil } from "lucide-react";

export function FundSourceList() {
  const [sources, setSources] = useState<FundSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allocatingSource, setAllocatingSource] = useState<FundSource | null>(null);
  const [editingSource, setEditingSource] = useState<FundSource | null>(null);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await fundSourceService.getFundSources();
      setSources(data);
    } catch (error) {
      console.error("Failed to fetch fund sources", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "HutangBank": return "Hutang Bank";
      case "ModalInvestor": return "Modal Investor";
      case "ModalProjectLain": return "Modal Project Lain";
      default: return type;
    }
  };

  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-primary" />
            Sumber Modal
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola master sumber permodalan dan lihat alokasinya.
          </p>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          Tambah Sumber
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Nama Sumber</th>
                <th className="px-6 py-4 whitespace-nowrap">Tipe</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Total Modal</th>
                <th className="px-6 py-4 whitespace-nowrap">Status Alokasi</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Belum Dialokasikan</th>
                <th className="px-6 py-4 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Memuat data sumber modal...
                  </td>
                </tr>
              ) : sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Belum ada sumber modal yang tercatat.
                  </td>
                </tr>
              ) : (
                sources.map((source) => {
                  const percentage = source.initial_amount > 0 
                    ? Math.round((source.total_allocated / source.initial_amount) * 100) 
                    : 0;

                  return (
                    <tr key={source.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/fund-sources/${source.id}`} className="block font-medium text-foreground group-hover:text-primary transition-colors">
                          {source.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {getTypeLabel(source.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        {formatCurrency(source.initial_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 w-48">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{percentage}% teralokasi</span>
                            <span className="font-medium">{formatCurrency(source.total_allocated)}</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${source.remaining_unallocated > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                          {formatCurrency(source.remaining_unallocated)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setAllocatingSource(source); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-md transition-colors"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Alokasikan
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingSource(source); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-md transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {showAddModal && (
      <AddFundSourceModal
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); loadSources(); }}
      />
    )}
    {allocatingSource && (
      <AllocateFundModal
        fundSourceId={allocatingSource.id}
        fundSourceName={allocatingSource.name}
        onClose={() => setAllocatingSource(null)}
        onSuccess={() => { setAllocatingSource(null); loadSources(); }}
      />
    )}
    {editingSource && (
      <EditFundSourceModal
        fundSource={editingSource}
        onClose={() => setEditingSource(null)}
        onSuccess={(updated) => {
          setSources((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
          setEditingSource(null);
        }}
      />
    )}
    </>
  );
}
