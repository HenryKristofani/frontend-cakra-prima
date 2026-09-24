"use client";

import { useState } from "react";
import { FundSource, fundSourceService } from "@/lib/services/fundSourceService";
import { X, Loader2 } from "lucide-react";

const FUND_SOURCE_TYPES = [
  { value: "HutangBank", label: "Hutang Bank" },
  { value: "ModalInvestor", label: "Modal Investor" },
  { value: "ModalProjectLain", label: "Modal Project Lain" },
  { value: "Lainnya", label: "Lainnya" },
] as const;

interface EditFundSourceModalProps {
  fundSource: FundSource;
  onClose: () => void;
  onSuccess: (updated: FundSource) => void;
}

export function EditFundSourceModal({ fundSource, onClose, onSuccess }: EditFundSourceModalProps) {
  const [form, setForm] = useState({
    name: fundSource.name,
    type: fundSource.type,
    initial_amount: String(fundSource.initial_amount),
    notes: fundSource.notes ?? "",
    is_active: fundSource.is_active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await fundSourceService.updateFundSource(fundSource.id, {
        name: form.name,
        type: form.type as FundSource["type"],
        initial_amount: Number(form.initial_amount.replace(/\./g, "").replace(",", ".")),
        notes: form.notes || undefined,
        is_active: form.is_active,
      });
      onSuccess(result.data);
    } catch (err: any) {
      setError(err?.message ?? "Gagal memperbarui sumber modal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Edit Sumber Modal</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-sm text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nama</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FundSource["type"] }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              {FUND_SOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Jumlah Modal Awal (Rp)</label>
            <input
              type="number"
              value={form.initial_amount}
              onChange={(e) => setForm((f) => ({ ...f, initial_amount: e.target.value }))}
              required
              min={0}
              step={1}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: Rp {Number(fundSource.total_allocated).toLocaleString("id-ID")} (sudah teralokasi)
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="is_active" className="text-sm text-foreground">Aktif</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
