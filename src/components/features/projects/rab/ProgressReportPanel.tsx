'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { RabItem } from '@/types/rab';
import { rabService } from '@/lib/services/rabService';

interface ProgressReportPanelProps {
  item: RabItem;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export function ProgressReportPanel({ item, onRefresh, onClose }: ProgressReportPanelProps) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [percentage, setPercentage] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const pct = parseFloat(percentage);
    if (!date) return alert('Tanggal wajib diisi');
    if (isNaN(pct) || pct < 0 || pct > 100) return alert('Persentase harus antara 0 dan 100');

    setIsSubmitting(true);
    try {
      await rabService.createProgressReport(item.category_id, item.id, {
        report_date: date,
        percentage_complete: pct,
        notes: notes.trim() || undefined,
      });
      setPercentage('');
      setNotes('');
      setDate(today);
      await onRefresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Gagal menyimpan laporan progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="bg-blue-50/60 dark:bg-blue-950/20 border-b border-border/50">
      <td colSpan={10} className="px-4 py-3 border-x border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">
              Tambah Laporan Progress — <span className="normal-case font-medium">{item.description}</span>
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>

              {/* Percentage */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground">Progress %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="0 – 100"
                  className="w-20 bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                <label className="text-[10px] text-muted-foreground">Catatan (opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Simpan
              </button>
            </div>

            {/* Current progress display */}
            <p className="text-[10px] text-muted-foreground mt-2">
              Progress saat ini:{' '}
              <span className="font-semibold text-foreground">
                {item.latest_progress_percentage}%
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
