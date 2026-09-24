"use client";

import { useState } from "react";
import { X, Loader2, PiggyBank } from "lucide-react";
import { fundSourceService } from "@/lib/services/fundSourceService";

interface AddFundSourceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FUND_SOURCE_TYPES = [
  { value: "HutangBank", label: "Hutang Bank" },
  { value: "ModalInvestor", label: "Modal Investor" },
  { value: "ModalProjectLain", label: "Modal Project Lain" },
  { value: "Lainnya", label: "Lainnya" },
];

export function AddFundSourceModal({ onClose, onSuccess }: AddFundSourceModalProps) {
  const [form, setForm] = useState({
    name: "",
    type: "HutangBank",
    initial_amount: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await fundSourceService.createFundSource({
        name: form.name,
        type: form.type as "HutangBank" | "ModalInvestor" | "ModalProjectLain" | "Lainnya",
        initial_amount: Number(form.initial_amount),
        notes: form.notes || undefined,
      });
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal menyimpan sumber modal.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-md rounded-xl shadow-lg border border-border flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            Tambah Sumber Modal
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="add-fund-source-form" onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nama Sumber Modal</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="cth: Hutang Bank BNI Proyek 2026"
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipe Sumber</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {FUND_SOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Total Modal (Rp)</label>
            <input
              type="number"
              value={form.initial_amount}
              onChange={(e) => setForm((f) => ({ ...f, initial_amount: e.target.value }))}
              placeholder="cth: 500000000"
              min={1}
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Keterangan <span className="text-muted-foreground font-normal">(opsional)</span></label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Informasi tambahan, nomor kontrak, dll."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </form>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent rounded-md transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-fund-source-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Simpan Sumber Modal
          </button>
        </div>
      </div>
    </div>
  );
}
