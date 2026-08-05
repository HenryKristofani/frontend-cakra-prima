'use client';

import { useEffect, useState } from 'react';
import { LabaRugiResponse } from '@/types/rap';
import { rapService } from '@/lib/services/rapService';
import { formatCurrency } from '@/utils/formatters';
import { Loader2, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LabaRugiContainerProps {
  projectId: number | string;
}

export function LabaRugiContainer({ projectId }: LabaRugiContainerProps) {
  const [data, setData] = useState<LabaRugiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await rapService.getLabaRugi(projectId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data Laba/Rugi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-card border border-border rounded-xl">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { items, summary } = data;

  const getStatusColor = (status: 'untung' | 'rugi' | 'impas') => {
    switch (status) {
      case 'untung':
        return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50';
      case 'rugi':
        return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30 border-red-200 dark:border-red-800/50';
      case 'impas':
        return 'text-slate-700 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50';
    }
  };

  const getStatusIcon = (status: 'untung' | 'rugi' | 'impas') => {
    switch (status) {
      case 'untung': return <TrendingUp className="w-5 h-5" />;
      case 'rugi': return <TrendingDown className="w-5 h-5" />;
      case 'impas': return <Minus className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Rencana Biaya (RAP)</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total_rencana)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Setelah potongan {summary.potongan_percentage}%
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Realisasi Kas</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.total_realisasi)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Total transaksi kas yang di-tag ke RAP
          </p>
        </div>

        <div className={`border rounded-xl p-5 shadow-sm ${getStatusColor(summary.status_label)}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium mb-1 opacity-80">
                Status Proyek
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {summary.status_label === 'untung' ? 'Untung' : summary.status_label === 'rugi' ? 'Rugi' : 'Impas'}
                  {' '}{formatCurrency(Math.abs(summary.total_selisih))}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm">
              {getStatusIcon(summary.status_label)}
            </div>
          </div>
          <p className="text-xs mt-2 opacity-80">
            Selisih = Rencana - Realisasi
          </p>
        </div>
      </div>

      {/* Detailed Items Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-lg">Rincian Laba / Rugi per Item Pekerjaan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/80">
                <th className="px-4 py-3 text-center text-xs font-semibold w-12 border-x border-border/50">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold border-r border-border/50">Uraian Pekerjaan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold w-36 border-r border-border/50">Rencana (RAP)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold w-36 border-r border-border/50">Realisasi (KAS)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold w-36 border-r border-border/50">Selisih</th>
                <th className="px-4 py-3 text-center text-xs font-semibold w-28 border-r border-border/50">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground border-x border-border/50">
                    <p>Belum ada data RAP untuk project ini.</p>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-center text-sm border-x border-border/50 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3 text-sm border-r border-border/50 font-medium">{item.description}</td>
                    <td className="px-4 py-3 text-right text-sm border-r border-border/50 tabular-nums">{formatCurrency(item.total_price)}</td>
                    <td className="px-4 py-3 text-right text-sm border-r border-border/50 tabular-nums">{formatCurrency(item.total_realisasi)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-medium border-r border-border/50 tabular-nums ${
                      item.status_label === 'untung' ? 'text-emerald-600 dark:text-emerald-400' :
                      item.status_label === 'rugi' ? 'text-red-600 dark:text-red-400' :
                      'text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.status_label === 'rugi' ? '-' : item.status_label === 'untung' ? '+' : ''}
                      {formatCurrency(Math.abs(item.selisih_laba_rugi))}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-border/50">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                        item.status_label === 'untung' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                        item.status_label === 'rugi' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {item.status_label}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
