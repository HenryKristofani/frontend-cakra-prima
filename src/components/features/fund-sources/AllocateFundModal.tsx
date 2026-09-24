"use client";

import { useState, useEffect } from "react";
import { X, Loader2, TrendingUp, Lock } from "lucide-react";
import { fundMovementService } from "@/lib/services/fundMovementService";
import { inventoryService } from "@/lib/services/inventoryService";
import { Account, Project } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";

interface AllocateFundModalProps {
  fundSourceId: number;
  fundSourceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AllocateFundModal({ fundSourceId, fundSourceName, onClose, onSuccess }: AllocateFundModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const [destinationProjectId, setDestinationProjectId] = useState<number | "">("");
  const [isDestIsolated, setIsDestIsolated] = useState<boolean | null>(null);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "rek">("cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ps = await inventoryService.getProjects();
        setProjects(ps);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    load();
  }, []);

  const handleProjectChange = async (projectId: number | "") => {
    setDestinationProjectId(projectId);
    setIsDestIsolated(null);
    setAccountId("");
    if (!projectId) return;

    const selected = projects.find((p) => p.id === projectId);
    const isolated = selected?.is_isolated_cash ?? false;
    setIsDestIsolated(isolated);

    if (!isolated && accounts.length === 0) {
      setIsLoadingAccounts(true);
      try {
        const accs = await inventoryService.getAccounts();
        setAccounts(accs);
      } finally {
        setIsLoadingAccounts(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDestIsolated && accountId === "") {
      setError("Pilih Akun Rekening untuk project non-isolated.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        type: "InitialAllocation",
        fund_source_id: fundSourceId,
        destination_project_id: destinationProjectId,
        amount: Number(amount),
        payment_method: paymentMethod,
        date,
        notes: notes || undefined,
      };
      if (!isDestIsolated && accountId !== "") payload.account_id = accountId;

      await fundMovementService.createFundMovement(payload);
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal melakukan alokasi dana.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = destinationProjectId !== "" && amount !== "" && Number(amount) > 0 &&
    (isDestIsolated === true || (isDestIsolated === false && accountId !== ""));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-md rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Alokasi Awal Dana
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">dari <strong>{fundSourceName}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="allocate-fund-form" onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Project Tujuan</label>
            {isLoadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-10"><Loader2 className="w-4 h-4 animate-spin" /> Memuat project...</div>
            ) : (
              <select
                value={destinationProjectId}
                onChange={(e) => handleProjectChange(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              >
                <option value="">-- Pilih Project Tujuan --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {isDestIsolated === true && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Project ini menggunakan <strong>Kas Mandiri</strong> — tidak perlu memilih rekening Buku Besar.</span>
            </div>
          )}

          {isDestIsolated === false && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pilih Rekening</label>
              {isLoadingAccounts ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-10"><Loader2 className="w-4 h-4 animate-spin" /> Memuat akun...</div>
              ) : (
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                >
                  <option value="">-- Pilih Rekening --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} {acc.current_balance !== undefined ? `— Saldo: ${formatCurrency(acc.current_balance)}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Jumlah Alokasi (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="cth: 300000000"
              min={1}
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Metode Pembayaran</label>
            <div className="flex gap-3">
              {(["cash", "rek"] as const).map((m) => (
                <label key={m} className={`flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-md flex-1 transition-colors ${paymentMethod === m ? "border-primary bg-primary/5" : "border-border"}`}>
                  <input type="radio" name="pm-allocate" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                  {m === "cash" ? "Cash / Tunai" : "Transfer Bank"}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Keterangan <span className="text-muted-foreground font-normal">(opsional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </form>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/50 rounded-b-xl">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent rounded-md transition-colors">
            Batal
          </button>
          <button
            type="submit"
            form="allocate-fund-form"
            disabled={isSubmitting || !canSubmit}
            className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Alokasikan Dana
          </button>
        </div>
      </div>
    </div>
  );
}
