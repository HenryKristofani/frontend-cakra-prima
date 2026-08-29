'use client';

import { useState, useCallback, useEffect } from 'react';
import { RapCategory, RapSettingResponse } from '@/types/rap';
import { AddRapCategoryForm } from './AddRapCategoryForm';
import { RapCategorySection } from './RapCategorySection';
import { formatCurrency } from '@/utils/formatters';
import { Settings2, Loader2, Save, FileText, RefreshCw } from 'lucide-react';
import { rapService } from '@/lib/services/rapService';
import Decimal from 'decimal.js';
import type { RapSyncStatus } from './RapExistingItemRow';

interface RapContainerProps {
  projectId: string | number;
}

export function RapContainer({ projectId }: RapContainerProps) {
  const [categories, setCategories] = useState<RapCategory[]>([]);
  const [setting, setSetting] = useState<RapSettingResponse | null>(null);
  const [syncStatuses, setSyncStatuses] = useState<Record<string, RapSyncStatus>>({});
  const [unsyncedNewCount, setUnsyncedNewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dirty state tracking (categoryId → has unsaved changes)
  const [dirtyCategories, setDirtyCategories] = useState<Set<number>>(new Set());

  // Settings form state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pajakValue, setPajakValue] = useState('');
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncingNew, setIsSyncingNew] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cats, set, syncStats, unsyncedRes] = await Promise.all([
        rapService.getCategories(projectId),
        rapService.getSetting(projectId),
        rapService.getSyncStatus(projectId).catch(() => ({})), // Fallback to empty if error
        rapService.getUnsyncedNewItemsCount(projectId).catch(() => ({ count: 0 })),
      ]);
      setCategories(cats);
      setSetting(set);
      setSyncStatuses(syncStats);
      setUnsyncedNewCount(unsyncedRes.count);
      setPajakValue(
        set.project_setting 
          ? set.project_setting.pajak_percentage.toString() 
          : set.effective_pajak_percentage.toString()
      );
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data RAP');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Beforeunload guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyCategories.size > 0) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirtyCategories]);

  const handleDirtyChange = useCallback((categoryId: number, hasDirty: boolean) => {
    setDirtyCategories((prev) => {
      const next = new Set(prev);
      if (hasDirty) next.add(categoryId);
      else next.delete(categoryId);
      return next;
    });
  }, []);

  const handleSavePajak = async () => {
    setIsSavingSetting(true);
    try {
      const val = parseFloat(pajakValue);
      if (isNaN(val) || val < 0 || val > 100) {
        throw new Error('Nilai pajak harus antara 0 dan 100');
      }
      await rapService.updateProjectSetting(projectId, val);
      await fetchData(); // refresh everything so all items recalculate
      setIsSettingsOpen(false);
    } catch (e: any) {
      alert(e?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleGenerateFromRab = async () => {
    if (!window.confirm('Yakin ingin generate RAP dari RAB? Proses ini akan menyalin seluruh struktur RAB.')) return;
    setIsGenerating(true);
    try {
      await rapService.generateFromRab(projectId);
      await fetchData();
    } catch (e: any) {
      alert(e?.message || 'Gagal generate RAP');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncNewItems = async () => {
    if (!window.confirm('Yakin ingin sinkronkan item baru dari RAB? Item dan kategori baru yang belum ada di RAP akan ditambahkan.')) return;
    setIsSyncingNew(true);
    try {
      const res = await rapService.syncNewItems(projectId);
      alert(res.message);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Gagal sinkronisasi item baru');
    } finally {
      setIsSyncingNew(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await rapService.exportExcel(projectId);
    } catch (err: any) {
      alert(err?.message || 'Gagal export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await rapService.exportPdf(projectId);
    } catch (err: any) {
      alert(err?.message || 'Gagal export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const calculateTotals = () => {
    let totalRap = new Decimal(0);
    let totalRab = new Decimal(0);
    const calcCat = (cat: RapCategory) => {
      cat.items.forEach(item => {
        totalRap = totalRap.plus(new Decimal(item.total_price || 0));
        if (item.source_rab_item) {
          totalRab = totalRab.plus(new Decimal(item.volume || 0).times(new Decimal(item.source_rab_item.unit_price || 0)));
        }
      });
      cat.children.forEach(calcCat);
    };
    categories.forEach(calcCat);
    return { totalRap: totalRap.toNumber(), totalRab: totalRab.toNumber() };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  const effectivePajak = setting?.effective_pajak_percentage ?? 0;
  const isCustomSetting = !!setting?.project_setting;
  const { totalRap, totalRab } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Overview & Settings Header */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Rencana Biaya</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRap)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-md text-sm font-medium transition-colors disabled:opacity-50 border border-green-200 dark:border-green-800"
            >
              {isExportingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 rounded-md text-sm font-medium transition-colors disabled:opacity-50 border border-rose-200 dark:border-rose-800"
            >
              {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {categories.length > 0 && (
              <button
                onClick={handleSyncNewItems}
                disabled={isSyncingNew}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-md text-sm font-medium transition-colors disabled:opacity-50 border border-blue-200 dark:border-blue-800 relative"
              >
                {isSyncingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="hidden sm:inline">Sinkronkan Item Baru</span>
                {unsyncedNewCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unsyncedNewCount}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Pajak & Biaya Admin</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {effectivePajak.toFixed(2)}%
                  </span>
                  {isCustomSetting ? (
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Khusus</span>
                  ) : (
                    <span className="text-[9px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Global</span>
                  )}
                </div>
              </div>
              <div className="w-px h-8 bg-border mx-1" />
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 hover:bg-background rounded-md text-muted-foreground hover:text-foreground transition-colors"
                title="Atur Pajak"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel Expansion */}
        {isSettingsOpen && (
          <div className="border-t border-border bg-muted/20 p-5">
            <div className="max-w-md">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                Pengaturan Pajak & Biaya Admin
              </h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={pajakValue}
                    onChange={(e) => setPajakValue(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                </div>
                <button
                  onClick={handleSavePajak}
                  disabled={isSavingSetting}
                  className="px-4 py-2 bg-brand text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingSetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Jika diatur, nilai ini akan menimpa pengaturan pajak global untuk project ini.
              </p>
            </div>
          </div>
        )}
      </div>

      {dirtyCategories.size > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 p-3 rounded-lg text-sm flex items-center gap-2 sticky top-4 z-10 shadow-sm backdrop-blur-sm">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <div>
            <span className="font-medium">Ada perubahan yang belum disimpan!</span> 
            <span className="hidden sm:inline"> Klik tombol &quot;Simpan Semua Perubahan&quot; di kategori yang bersangkutan.</span>
          </div>
        </div>
      )}

      {unsyncedNewCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400 p-3 rounded-lg text-sm flex items-center gap-2 sticky top-4 z-10 shadow-sm backdrop-blur-sm">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <div className="flex-1">
            <span className="font-medium">Ada {unsyncedNewCount} item baru di RAB</span> yang belum disinkronkan ke RAP ini.
          </div>
          <button
            onClick={handleSyncNewItems}
            disabled={isSyncingNew}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isSyncingNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sinkronkan Sekarang
          </button>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <FileText className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-xl font-bold mb-2">RAP Belum Dibuat</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Anda belum membuat Rencana Anggaran Pelaksanaan untuk project ini. Generate data dari RAB untuk memulai.
          </p>
          <button
            onClick={handleGenerateFromRab}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-primary-foreground font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Generate RAP dari RAB
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border/80">
                  <th className="px-3 py-2 text-center text-xs font-semibold w-10 border-x border-border/50">No</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-r border-border/50">Uraian Pekerjaan</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold w-20 border-r border-border/50">Volume</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold w-20 border-r border-border/50">Sat</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold w-28 border-r border-border/50">Harga RAB</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold w-28 border-r border-border/50">Harga RAP</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold w-28 border-r border-border/50 text-orange-700 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20">Hrg Efektif ({effectivePajak.toFixed(2)} %)</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold w-32 border-r border-border/50">Jumlah RAB</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold w-32 border-r border-border/50">Jumlah RAP</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <RapCategorySection
                    key={category.id}
                    category={category}
                    pajakPct={effectivePajak}
                    syncStatuses={syncStatuses}
                    onRefresh={fetchData}
                    projectId={projectId}
                    onDirtyChange={handleDirtyChange}
                  />
                ))}

                <AddRapCategoryForm
                  projectId={projectId}
                  onRefresh={fetchData}
                />
              </tbody>
              <tfoot>
                <tr className="bg-orange-600 dark:bg-orange-700 text-white font-bold text-sm">
                  <td colSpan={8} className="px-4 py-3 text-right">
                    TOTAL RAP AKTIF
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums bg-orange-700 dark:bg-orange-800 border-l border-orange-500/30">
                    {formatCurrency(totalRap)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Final Summary */}
        <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-5 shadow-sm">
          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex justify-between w-full max-w-sm text-muted-foreground">
              <span>Total RAB Aktif</span>
              <span className="tabular-nums font-medium text-foreground">
                {formatCurrency(totalRab)}
              </span>
            </div>
            <div className="flex justify-between w-full max-w-sm text-muted-foreground">
              <span>Total RAP Aktif</span>
              <span className="tabular-nums font-medium text-foreground">
                {formatCurrency(totalRap)}
              </span>
            </div>
            <div className="w-full max-w-sm border-t border-orange-300 dark:border-orange-700 pt-2 mt-1 flex justify-between">
              <span className="font-bold text-base text-orange-800 dark:text-orange-300">
                JUMLAH AKHIR RAP
              </span>
              <span className="tabular-nums font-bold text-xl text-orange-700 dark:text-orange-300">
                {formatCurrency(totalRap)}
              </span>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
