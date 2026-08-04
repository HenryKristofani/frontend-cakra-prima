'use client';

import React from 'react';
import { RotateCcw, Edit2, ListTodo } from 'lucide-react';
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

interface ExistingItemRowProps {
  item: RabItem;
  dirtyState?: DirtyItemState;
  idx: number;
  isFullEdit: boolean;
  onQuickChange: (item: RabItem, field: keyof DirtyItemState, value: string) => void;
  onStartFullEdit: (item: RabItem) => void;
  onRevert: (itemId: number) => void;
  onShowProgress: (itemId: number) => void;
  isShowingProgress: boolean;
}

/**
 * ExistingItemRow – Baris existing (sudah tersimpan di DB).
 * 
 * Mode 1 (Quick Edit): 4 kolom selalu editable. Mengganti kolom memicu state dirty.
 * Mode 2 (Full Edit): Jika `isFullEdit` true (via klik Edit), kolom status menjadi select.
 */
export const ExistingItemRow = React.memo(function ExistingItemRow({
  item,
  dirtyState,
  idx,
  isFullEdit,
  onQuickChange,
  onStartFullEdit,
  onRevert,
  onShowProgress,
  isShowingProgress,
}: ExistingItemRowProps) {
  const isDirty = !!dirtyState;
  
  // Use dirty values if available, else fallback to original item
  const description = isDirty ? dirtyState.description : item.description;
  const volume = isDirty ? dirtyState.volume : item.volume.toString();
  const unit = isDirty ? dirtyState.unit : item.unit;
  const unitPrice = isDirty ? dirtyState.unit_price : item.unit_price.toString();
  const status = isDirty ? dirtyState.status : item.status;
  const errors = isDirty ? dirtyState.errors : undefined;

  const uniqueUnits = SATUANS.includes(item.unit) ? SATUANS : [...SATUANS, item.unit];
  const calculatedTotal = (parseFloat(volume) || 0) * (parseFloat(unitPrice) || 0);

  // Styling based on dirty state
  const rowClass = isDirty
    ? "bg-amber-50/70 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-foreground group"
    : "border-b border-border/30 hover:bg-muted/10 group";

  const inputClass = (hasError?: string) => 
    `w-full rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors ${
      isDirty 
        ? (hasError ? 'bg-white dark:bg-background border border-red-400' : 'bg-white dark:bg-background border border-amber-200 dark:border-amber-700')
        : (hasError ? 'bg-white dark:bg-background border border-red-400' : 'bg-transparent border border-transparent hover:border-border hover:bg-background')
    }`;

  const inputRightClass = (hasError?: string) => 
    `w-full rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors tabular-nums ${
      isDirty 
        ? (hasError ? 'bg-white dark:bg-background border border-red-400' : 'bg-white dark:bg-background border border-amber-200 dark:border-amber-700')
        : (hasError ? 'bg-white dark:bg-background border border-red-400' : 'bg-transparent border border-transparent hover:border-border hover:bg-background')
    }`;

  return (
    <tr className={rowClass}>
      <td className={`px-3 py-1.5 border-x border-border/50 text-center text-xs align-top pt-2.5 ${isDirty ? 'text-amber-700 dark:text-amber-400 font-bold text-[10px]' : ''}`}>
        {isDirty ? 'EDIT' : (idx + 1)}
      </td>
      
      {/* Kolom 1: Uraian & Status */}
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
            
            {/* Status Rendering (Full Edit vs Quick Edit/Read) */}
            <div className="mt-1 px-2 flex items-center gap-2">
              {isFullEdit ? (
                <>
                  <label className="text-[10px] text-muted-foreground">Status:</label>
                  <select
                    value={status}
                    onChange={(e) => onQuickChange(item, 'status', e.target.value)}
                    className="bg-white dark:bg-background border border-amber-200 dark:border-amber-700 rounded px-1 py-0.5 text-[10px] text-foreground"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="dikurangi">Dikurangi (Tidak Dikerjakan)</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </>
              ) : (
                <>
                  {status === 'dikurangi' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                      Dikurangi
                    </span>
                  )}
                  {status === 'dibatalkan' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-500/10 dark:text-gray-400">
                      Dibatalkan
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Action Buttons (Edit / Revert / Progress) */}
          <div className="flex items-center gap-1 shrink-0 pt-1 w-12 justify-end">
            {isDirty ? (
              <button
                onClick={() => onRevert(item.id)}
                title="Batalkan perubahan baris ini"
                className="p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {!isFullEdit && (
                  <button
                    onClick={() => onStartFullEdit(item)}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title="Edit Item Lengkap"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
                {status === 'aktif' && (
                  <button
                    onClick={() => onShowProgress(item.id)}
                    className={`p-1 rounded ${isShowingProgress ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                    title="Laporan Progress"
                  >
                    <ListTodo className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Kolom 2: Volume */}
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

      {/* Kolom 3: Satuan */}
      <td className="px-3 py-1.5 border-r border-border/50 align-top w-20">
        <select
          value={unit}
          onChange={(e) => onQuickChange(item, 'unit', e.target.value)}
          className={inputClass(errors?.unit) + ' text-center'}
        >
          {uniqueUnits.map((sat) => (
            <option key={sat} value={sat}>{sat}</option>
          ))}
        </select>
      </td>

      {/* Kolom 4: Harga Satuan */}
      <td className="px-3 py-1.5 border-r border-border/50 align-top w-28">
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => onQuickChange(item, 'unit_price', e.target.value)}
          className={inputRightClass(errors?.unit_price)}
        />
        {errors?.unit_price && <p className="text-[10px] text-red-500 mt-0.5">{errors.unit_price}</p>}
      </td>

      {/* Jumlah Harga (live preview) */}
      <td className={`px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 tabular-nums ${isDirty ? 'font-medium text-amber-700 dark:text-amber-400' : 'font-medium'}`}>
        {calculatedTotal > 0 ? formatCurrency(calculatedTotal).replace('Rp', '').trim() : '-'}
      </td>
      
      {/* Rekapitulasi */}
      <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs text-muted-foreground align-top pt-2.5 bg-yellow-50/10 w-32">-</td>
      
      {/* Bobot % (server) */}
      <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs text-muted-foreground align-top pt-2.5 w-16">
        {item.bobot_percentage.toFixed(2)}%
      </td>
      
      {/* Progress % */}
      <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs align-top pt-2.5 bg-blue-50/20 w-16">
        <span className="font-semibold text-blue-700 dark:text-blue-300">
          {item.latest_progress_percentage}%
        </span>
      </td>
      
      {/* Total % */}
      <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs text-muted-foreground align-top pt-2.5 w-24">
        {item.total_percentage.toFixed(2)}%
      </td>
    </tr>
  );
});
