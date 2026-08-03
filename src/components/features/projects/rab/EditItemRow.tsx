'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { RabItem } from '@/types/rab';
import { rabService } from '@/lib/services/rabService';
import { formatCurrency } from '@/utils/formatters';

interface EditItemRowProps {
  item: RabItem;
  idx: number;
  onRefresh: () => Promise<void>;
  onCancel: () => void;
}

export function EditItemRow({ item, idx, onRefresh, onCancel }: EditItemRowProps) {
  const [description, setDescription] = useState(item.description);
  const [volume, setVolume] = useState(item.volume.toString());
  const [unit, setUnit] = useState(item.unit);
  const [unitPrice, setUnitPrice] = useState(item.unit_price.toString());
  const [status, setStatus] = useState<'aktif' | 'dikurangi' | 'dibatalkan'>(item.status);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const SATUANS = ['m', 'm2', 'm3', 'm4', 'Unit', 'Ls', 'Titik', 'bh', 'ls', 'kg', 'ton', 'zak'];
  if (!SATUANS.includes(item.unit)) SATUANS.push(item.unit);

  const handleSave = async () => {
    if (!description.trim()) return alert('Uraian wajib diisi');
    const vol = parseFloat(volume);
    const price = parseFloat(unitPrice);
    if (isNaN(vol) || isNaN(price)) return alert('Volume dan Harga Satuan harus berupa angka valid');

    setIsSaving(true);
    try {
      await rabService.updateItem(item.category_id, item.id, {
        description: description.trim(),
        volume: vol,
        unit,
        unit_price: price,
        status,
      });
      await onRefresh();
      onCancel();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Gagal memperbarui item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus item "${item.description}"?`)) return;
    setIsDeleting(true);
    try {
      await rabService.deleteItem(item.category_id, item.id);
      await onRefresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Gagal menghapus item');
    } finally {
      setIsDeleting(false);
    }
  };

  const calculatedTotal = (parseFloat(volume) || 0) * (parseFloat(unitPrice) || 0);

  return (
    <tr className="bg-blue-50/50 dark:bg-blue-900/20 border-b border-border text-foreground">
      <td className="px-3 py-2 border-x border-border/50 text-center text-muted-foreground text-xs w-10">
        {idx + 1}
      </td>
      <td className="px-3 py-2 border-r border-border/50">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-background border border-blue-200 dark:border-blue-800 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <div className="mt-1 flex items-center gap-2">
           <label className="text-[10px] text-muted-foreground">Status:</label>
           <select 
              value={status} 
              onChange={e => setStatus(e.target.value as any)}
              className="bg-background border border-border rounded px-1 py-0.5 text-[10px] text-muted-foreground"
            >
             <option value="aktif">Aktif</option>
             <option value="dikurangi">Dikurangi (Tidak Dikerjakan)</option>
           </select>
        </div>
      </td>
      <td className="px-3 py-2 border-r border-border/50 align-top w-20">
        <input
          type="number"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="w-full bg-background border border-blue-200 dark:border-blue-800 rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </td>
      <td className="px-3 py-2 border-r border-border/50 align-top w-20">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full bg-background border border-blue-200 dark:border-blue-800 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        >
          {SATUANS.map((sat) => (
            <option key={sat} value={sat}>
              {sat}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 border-r border-border/50 align-top w-28">
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="w-full bg-background border border-blue-200 dark:border-blue-800 rounded px-1 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </td>
      
      {/* Jumlah Harga */}
      <td className="px-3 py-2 border-r border-border/50 text-right text-xs font-medium text-blue-600 dark:text-blue-400 align-top w-28 pt-3">
        {formatCurrency(calculatedTotal)}
      </td>
      
      {/* Rekapitulasi */}
      <td className="px-3 py-2 border-r border-border/50 text-right text-xs text-muted-foreground align-top w-32 pt-3">
        -
      </td>

      <td className="px-3 py-2 border-r border-border/50 text-right text-muted-foreground text-xs align-top w-16 pt-3">
        {item.bobot_percentage.toFixed(2)}%
      </td>
      <td className="px-3 py-2 border-r border-border/50 text-right text-muted-foreground text-xs align-top w-16 pt-3">
        {item.latest_progress_percentage}%
      </td>
      
      {/* Aksi & Total % */}
      <td className="px-3 py-2 border-r border-border/50 text-right align-top w-24">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="px-2 py-1 text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 w-full flex justify-center"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
          </button>
          <div className="flex gap-1 w-full">
             <button
               onClick={onCancel}
               disabled={isSaving || isDeleting}
               className="px-2 py-1 text-[10px] font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded transition-colors disabled:opacity-50 flex-1 text-center"
             >
               Batal
             </button>
             <button
               onClick={handleDelete}
               disabled={isSaving || isDeleting}
               title="Hapus Item"
               className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors disabled:opacity-50"
             >
               {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
             </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
