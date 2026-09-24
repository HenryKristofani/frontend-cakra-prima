"use client";

import { useState } from "react";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { FundMovement, fundMovementService } from "@/lib/services/fundMovementService";
import { formatCurrency } from "@/utils/formatters";

interface ReverseMovementModalProps {
  movement: FundMovement;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReverseMovementModal({
  movement,
  onClose,
  onSuccess,
}: ReverseMovementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReverse = async () => {
    setLoading(true);
    setError(null);
    try {
      await fundMovementService.reverseMovement(movement.id);
      onSuccess();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Gagal membatalkan movement");
      setLoading(false);
    }
  };

  const getReversalDescription = () => {
    const amountStr = formatCurrency(movement.amount);
    const fsName = movement.fund_source?.name ?? "Sumber Modal";
    
    if (movement.type === "InitialAllocation") {
      const dest = movement.destination_project?.name ?? "Project";
      return `Ini akan menarik kembali dana sebesar ${amountStr} dari project ${dest} ke ${fsName}.`;
    }
    
    if (movement.type === "Transfer") {
      const src = movement.source_project?.name ?? "Project Asal";
      const dest = movement.destination_project?.name ?? "Project Tujuan";
      return `Ini akan membalikkan transfer sebesar ${amountStr}, mengembalikan dana dari project ${dest} kembali ke project ${src} (dari sumber ${fsName}).`;
    }
    
    if (movement.type === "Withdrawal") {
      const src = movement.source_project?.name ?? "Project";
      return `Ini akan membatalkan penarikan dana, sehingga ${amountStr} akan dialokasikan kembali dari ${fsName} ke project ${src}.`;
    }
    
    return "Tindakan ini akan membatalkan pergerakan dana ini.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Batalkan Fund Movement</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              Anda akan membatalkan mutasi dana dengan referensi <strong>{movement.reference_number}</strong>.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground border border-border/50">
              {getReversalDescription()}
            </div>
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin melanjutkan? Aksi ini akan tercatat dalam histori pembukuan.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-border/50 bg-muted/20">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleReverse}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Ya, Batalkan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
