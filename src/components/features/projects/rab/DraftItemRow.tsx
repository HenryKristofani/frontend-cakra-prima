'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface DraftItem {
  /** Client-only key untuk identifikasi sebelum punya real ID */
  _key: string;
  description: string;
  volume: string;
  unit: string;
  unit_price: string;
  status: 'aktif' | 'dikurangi' | 'dibatalkan';
  /** Error dari 422 backend, key = field name */
  errors?: Record<string, string>;
}

const SATUANS = ['m', 'm2', 'm3', 'm4', 'Unit', 'Ls', 'Titik', 'bh', 'ls', 'kg', 'ton', 'zak'];

interface DraftItemRowProps {
  draft: DraftItem;
  idx: number;
  onChange: (key: string, field: keyof DraftItem, value: string) => void;
  onRemove: (key: string) => void;
}

/**
 * DraftItemRow – baris untuk item BARU yang belum disimpan ke server.
 *
 * Komponen ini didefinisikan di TOP-LEVEL FILE (bukan inline di dalam
 * fungsi parent), sehingga React tidak akan me-unmount/remount elemen
 * ini setiap kali parent re-render, yang menyebabkan bug hilangnya
 * fokus saat mengetik.
 */
export const DraftItemRow = React.memo(function DraftItemRow({
  draft,
  idx,
  onChange,
  onRemove,
}: DraftItemRowProps) {
  const calculatedTotal =
    (parseFloat(draft.volume) || 0) * (parseFloat(draft.unit_price) || 0);

  return (
    <tr className="bg-emerald-50/70 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 text-foreground">
      <td className="px-3 py-2 border-x border-emerald-200/50 dark:border-emerald-800/50 text-center text-[10px] text-emerald-700 dark:text-emerald-400 font-bold w-10">
        BARU
      </td>
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50">
        <input
          type="text"
          value={draft.description}
          onChange={(e) => onChange(draft._key, 'description', e.target.value)}
          placeholder="Uraian pekerjaan..."
          className={`w-full bg-white dark:bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
            draft.errors?.description ? 'border-red-400' : 'border-emerald-200 dark:border-emerald-700'
          }`}
        />
        {draft.errors?.description && (
          <p className="text-[10px] text-red-500 mt-0.5">{draft.errors.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground">Status:</label>
          <select
            value={draft.status}
            onChange={(e) => onChange(draft._key, 'status', e.target.value)}
            className="bg-white dark:bg-background border border-emerald-200 dark:border-emerald-700 rounded px-1 py-0.5 text-[10px] text-muted-foreground"
          >
            <option value="aktif">Aktif</option>
            <option value="dikurangi">Dikurangi (Tidak Dikerjakan)</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </td>
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 align-top w-20">
        <input
          type="number"
          step="0.01"
          value={draft.volume}
          onChange={(e) => onChange(draft._key, 'volume', e.target.value)}
          placeholder="Vol"
          className={`w-full bg-white dark:bg-background border rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
            draft.errors?.volume ? 'border-red-400' : 'border-emerald-200 dark:border-emerald-700'
          }`}
        />
        {draft.errors?.volume && (
          <p className="text-[10px] text-red-500 mt-0.5">{draft.errors.volume}</p>
        )}
      </td>
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 align-top w-20">
        <select
          value={draft.unit}
          onChange={(e) => onChange(draft._key, 'unit', e.target.value)}
          className="w-full bg-white dark:bg-background border border-emerald-200 dark:border-emerald-700 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        >
          {SATUANS.map((sat) => (
            <option key={sat} value={sat}>
              {sat}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 align-top w-28">
        <input
          type="number"
          value={draft.unit_price}
          onChange={(e) => onChange(draft._key, 'unit_price', e.target.value)}
          placeholder="Hrg Sat"
          className={`w-full bg-white dark:bg-background border rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
            draft.errors?.unit_price ? 'border-red-400' : 'border-emerald-200 dark:border-emerald-700'
          }`}
        />
        {draft.errors?.unit_price && (
          <p className="text-[10px] text-red-500 mt-0.5">{draft.errors.unit_price}</p>
        )}
      </td>
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 align-top w-28 pt-3">
        {calculatedTotal > 0 ? formatCurrency(calculatedTotal) : '-'}
      </td>
      {/* Rekapitulasi */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 text-center text-xs text-muted-foreground align-top w-32 pt-3">-</td>
      {/* Bobot % */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 text-center text-xs text-muted-foreground align-top w-16 pt-3">-</td>
      {/* Progress % */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 text-center text-xs text-muted-foreground align-top w-16 pt-3">-</td>
      {/* Aksi */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 text-center align-top w-24 pt-2">
        <button
          onClick={() => onRemove(draft._key)}
          title="Hapus baris ini"
          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
});
