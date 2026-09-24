"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ArrowLeftRight, Lock } from "lucide-react";
import { fundMovementService } from "@/lib/services/fundMovementService";
import { fundSourceService, FundSourceBreakdownItem } from "@/lib/services/fundSourceService";
import { inventoryService } from "@/lib/services/inventoryService";
import { Account, Project } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";

interface TransferFundModalProps {
  fundSourceId: number;
  fundSourceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AccountBlock({
  label,
  isIsolated,
  accounts,
  isLoading,
  value,
  onChange,
}: {
  label: string;
  isIsolated: boolean | null;
  accounts: Account[];
  isLoading: boolean;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  if (isIsolated === null) return null;

  return (
    <div className="flex-1 space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {isIsolated ? (
        <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Kas Mandiri</span>
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

export function TransferFundModal({ fundSourceId, fundSourceName, onClose, onSuccess }: TransferFundModalProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [eligibleSources, setEligibleSources] = useState<FundSourceBreakdownItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const [sourceProjectId, setSourceProjectId] = useState<number | "">("");
  const [destProjectId, setDestProjectId] = useState<number | "">("");
  const [isSourceIsolated, setIsSourceIsolated] = useState<boolean | null>(null);
  const [isDestIsolated, setIsDestIsolated] = useState<boolean | null>(null);
  const [sourceAccountId, setSourceAccountId] = useState<number | "">("");
  const [destAccountId, setDestAccountId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "rek">("cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute source project's available balance from breakdown
  const selectedSource = eligibleSources.find((e) => e.project_id === sourceProjectId);
  const maxAmount = selectedSource?.current_amount ?? null;
  const amountExceeded = maxAmount !== null && Number(amount) > maxAmount;

  useEffect(() => {
    const load = async () => {
      try {
        const [ps, breakdown] = await Promise.all([
          inventoryService.getProjects(),
          fundSourceService.getFundSourceBreakdown(fundSourceId),
        ]);
        setAllProjects(ps);
        setEligibleSources(breakdown.breakdown);
      } finally {
        setIsLoadingInit(false);
      }
    };
    load();
  }, [fundSourceId]);

  const ensureAccounts = async () => {
    if (accounts.length > 0) return;
    setIsLoadingAccounts(true);
    try {
      setAccounts(await inventoryService.getAccounts());
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleSourceChange = async (id: number | "") => {
    setSourceProjectId(id);
    setIsSourceIsolated(null);
    setSourceAccountId("");
    if (!id) return;
    const proj = allProjects.find((p) => p.id === id);
    const isolated = proj?.is_isolated_cash ?? false;
    setIsSourceIsolated(isolated);
    if (!isolated) await ensureAccounts();
  };

  const handleDestChange = async (id: number | "") => {
    setDestProjectId(id);
    setIsDestIsolated(null);
    setDestAccountId("");
    if (!id) return;
    const proj = allProjects.find((p) => p.id === id);
    const isolated = proj?.is_isolated_cash ?? false;
    setIsDestIsolated(isolated);
    if (!isolated) await ensureAccounts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceProjectId === destProjectId) {
      setError("Project asal dan tujuan tidak boleh sama.");
      return;
    }
    if (amountExceeded) {
      setError("Jumlah melebihi saldo yang tersedia di project asal.");
      return;
    }
    if (!isSourceIsolated && sourceAccountId === "") {
      setError("Pilih rekening untuk project asal.");
      return;
    }
    if (!isDestIsolated && destAccountId === "") {
      setError("Pilih rekening untuk project tujuan.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        type: "Transfer",
        fund_source_id: fundSourceId,
        source_project_id: sourceProjectId,
        destination_project_id: destProjectId,
        amount: Number(amount),
        payment_method: paymentMethod,
        date,
        notes: notes || undefined,
      };
      if (!isSourceIsolated && sourceAccountId !== "") payload.source_account_id = sourceAccountId;
      if (!isDestIsolated && destAccountId !== "") payload.destination_account_id = destAccountId;

      await fundMovementService.createFundMovement(payload);
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal melakukan realokasi dana.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    sourceProjectId !== "" &&
    destProjectId !== "" &&
    sourceProjectId !== destProjectId &&
    amount !== "" &&
    Number(amount) > 0 &&
    !amountExceeded &&
    (isSourceIsolated === true || (isSourceIsolated === false && sourceAccountId !== "")) &&
    (isDestIsolated === true || (isDestIsolated === false && destAccountId !== ""));

  const showAccountSection = isSourceIsolated !== null || isDestIsolated !== null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-lg rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-amber-500" />
              Realokasi Dana
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">dari sumber <strong>{fundSourceName}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="transfer-fund-form" onSubmit={handleSubmit} className="p-4 space-y-4">
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
              {/* Project Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">📤 Project Asal</label>
                  <select
                    value={sourceProjectId}
                    onChange={(e) => handleSourceChange(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  >
                    <option value="">-- Pilih Project --</option>
                    {eligibleSources.map((es) => (
                      <option key={es.project_id} value={es.project_id} disabled={es.project_id === destProjectId}>
                        {es.project_name} ({formatCurrency(es.current_amount)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">📥 Project Tujuan</label>
                  <select
                    value={destProjectId}
                    onChange={(e) => handleDestChange(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  >
                    <option value="">-- Pilih Project --</option>
                    {allProjects
                      .filter((p) => p.id !== sourceProjectId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Account Block */}
              {showAccountSection && (
                <div className="border border-border rounded-lg p-3 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Informasi Akun & Pembayaran</p>
                  <div className="flex gap-3">
                    <AccountBlock
                      label="Akun Rekening (Keluar)"
                      isIsolated={isSourceIsolated}
                      accounts={accounts}
                      isLoading={isLoadingAccounts}
                      value={sourceAccountId}
                      onChange={setSourceAccountId}
                    />
                    <AccountBlock
                      label="Akun Rekening (Masuk)"
                      isIsolated={isDestIsolated}
                      accounts={accounts}
                      isLoading={isLoadingAccounts}
                      value={destAccountId}
                      onChange={setDestAccountId}
                    />
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Jumlah Transfer (Rp)
                  {maxAmount !== null && (
                    <span className="ml-2 text-muted-foreground font-normal text-xs">
                      Maks: {formatCurrency(maxAmount)}
                    </span>
                  )}
                </label>
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
                    ⚠ Melebihi saldo project asal ({formatCurrency(maxAmount!)})
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Metode Pembayaran</label>
                <div className="flex gap-3">
                  {(["cash", "rek"] as const).map((m) => (
                    <label key={m} className={`flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-md flex-1 transition-colors ${paymentMethod === m ? "border-primary bg-primary/5" : "border-border"}`}>
                      <input type="radio" name="pm-transfer" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
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
            form="transfer-fund-form"
            disabled={isSubmitting || !canSubmit || isLoadingInit}
            className="px-4 py-2 text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 rounded-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Realokasikan Dana
          </button>
        </div>
      </div>
    </div>
  );
}
