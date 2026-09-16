"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Building2, History, TrendingUp, TrendingDown, RefreshCcw, ChevronDown, Package } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { StockTransferDocument, Warehouse } from "@/types/inventory";
import Link from "next/link";

export default function WarehouseTransactionsPage() {
  const params = useParams();
  const router = useRouter();
  
  const warehouseId = Number(params.warehouseId);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [transactions, setTransactions] = useState<StockTransferDocument[]>([]);
  const [expandedDocs, setExpandedDocs] = useState<Record<number, boolean>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!warehouseId || isNaN(warehouseId)) {
      setError("Warehouse ID tidak valid");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [warehouseData, txData] = await Promise.all([
          inventoryService.getWarehouse(warehouseId),
          inventoryService.getWarehouseTransactions(warehouseId, 1) // Implementasi pagination bisa ditambahkan nanti
        ]);

        setWarehouse(warehouseData);
        setTransactions(txData.data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail gudang dan histori transaksi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [warehouseId]);

  const toggleExpand = (id: number) => {
    setExpandedDocs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getMoveIcon = (type: string) => {
    switch(type) {
      case 'in': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'transfer': return <RefreshCcw className="w-5 h-5 text-blue-600" />;
      case 'usage': return <TrendingDown className="w-5 h-5 text-amber-600" />;
      default: return <History className="w-5 h-5" />;
    }
  };

  const getMoveLabel = (type: string) => {
    switch(type) {
      case 'in': return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Masuk</span>;
      case 'transfer': return <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Transfer</span>;
      case 'usage': return <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">Pemakaian</span>;
      default: return type;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </button>
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading || !warehouse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat histori gudang...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      {/* Top Nav */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/dashboard/inventory" className="flex items-center hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Inventory
        </Link>
      </div>

      {/* Header Section */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{warehouse.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                warehouse.type === 'main' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {warehouse.type === 'main' ? 'Gudang Utama' : 'Gudang Project'}
              </span>
              {warehouse.project && (
                <span className="text-sm text-muted-foreground">
                  &bull; Project: {warehouse.project.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" /> Semua Dokumen Transaksi
        </h2>
        
        {transactions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
            <History className="w-10 h-10 mx-auto text-muted/50 mb-3" />
            <p>Belum ada transaksi di gudang ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const isExpanded = !!expandedDocs[tx.id];
              const totalItems = tx.lines?.length || 0;
              const isSource = tx.source_warehouse_id === warehouseId;
              const isDest = tx.destination_warehouse_id === warehouseId;

              return (
                <div key={tx.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                  {/* Document Header Row (Clickable) */}
                  <div 
                    onClick={() => toggleExpand(tx.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-border flex items-center justify-center shrink-0 mt-0.5">
                        {getMoveIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-mono text-sm font-semibold text-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {tx.reference_number}
                          </span>
                          {getMoveLabel(tx.type)}
                          <span className="text-xs text-muted-foreground ml-1">
                            {new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        
                        <div className="text-sm flex flex-wrap items-center gap-2">
                          <span className={`font-medium ${isSource ? 'text-foreground underline decoration-dashed underline-offset-4' : 'text-muted-foreground'}`}>
                            {tx.type === 'in' ? 'Sumber Eksternal' : (tx.source_warehouse?.name || '-')}
                          </span>
                          <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                          <span className={`font-medium ${isDest ? 'text-foreground underline decoration-dashed underline-offset-4' : 'text-muted-foreground'}`}>
                            {tx.type === 'usage' ? (
                              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-xs">Terpakai (Project)</span>
                            ) : (
                              tx.destination_warehouse?.name || '-'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/4">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          {totalItems} item
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-full bg-muted/50 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Document Details Accordion (Lines) */}
                  {isExpanded && (
                    <div className="border-t border-border bg-slate-50/50 dark:bg-slate-900/20 p-4 sm:p-5">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-2">Rincian Item</h4>
                      <div className="bg-background rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                              <th className="px-4 py-2 font-medium">Material</th>
                              <th className="px-4 py-2 font-medium text-right">Qty</th>
                              <th className="px-4 py-2 font-medium text-right">Harga Satuan</th>
                              <th className="px-4 py-2 font-medium text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {tx.lines?.map((line) => (
                              <tr key={line.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3">
                                  <p className="font-medium">{line.item?.name}</p>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-bold">{line.quantity}</span>
                                  <span className="text-muted-foreground ml-1 text-xs">{line.item_unit}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  Rp {Number(line.unit_price).toLocaleString('id-ID')}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                  Rp {(Number(line.quantity) * Number(line.unit_price)).toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))}
                            {totalItems === 0 && (
                              <tr>
                                <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground italic">
                                  Tidak ada rincian item.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
