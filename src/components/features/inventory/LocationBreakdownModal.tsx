"use client";

import { useEffect, useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { StockBalanceAggregate, StockBalanceDetail } from "@/types/inventory";
import Link from "next/link";

interface LocationBreakdownModalProps {
  item: StockBalanceAggregate;
  onClose: () => void;
}

export function LocationBreakdownModal({ item, onClose }: LocationBreakdownModalProps) {
  const [details, setDetails] = useState<StockBalanceDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await inventoryService.getItemBreakdown(item.item_id);
        setDetails(data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail lokasi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [item.item_id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-lg rounded-xl shadow-lg border border-border flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg">{item.item_name}</h3>
            <p className="text-sm text-muted-foreground">
              Total {item.total_qty} {item.item_unit} tersebar di {item.location_count} lokasi
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat lokasi...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
              {error}
            </div>
          ) : details.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Tidak ada data lokasi yang tersedia.
            </div>
          ) : (
            <div className="space-y-3">
              {details.map((detail) => (
                <div 
                  key={detail.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{detail.warehouse?.name || 'Gudang Unknown'}</p>
                      <span 
                        className={`inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          detail.warehouse?.type === 'main' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                      >
                        {detail.warehouse?.type === 'main' ? 'Gudang Utama' : 'Project'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {Number(detail.quantity_on_hand)} <span className="text-sm font-normal text-muted-foreground">{item.item_unit}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer with History Link */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
          <Link 
            href={`/dashboard/inventory/${item.item_id}`}
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center transition-colors"
          >
            Lihat Histori Lengkap →
          </Link>
        </div>
      </div>
    </div>
  );
}
