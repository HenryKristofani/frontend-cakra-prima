'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { RabSummary } from '@/types/rab';
import { formatCurrency } from '@/utils/formatters';
import { RabSummaryCards } from './RabSummaryCards';
import { RabCategorySection } from './RabCategorySection';
import { RabPenguranganSection } from './RabPenguranganSection';
import { AddCategoryForm } from './AddCategoryForm';
import { rabService } from '@/lib/services/rabService';
import { Loader2 } from 'lucide-react';

interface RabContainerProps {
  initialData: RabSummary;
  projectId: number | string;
}

export function RabContainer({ initialData, projectId }: RabContainerProps) {
  const [data, setData] = useState<RabSummary>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { categories, deductions, rounded_total, final_total, total_rab_aktif, total_deduction } = data;

  const [penguranganExpanded, setPenguranganExpanded] = useState(true);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const freshData = await rabService.getRabSummary(projectId);
      setData(freshData);
    } catch (e) {
      console.error('Failed to refresh RAB summary', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [projectId]);

  // ─── beforeunload guard ─────────────────────────────────────────────────────
  // Track which categories have unsaved changes
  const dirtyCategories = useRef<Set<number>>(new Set());

  const handleDirtyChange = useCallback((categoryId: number, hasDirty: boolean) => {
    if (hasDirty) {
      dirtyCategories.current.add(categoryId);
    } else {
      dirtyCategories.current.delete(categoryId);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyCategories.current.size > 0) {
        e.preventDefault();
        e.returnValue = 'Ada perubahan RAB yang belum disimpan. Yakin ingin keluar?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const hasNoData = categories.length === 0 && deductions.length === 0;

  return (
    <div className={`space-y-6 transition-opacity relative ${isRefreshing ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Loading overlay for entire container */}
      {isRefreshing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Summary Cards */}
      <RabSummaryCards summary={data} />

      {hasNoData ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-blue-600 text-white">
            <h2 className="font-bold text-sm tracking-wide uppercase">Rencana Anggaran Biaya</h2>
          </div>
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Belum ada data RAB</p>
            <p className="text-sm mt-1 mb-6">Mulai dengan menambahkan kategori RAB pertama.</p>
            <table className="w-full max-w-2xl mx-auto">
              <tbody>
                 <AddCategoryForm projectId={projectId} onRefresh={refreshData} level={0} />
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Main RAB Flat Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
            <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm tracking-wide uppercase">Rencana Anggaran Biaya (R.A.B)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/70 text-muted-foreground text-xs uppercase tracking-wider divide-x divide-border/50">
                    <th className="px-3 py-3 font-semibold text-center w-10">No</th>
                    <th className="px-3 py-3 font-semibold text-center">Uraian Pekerjaan</th>
                    <th className="px-3 py-3 font-semibold text-center w-20">Volume</th>
                    <th className="px-3 py-3 font-semibold text-center w-16">Sat</th>
                    <th className="px-3 py-3 font-semibold text-center w-28">Harga Satuan<br/>Rp</th>
                    <th className="px-3 py-3 font-semibold text-center w-28">Jumlah Harga<br/>Rp</th>
                    <th className="px-3 py-3 font-semibold text-center w-32 bg-yellow-50/50">Rekapitulasi<br/>Rp</th>
                    <th className="px-3 py-3 font-semibold text-center w-16">Bobot<br/>%</th>
                    <th className="px-3 py-3 font-semibold text-center w-16">Prog</th>
                    <th className="px-3 py-3 font-semibold text-center w-24">Total<br/>%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {categories.map((category) => (
                    <RabCategorySection
                      key={category.id}
                      category={category}
                      onRefresh={refreshData}
                      projectId={projectId}
                      depth={0}
                      onDirtyChange={handleDirtyChange}
                    />
                  ))}
                  
                  {/* Add Root Category Form (Outside of mapping, to add new Root Category) */}
                  <AddCategoryForm projectId={projectId} onRefresh={refreshData} level={0} />
                </tbody>
                <tfoot>
                  <tr className="bg-blue-600 text-white font-bold text-sm">
                    <td colSpan={6} className="px-4 py-3 text-right">
                      TOTAL RAB AKTIF
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums bg-blue-700">
                      {formatCurrency(total_rab_aktif)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      100.00%
                    </td>
                    <td className="px-3 py-3 text-center bg-blue-700">
                      {data.overall_progress_percentage.toFixed(2)}%
                    </td>
                    <td className="px-3 py-3 text-center">
                      {data.overall_progress_percentage.toFixed(2)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pengurangan Section */}
          {deductions.length > 0 && (
            <RabPenguranganSection
              deductions={deductions}
              totalDeduction={total_deduction}
              isExpanded={penguranganExpanded}
              onToggle={() => setPenguranganExpanded((v) => !v)}
            />
          )}

          {/* Final Summary */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-5 shadow-sm">
            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="flex justify-between w-full max-w-sm text-muted-foreground">
                <span>Total RAB Aktif</span>
                <span className="tabular-nums font-medium text-foreground">
                  {formatCurrency(total_rab_aktif)}
                </span>
              </div>
              {total_deduction > 0 && (
                <div className="flex justify-between w-full max-w-sm text-muted-foreground">
                  <span>Dikurangi Pengurangan</span>
                  <span className="tabular-nums font-medium text-rose-600 dark:text-rose-400">
                    − {formatCurrency(total_deduction)}
                  </span>
                </div>
              )}
              <div className="w-full max-w-sm border-t border-emerald-300 dark:border-emerald-700 pt-2 mt-1 flex justify-between">
                <span className="font-bold text-base text-emerald-800 dark:text-emerald-300">
                  JUMLAH AKHIR
                </span>
                <span className="tabular-nums font-bold text-xl text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(final_total)}
                </span>
              </div>
              {rounded_total !== final_total && (
                <div className="flex justify-between w-full max-w-sm text-muted-foreground text-xs">
                  <span>Pembulatan</span>
                  <span className="tabular-nums">{formatCurrency(rounded_total)}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
