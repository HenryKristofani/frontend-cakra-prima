"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ArrowUpFromLine, Lock } from "lucide-react";
import { fundMovementService } from "@/lib/services/fundMovementService";
import { fundSourceService, FundSourceBreakdownItem } from "@/lib/services/fundSourceService";
import { inventoryService } from "@/lib/services/inventoryService";
import { Account, Project } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";

interface WithdrawFundModalProps {
  fundSourceId: number;
  fundSourceName: string;
  sourceProjectId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function AccountBlock({
  isIsolated,
  accounts,
  isLoading,
  value,
  onChange,
}: {
  isIsolated: boolean | null;
  accounts: Account[];
  isLoading: boolean;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  if (isIsolated === null) return null;

  return (
    <div className="flex-1 space-y-1.5">
      <label className="text-sm font-medium">Akun Rekening (Sumber Penarikan)</label>
      {isIsolated ? (
        <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Kas Mandiri (Isolated)</span>
        </div>
      ) : isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground h-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Memuat akun...
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          required
        >
          <option value="">-- Pilih Rekening --</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function WithdrawFundModal({ fundSourceId, fundSourceName, sourceProjectId, onClose, onSuccess }: WithdrawFundModalProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [sourceItem, setSourceItem] = useState<FundSourceBreakdownItem | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const [sourceAccountId, setSourceAccountId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "rek">("cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxAmount = sourceItem?.current_amount ?? null;
  const amountExceeded = maxAmount !== null && Number(amount) > maxAmount;
  const isSourceIsolated = project?.is_isolated_cash ?? null;

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, breakdown, allAccounts] = await Promise.all([
          inventoryService.getProjects(),
          fundSourceService.getFundSourceBreakdown(fundSourceId),
          inventoryService.getAccounts(),
        ]);
        const proj = projects.find((p) => p.id === sourceProjectId) || null;
        setProject(proj);
        setSourceItem(breakdown.breakdown.find((b) => b.project_id === sourceProjectId) || null);
        
        if (proj && !proj.is_isolated_cash) {
            setAccounts(allAccounts);
        }
      } finally {
        setIsLoadingInit(false);
      }
    };
    load();
  }, [fundSourceId, sourceProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountExceeded) {
      setError("Jumlah penarikan melebihi saldo yang tersedia.");
      return;
    }
    if (!isSourceIsolated && sourceAccountId === "") {
      setError("Pilih rekening untuk project asal.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        type: "Withdrawal",
        fund_source_id: fundSourceId,
        source_project_id: sourceProjectId,
        amount: Number(amount),
        payment_method: paymentMethod,
        date,
        notes: notes || undefined,
      };
      if (!isSourceIsolated && sourceAccountId !== "") {
        payload.source_account_id = sourceAccountId;
      }

      await fundMovementService.createFundMovement(payload);
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal melakukan penarikan dana.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    amount !== "" &&
    Number(amount) > 0 &&
    !amountExceeded &&
    (isSourceIsolated === true || (isSourceIsolated === false && sourceAccountId !== ""));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-lg rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ArrowUpFromLine className="w-5 h-5 text-rose-500" />
              Tarik Modal
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">kembali ke <strong>{fundSourceName}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="withdraw-fund-form" onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {isLoadingInit ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
            </div>
          ) : (
            <>
              {/* Info Source Project */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Menarik dana dari:</p>
                <p className="font-semibold">{project?.name}</p>
                {maxAmount !== null && (
                  <p className="text-sm text-primary mt-1">Saldo tersedia: {formatCurrency(maxAmount)}</p>
                )}
              </div>

              {/* Account Block */}
              {isSourceIsolated !== null && (
                <div className="border border-border rounded-lg p-3 space-y-3">
                  <AccountBlock
                    isIsolated={isSourceIsolated}
                    accounts={accounts}
                    isLoading={isLoadingAccounts}
                    value={sourceAccountId}
                    onChange={setSourceAccountId}
                  />
                </div>
              )}

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Jumlah Penarikan (Rp)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                  max={maxAmount ?? undefined}
                  className={`w-full h-10 px-3 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 transition-colors ${
                    amountExceeded
                      ? "border-red-400 focus:ring-red-300 dark:border-red-600"
                      : "border-input focus:ring-primary/30"
                  }`}
                  required
                />
                {amountExceeded && (
                  <p className="text-xs text-red-500">
                    ⚠ Melebihi saldo yang tersedia ({formatCurrency(maxAmount!)})
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Metode Pembayaran</label>
                <div className="flex gap-3">
                  {(["cash", "rek"] as const).map((m) => (
                    <label key={m} className={`flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-md flex-1 transition-colors ${paymentMethod === m ? "border-primary bg-primary/5" : "border-border"}`}>
                      <input type="radio" name="pm-withdraw" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                      {m === "cash" ? "Cash / Tunai" : "Transfer Bank"}
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Notes */}
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
            </>
          )}
        </form>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/50 rounded-b-xl">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent rounded-md transition-colors">
            Batal
          </button>
          <button
            type="submit"
            form="withdraw-fund-form"
            disabled={isSubmitting || !canSubmit || isLoadingInit}
            className="px-4 py-2 text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 rounded-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Tarik Modal
          </button>
        </div>
      </div>
    </div>
  );
}
