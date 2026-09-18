"use client";

import { useState, useEffect } from "react";
import { X, Loader2, DollarSign, Lock } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { Account } from "@/types/inventory";

interface PostToKasModalProps {
  usageId: number;
  totalValue: number;
  isIsolated: boolean;   // true = project uses Kas Mandiri (project_kas_transactions)
  onClose: () => void;
  onSuccess: () => void;
}

export function PostToKasModal({ usageId, totalValue, isIsolated, onClose, onSuccess }: PostToKasModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(!isIsolated); // skip fetch when isolated
  
  const [accountId, setAccountId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "rek">("cash");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isIsolated) return; // Isolated projects don't need an account selection

    const fetchAccounts = async () => {
      try {
        const data = await inventoryService.getAccounts();
        setAccounts(data);
      } catch (e: any) {
        setError("Gagal memuat daftar akun kas.");
      } finally {
        setIsLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, [isIsolated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIsolated && accountId === "") {
      setError("Pilih Akun Kas / Rekening.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: { payment_method: string; date: string; account_id?: number } = {
        payment_method: paymentMethod,
        date: date,
      };
      if (!isIsolated && accountId !== "") {
        payload.account_id = Number(accountId);
      }
      await inventoryService.postToKas(usageId, payload);
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Gagal memposting ke kas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = isIsolated ? true : accountId !== "";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-md rounded-xl shadow-lg border border-border flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Posting ke Kas
            </h3>
            <p className="text-sm text-muted-foreground">
              {isIsolated
                ? "Project ini menggunakan Kas Mandiri."
                : "Konversi pemakaian menjadi pengeluaran kas."}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg text-center">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium uppercase tracking-wider mb-1">Total Pengeluaran Beban</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">Rp {totalValue.toLocaleString('id-ID')}</p>
          </div>

          {/* Isolated cash badge */}
          {isIsolated && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Project ini menggunakan <strong>Kas Mandiri</strong> — tidak perlu memilih akun Kas Buku Besar.</span>
            </div>
          )}

          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>}

          <form id="post-kas-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Pembebanan</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                required
              />
            </div>
            
            {/* Account selector — only for non-isolated projects */}
            {!isIsolated && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Akun Kas / Rekening</label>
                {isLoadingAccounts ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Memuat akun...
                  </div>
                ) : (
                  <select 
                    value={accountId}
                    onChange={e => setAccountId(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                    required
                  >
                    <option value="" disabled>-- Pilih Akun --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.code ? `(${acc.code})` : ''} - Saldo: Rp {(acc.current_balance || 0).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Metode Pembayaran</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer border border-border p-2 rounded-md flex-1">
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <span>Cash / Tunai</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer border border-border p-2 rounded-md flex-1">
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="rek"
                    checked={paymentMethod === "rek"}
                    onChange={() => setPaymentMethod("rek")}
                  />
                  <span>Transfer Bank (Rek)</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/50 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent rounded-md"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="post-kas-form"
            className="px-4 py-2 text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 rounded-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Posting Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
