'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { RapItem } from '@/types/rap';
import { formatCurrency } from '@/utils/formatters';

export interface RapDirtyItemState {
  description: string;
  volume: string;
  unit: string;
  unit_price: string;
  // No status — RAP does not have status
  errors?: Record<string, string>;
}

const SATUANS = ['m', 'm2', 'm3', 'm4', 'Unit', 'Ls', 'Titik', 'bh', 'ls', 'kg', 'ton', 'zak'];

interface RapExistingItemRowProps {
  item: RapItem;
  dirtyState?: RapDirtyItemState;
  idx: number;
  pajakPct: number;
  onQuickChange: (item: RapItem, field: keyof RapDirtyItemState, value: string) => void;
  onRevert: (itemId: number) => void;
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
  onQuickChange,
  onRevert,
}: RapExistingItemRowProps) {
  const isDirty = !!dirtyState;

  const description = isDirty ? dirtyState.description : item.description;
  const volume = isDirty ? dirtyState.volume : item.volume.toString();
  const unit = isDirty ? dirtyState.unit : item.unit;
  const unitPrice = isDirty ? dirtyState.unit_price : item.unit_price.toString();
  const errors = isDirty ? dirtyState.errors : undefined;

  const uniqueUnits = SATUANS.includes(item.unit) ? SATUANS : [...SATUANS, item.unit];

  // Live preview — use dirty values if editing, otherwise use server-computed values
  const parsedVolume = parseFloat(volume) || 0;
  const parsedUnitPrice = parseFloat(unitPrice) || 0;
  const effectiveUnitPriceLive = parsedUnitPrice * (1 + pajakPct / 100);
  const totalLive = parsedVolume * effectiveUnitPriceLive;

  const rowClass = isDirty
    ? 'bg-amber-50/70 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-foreground group'
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
      <td className={`px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 tabular-nums ${pajakPct > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
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
