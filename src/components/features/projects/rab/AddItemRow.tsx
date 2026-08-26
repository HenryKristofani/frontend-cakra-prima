'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { rabService } from '@/lib/services/rabService';

interface AddItemRowProps {
  categoryId: number;
  onRefresh: () => Promise<void>;
}

export function AddItemRow({ categoryId, onRefresh }: AddItemRowProps) {
  const [description, setDescription] = useState('');
  const [volume, setVolume] = useState('');
  const [unit, setUnit] = useState('m2');
  const [unitPrice, setUnitPrice] = useState('');
  const [status, setStatus] = useState<'aktif' | 'dikurangi'>('aktif');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const SATUANS = ['m', 'm2', 'm3', 'm4', 'Unit', 'LS', 'Titik', 'Buah', 'Kg', 'Ton', 'Zak', 'Liter'];

  const handleSubmit = async () => {
    if (!description.trim()) return alert('Uraian wajib diisi');
    const vol = parseFloat(volume);
    const price = parseFloat(unitPrice);
    if (isNaN(vol) || isNaN(price)) return alert('Volume dan Harga Satuan harus berupa angka valid');

    setIsSubmitting(true);
    try {
      await rabService.createItem(categoryId, {
        description: description.trim(),
        volume: vol,
        unit,
        unit_price: price,
        status,
      });
      setDescription('');
      setVolume('');
      setUnitPrice('');
      setStatus('aktif');
      await onRefresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Gagal menambahkan item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="bg-muted/10 border-b border-border/50 text-foreground group hover:bg-muted/20">
      <td className="px-3 py-1.5 border-x border-border/50 text-[10px] text-muted-foreground text-center font-medium w-10">
        BARU
      </td>
      <td className="px-3 py-1.5 border-r border-border/50">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Uraian pekerjaan baru..."
          className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </td>
      <td className="px-3 py-1.5 border-r border-border/50 w-20">
        <input
          type="number"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          placeholder="Vol"
          className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </td>
      <td className="px-3 py-1.5 border-r border-border/50 w-20">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full bg-background border border-border rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        >
          {SATUANS.map((sat) => (
            <option key={sat} value={sat}>
              {sat}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-1.5 border-r border-border/50 w-28">
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          placeholder="Hrg Sat"
          className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </td>
      
      {/* Jumlah Harga */}
      <td className="px-3 py-1.5 border-r border-border/50 text-right text-muted-foreground text-xs font-medium w-28">
        {(parseFloat(volume) || 0) * (parseFloat(unitPrice) || 0)
          ? ((parseFloat(volume) || 0) * (parseFloat(unitPrice) || 0)).toLocaleString('id-ID')
          : '-'}
      </td>
      
      {/* Rekapitulasi (empty for items) */}
      <td className="px-3 py-1.5 border-r border-border/50 text-right text-xs w-32 bg-yellow-50/10">-</td>
      
      {/* Bobot % */}
      <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs text-muted-foreground w-16">-</td>
      
      {/* Progress % */}
      <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs text-muted-foreground w-16">-</td>

      {/* Total % & Aksi */}
      <td className="px-3 py-1.5 border-r border-border/50 text-center w-24">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-2 py-1 bg-foreground text-background rounded text-[10px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1 w-full justify-center"
        >
          {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Tambah
        </button>
      </td>
    </tr>
  );
}
