'use client';

import React, { useState } from 'react';
import { RotateCcw, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { RapItem } from '@/types/rap';
import { formatCurrency } from '@/utils/formatters';
import { rapService } from '@/lib/services/rapService';

export interface RapDirtyItemState {
  description: string;
  volume: string;
  unit: string;
  unit_price: string;
  // No status — RAP does not have status
  errors?: Record<string, string>;
}

const SATUANS = ['m', 'm2', 'm3', 'm4', 'Unit', 'Ls', 'Titik', 'bh', 'ls', 'kg', 'ton', 'zak'];

export type RapSyncStatus = {
  status: 'synced' | 'rab_changed' | 'rab_removed';
  latest_rab?: { description: string; volume: number };
  snapshot?: { description: string; volume: number };
};

interface RapExistingItemRowProps {
  item: RapItem;
  dirtyState?: RapDirtyItemState;
  idx: number;
  pajakPct: number;
  syncStatus?: RapSyncStatus;
  onQuickChange: (item: RapItem, field: keyof RapDirtyItemState, value: string) => void;
  onRevert: (itemId: number) => void;
  onSyncSuccess: () => void;
}

/**
 * RapExistingItemRow — baris existing RAP (sudah tersimpan di DB).
 * - 4 kolom selalu langsung editable (quick-edit): description, volume, unit, unit_price
 * - Tidak ada "Full Edit mode" (tidak ada field status)
 * - Tidak ada progress button (RAP tidak punya ProgressReport)
 * - Defined di top-level agar React tidak remount saat parent re-render (anti fokus-hilang)
 */
export const RapExistingItemRow = React.memo(function RapExistingItemRow({
  item,
  dirtyState,
  idx,
  pajakPct,
  syncStatus,
  onQuickChange,
  onRevert,
  onSyncSuccess,
}: RapExistingItemRowProps) {
  const isDirty = !!dirtyState;

  const description = isDirty ? dirtyState.description : item.description;
  const volume = isDirty ? dirtyState.volume : item.volume.toString();
  const unit = isDirty ? dirtyState.unit : item.unit;
  const unitPrice = isDirty ? dirtyState.unit_price : item.unit_price.toString();
  const errors = isDirty ? dirtyState.errors : undefined;

  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncFromRab = async () => {
    setIsSyncing(true);
    setIsSyncConfirmOpen(false);
    try {
      await rapService.syncFromRab(item.id);
      onSyncSuccess();
    } catch (e: any) {
      alert(e?.message || 'Gagal sync dari RAB');
    } finally {
      setIsSyncing(false);
    }
  };

  const uniqueUnits = SATUANS.includes(item.unit) ? SATUANS : [...SATUANS, item.unit];

  // Live preview — use dirty values if editing, otherwise use server-computed values
  const parsedVolume = parseFloat(volume) || 0;
  const parsedUnitPrice = parseFloat(unitPrice) || 0;
  const effectiveUnitPriceLive = parsedUnitPrice * (1 - pajakPct / 100);
  const totalLive = parsedVolume * effectiveUnitPriceLive;

  const rowClass = isDirty
    ? 'bg-amber-50/70 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-foreground group'
    : syncStatus?.status === 'rab_changed'
    ? 'bg-orange-50/40 dark:bg-orange-950/10 border-b border-border/30 text-foreground group'
    : syncStatus?.status === 'rab_removed'
    ? 'bg-rose-50/40 dark:bg-rose-950/10 border-b border-border/30 text-foreground group'
    : 'border-b border-border/30 hover:bg-muted/10 group';

  const inputBase =
    'w-full rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors';
  const inputClass = (hasError?: string) =>
    `${inputBase} ${
      isDirty
        ? hasError
          ? 'bg-white dark:bg-background border border-red-400'
          : 'bg-white dark:bg-background border border-amber-200 dark:border-amber-700'
        : hasError
          ? 'bg-white dark:bg-background border border-red-400'
          : 'bg-transparent border border-transparent hover:border-border hover:bg-background'
    }`;

  const inputRightClass = (hasError?: string) =>
    `${inputBase} text-right tabular-nums ${
      isDirty
        ? hasError
          ? 'bg-white dark:bg-background border border-red-400'
          : 'bg-white dark:bg-background border border-amber-200 dark:border-amber-700'
        : hasError
          ? 'bg-white dark:bg-background border border-red-400'
          : 'bg-transparent border border-transparent hover:border-border hover:bg-background'
    }`;

  return (
    <tr className={rowClass}>
      {/* No */}
      <td className={`px-3 py-1.5 border-x border-border/50 text-center text-xs align-top pt-2.5 ${isDirty ? 'text-amber-700 dark:text-amber-400 font-bold text-[10px]' : ''}`}>
        {isDirty ? 'EDIT' : (idx + 1)}
      </td>

      {/* Uraian */}
      <td className="px-3 py-1.5 border-r border-border/50 text-xs align-top">
        {/* Sync status badges */}
        {syncStatus?.status === 'rab_changed' && (
          <div className="flex items-center gap-1 mb-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="w-2.5 h-2.5" />
              RAB Berubah
            </span>
            <button
              onClick={() => setIsSyncConfirmOpen(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
              Update dari RAB
            </button>
          </div>
        )}
        {syncStatus?.status === 'rab_removed' && (
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-2.5 h-2.5" />
              Item RAB Dihapus
            </span>
          </div>
        )}
        {/* Confirm dialog */}
        {isSyncConfirmOpen && syncStatus?.status === 'rab_changed' && (
          <div className="mb-2 p-2 border border-orange-300 dark:border-orange-700 rounded-md bg-orange-50 dark:bg-orange-950/30 text-xs">
            <p className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Konfirmasi Update dari RAB</p>
            <table className="w-full text-[10px] mb-2">
              <thead><tr className="text-muted-foreground"><th className="text-left pr-2">Field</th><th className="text-left pr-2">Lama (RAP)</th><th className="text-left">Baru (RAB)</th></tr></thead>
              <tbody>
                <tr>
                  <td className="pr-2 text-muted-foreground">Deskripsi</td>
                  <td className="pr-2">{syncStatus.snapshot?.description}</td>
                  <td className="font-medium text-orange-700 dark:text-orange-400">{syncStatus.latest_rab?.description}</td>
                </tr>
                <tr>
                  <td className="pr-2 text-muted-foreground">Volume</td>
                  <td className="pr-2">{syncStatus.snapshot?.volume}</td>
                  <td className="font-medium text-orange-700 dark:text-orange-400">{syncStatus.latest_rab?.volume}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-muted-foreground mb-2">Harga RAP tidak akan berubah.</p>
            <div className="flex gap-1">
              <button onClick={handleSyncFromRab} className="px-2 py-0.5 bg-orange-600 text-white rounded text-[10px] font-semibold hover:bg-orange-700 transition-colors">
                Ya, Update
              </button>
              <button onClick={() => setIsSyncConfirmOpen(false)} className="px-2 py-0.5 bg-muted text-foreground rounded text-[10px] hover:bg-muted/80 transition-colors">
                Batal
              </button>
            </div>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <input
              type="text"
              value={description}
              onChange={(e) => onQuickChange(item, 'description', e.target.value)}
              className={inputClass(errors?.description)}
              placeholder="Uraian pekerjaan..."
            />
            {errors?.description && (
              <p className="text-[10px] text-red-500 mt-0.5 ml-2">{errors.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-1">
            {isDirty ? (
              <button
                onClick={() => onRevert(item.id)}
                title="Batalkan perubahan"
                className="p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </td>

      {/* Volume */}
      <td className="px-3 py-1.5 border-r border-border/50 align-top w-20">
        <input
          type="number"
          step="0.01"
          value={volume}
          onChange={(e) => onQuickChange(item, 'volume', e.target.value)}
          className={inputRightClass(errors?.volume)}
        />
        {errors?.volume && <p className="text-[10px] text-red-500 mt-0.5">{errors.volume}</p>}
      </td>

      {/* Satuan */}
      <td className="px-3 py-1.5 border-r border-border/50 align-top w-20">
        <select
          value={unit}
          onChange={(e) => onQuickChange(item, 'unit', e.target.value)}
          className={inputClass(errors?.unit) + ' text-center'}
        >
          {uniqueUnits.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>

      {/* Harga RAB (View only) */}
      <td className="px-3 py-1.5 border-r border-border/50 text-right text-xs text-muted-foreground align-top pt-2.5 tabular-nums bg-muted/5 w-28">
        {item.source_rab_item ? formatCurrency(item.source_rab_item.unit_price).replace('Rp', '').trim() : '-'}
      </td>

      {/* Harga Satuan (nominal RAP) */}
      <td className="px-3 py-1.5 border-r border-border/50 align-top w-28">
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => onQuickChange(item, 'unit_price', e.target.value)}
          className={inputRightClass(errors?.unit_price)}
        />
        {errors?.unit_price && <p className="text-[10px] text-red-500 mt-0.5">{errors.unit_price}</p>}
      </td>

      {/* Harga Efektif (preview setelah pajak) */}
      <td className={`px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 tabular-nums ${pajakPct > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
        {pajakPct > 0
          ? formatCurrency(effectiveUnitPriceLive).replace('Rp', '').trim()
          : '-'}
      </td>

      {/* Jumlah RAB (View only) */}
      <td className="px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 tabular-nums text-muted-foreground bg-muted/5 w-32">
        {item.source_rab_item ? formatCurrency(parsedVolume * item.source_rab_item.unit_price).replace('Rp', '').trim() : '-'}
      </td>

      {/* Total Harga Efektif (Jumlah RAP) */}
      <td className={`px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 tabular-nums font-medium ${isDirty ? 'text-amber-700 dark:text-amber-400' : ''}`}>
        {totalLive > 0 ? formatCurrency(totalLive).replace('Rp', '').trim() : '-'}
      </td>
    </tr>
  );
});
