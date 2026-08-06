"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { progressService, ProgressReportHistory } from "@/lib/services/progressService";

interface ProgressHistoryPanelProps {
  itemId: number;
}

export function ProgressHistoryPanel({ itemId }: ProgressHistoryPanelProps) {
  const [history, setHistory] = useState<ProgressReportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await progressService.getItemHistory(itemId);
        if (mounted) {
          setHistory(response.data);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message || "Gagal memuat histori progress");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [itemId]);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center bg-muted/30">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground bg-muted/30">
        Belum ada laporan progress untuk item ini.
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/30">
      <h4 className="text-sm font-semibold mb-3">Histori Pelaporan Progress</h4>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Tanggal</th>
              <th className="px-4 py-2 text-right font-medium">Progress Kumulatif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {history.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2">
                  {new Date(row.report_date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {row.percentage_complete.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
