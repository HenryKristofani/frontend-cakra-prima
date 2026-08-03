'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { RabItem } from '@/types/rab';
import { formatCurrency } from '@/utils/formatters';

export interface DirtyItemState {
  description: string;
  volume: string;
  unit: string;
  unit_price: string;
  status: 'aktif' | 'dikurangi' | 'dibatalkan';
  errors?: Record<string, string>;
}

const SATUANS = ['m', 'm2', 'm3', 'm4', 'Unit', 'Ls', 'Titik', 'bh', 'ls', 'kg', 'ton', 'zak'];

interface DirtyItemRowProps {
  item: RabItem;
  dirtyState: DirtyItemState;
  idx: number;
  onChange: (itemId: number, field: keyof DirtyItemState, value: string) => void;
  onRevert: (itemId: number) => void;
}

/**
 * DirtyItemRow – baris untuk item EXISTING yang sedang diedit (belum di-save).
 *
 * Komponen ini didefinisikan di TOP-LEVEL FILE terpisah, bukan inline
 * di dalam body function parent. Hal ini krusial untuk mencegah bug
 * hilangnya fokus saat mengetik yang disebabkan React me-unmount/remount
 * komponen pada setiap re-render parent.
 */
export const DirtyItemRow = React.memo(function DirtyItemRow({
  item,
  dirtyState,
  idx,
  onChange,
  onRevert,
}: DirtyItemRowProps) {
  const uniqueUnits = SATUANS.includes(item.unit) ? SATUANS : [...SATUANS, item.unit];
  const calculatedTotal =
    (parseFloat(dirtyState.volume) || 0) * (parseFloat(dirtyState.unit_price) || 0);

  return (
    <tr className="bg-amber-50/70 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-foreground">
      <td className="px-3 py-2 border-x border-amber-200/50 dark:border-amber-800/50 text-center text-[10px] text-amber-700 dark:text-amber-400 font-bold w-10">
        EDIT
      </td>
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50">
        <input
          type="text"
          value={dirtyState.description}
          onChange={(e) => onChange(item.id, 'description', e.target.value)}
          className={`w-full bg-white dark:bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
            dirtyState.errors?.description ? 'border-red-400' : 'border-amber-200 dark:border-amber-700'
          }`}
        />
        {dirtyState.errors?.description && (
          <p className="text-[10px] text-red-500 mt-0.5">{dirtyState.errors.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground">Status:</label>
          <select
            value={dirtyState.status}
            onChange={(e) => onChange(item.id, 'status', e.target.value)}
            className="bg-white dark:bg-background border border-amber-200 dark:border-amber-700 rounded px-1 py-0.5 text-[10px] text-muted-foreground"
          >
            <option value="aktif">Aktif</option>
            <option value="dikurangi">Dikurangi (Tidak Dikerjakan)</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </td>
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 align-top w-20">
        <input
          type="number"
          step="0.01"
          value={dirtyState.volume}
          onChange={(e) => onChange(item.id, 'volume', e.target.value)}
          className={`w-full bg-white dark:bg-background border rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
            dirtyState.errors?.volume ? 'border-red-400' : 'border-amber-200 dark:border-amber-700'
          }`}
        />
        {dirtyState.errors?.volume && (
          <p className="text-[10px] text-red-500 mt-0.5">{dirtyState.errors.volume}</p>
        )}
      </td>
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 align-top w-20">
        <select
          value={dirtyState.unit}
          onChange={(e) => onChange(item.id, 'unit', e.target.value)}
          className="w-full bg-white dark:bg-background border border-amber-200 dark:border-amber-700 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        >
          {uniqueUnits.map((sat) => (
            <option key={sat} value={sat}>
              {sat}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 align-top w-28">
        <input
          type="number"
          value={dirtyState.unit_price}
          onChange={(e) => onChange(item.id, 'unit_price', e.target.value)}
          className={`w-full bg-white dark:bg-background border rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
            dirtyState.errors?.unit_price ? 'border-red-400' : 'border-amber-200 dark:border-amber-700'
          }`}
        />
        {dirtyState.errors?.unit_price && (
          <p className="text-[10px] text-red-500 mt-0.5">{dirtyState.errors.unit_price}</p>
        )}
      </td>
      {/* Jumlah Harga (live preview) */}
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 text-right text-xs font-medium text-amber-700 dark:text-amber-400 align-top w-28 pt-3">
        {calculatedTotal > 0 ? formatCurrency(calculatedTotal) : '-'}
      </td>
      {/* Rekapitulasi */}
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 text-center text-xs text-muted-foreground align-top w-32 pt-3">-</td>
      {/* Bobot % (server akan hitung ulang) */}
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 text-center text-xs text-muted-foreground align-top w-16 pt-3">
        {item.bobot_percentage.toFixed(2)}%
      </td>
      {/* Progress % */}
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 text-center text-xs align-top w-16 pt-3">
        {item.latest_progress_percentage}%
      </td>
      {/* Aksi: Revert */}
      <td className="px-3 py-2 border-r border-amber-200/50 dark:border-amber-800/50 text-center align-top w-24 pt-2">
        <button
          onClick={() => onRevert(item.id)}
          title="Batalkan perubahan baris ini"
          className="p-1.5 text-muted-foreground hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
});
