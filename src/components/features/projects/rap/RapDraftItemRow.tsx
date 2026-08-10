'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface RapDraftItem {
  /** Client-only key untuk identifikasi sebelum punya real ID */
  _key: string;
  description: string;
  volume: string;
  unit: string;
  unit_price: string;
  /** Error dari 422 backend, key = field name */
  errors?: Record<string, string>;
}

const SATUANS = ['m', 'm2', 'm3', 'm4', 'Unit', 'Ls', 'Titik', 'bh', 'ls', 'kg', 'ton', 'zak'];

interface RapDraftItemRowProps {
  draft: RapDraftItem;
  idx: number;
  pajakPct: number;
  onChange: (key: string, field: keyof RapDraftItem, value: string) => void;
  onRemove: (key: string) => void;
}

/**
 * RapDraftItemRow – baris baru RAP yang belum disimpan.
 * Tidak ada field status (RAP tidak pakai status).
 * Defined di top-level file agar React tidak remount saat parent re-render.
 */
export const RapDraftItemRow = React.memo(function RapDraftItemRow({
  draft,
  pajakPct,
  onChange,
  onRemove,
}: RapDraftItemRowProps) {
  const rawTotal = (parseFloat(draft.volume) || 0) * (parseFloat(draft.unit_price) || 0);
  const effectiveUnitPrice = (parseFloat(draft.unit_price) || 0) * (1 - pajakPct / 100);
  const effectiveTotal = (parseFloat(draft.volume) || 0) * effectiveUnitPrice;

  const inputBase =
    'w-full bg-white dark:bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50';
  const inputClass = (err?: string) =>
    `${inputBase} ${err ? 'border-red-400' : 'border-emerald-200 dark:border-emerald-700'}`;

  return (
    <tr className="bg-emerald-50/70 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 text-foreground">
      <td className="px-3 py-2 border-x border-emerald-200/50 dark:border-emerald-800/50 text-center text-[10px] text-emerald-700 dark:text-emerald-400 font-bold w-10">
        BARU
      </td>

      {/* Uraian */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50">
        <input
          type="text"
          value={draft.description}
          onChange={(e) => onChange(draft._key, 'description', e.target.value)}
          placeholder="Uraian pekerjaan..."
          className={inputClass(draft.errors?.description)}
        />
        {draft.errors?.description && (
          <p className="text-[10px] text-red-500 mt-0.5">{draft.errors.description}</p>
        )}
      </td>

      {/* Volume */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 w-20">
        <input
          type="number"
          step="0.01"
          value={draft.volume}
          onChange={(e) => onChange(draft._key, 'volume', e.target.value)}
          placeholder="Vol"
          className={inputClass(draft.errors?.volume) + ' text-right'}
        />
        {draft.errors?.volume && (
          <p className="text-[10px] text-red-500 mt-0.5">{draft.errors.volume}</p>
        )}
      </td>

      {/* Satuan */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 w-20">
        <select
          value={draft.unit}
          onChange={(e) => onChange(draft._key, 'unit', e.target.value)}
          className={`${inputBase} border-emerald-200 dark:border-emerald-700 text-center`}
        >
          {SATUANS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>

      {/* Harga RAB (Kosong / Item Tambahan) */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 align-top w-28 text-center pt-3">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-100 uppercase tracking-wider">
          Item Tambahan
        </span>
      </td>

      {/* Harga Satuan */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 w-28">
        <input
          type="number"
          value={draft.unit_price}
          onChange={(e) => onChange(draft._key, 'unit_price', e.target.value)}
          placeholder="Hrg Sat"
          className={inputClass(draft.errors?.unit_price) + ' text-right'}
        />
        {draft.errors?.unit_price && (
          <p className="text-[10px] text-red-500 mt-0.5">{draft.errors.unit_price}</p>
        )}
      </td>

      {/* Harga Efektif (after pajak) */}
      <td className={`px-3 py-1.5 border-r border-emerald-200/50 dark:border-emerald-800/50 text-right text-xs align-top pt-2.5 tabular-nums ${pajakPct > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-700/60 dark:text-emerald-400/60'}`}>
        {pajakPct > 0
          ? formatCurrency(effectiveUnitPrice).replace('Rp', '').trim()
          : '-'}
      </td>

      {/* Jumlah RAB (Kosong / Item Tambahan) */}
      <td className="px-3 py-2 border-r border-emerald-200/50 dark:border-emerald-800/50 text-right text-xs text-emerald-700/60 dark:text-emerald-400/60 align-top pt-3 tabular-nums w-32 bg-emerald-50/50 dark:bg-emerald-950/20">
        -
      </td>

      {/* Jumlah RAP */}
      <td className="px-3 py-2 text-right font-medium align-top pt-3 tabular-nums w-32 border-r border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400">
        {effectiveTotal > 0 ? formatCurrency(effectiveTotal).replace('Rp', '').trim() : '-'}
      </td>

      {/* Hapus */}
      <td className="px-3 py-2 text-center w-10">
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
