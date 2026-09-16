"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Package, History, MapPin, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { StockMove, StockBalanceDetail, InventoryItem } from "@/types/inventory";
import Link from "next/link";

export default function ItemDetailInventoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const itemId = Number(params.itemId);
  const warehouseId = searchParams.get("warehouse_id") ? Number(searchParams.get("warehouse_id")) : undefined;

  const [itemData, setItemData] = useState<InventoryItem | null>(null);
  const [breakdown, setBreakdown] = useState<StockBalanceDetail[]>([]);
  const [moves, setMoves] = useState<StockMove[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId || isNaN(itemId)) {
      setError("Item ID tidak valid");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [item, locationBreakdown, history] = await Promise.all([
          inventoryService.getItem(itemId),
          inventoryService.getItemBreakdown(itemId),
          inventoryService.getStockMoves(itemId, warehouseId)
        ]);

        setItemData(item);
        setBreakdown(locationBreakdown);
        setMoves(history);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail item.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [itemId, warehouseId]);

  const totalQuantity = breakdown.reduce((sum, b) => sum + Number(b.quantity_on_hand), 0);

  // Jika error tidak spesifik, bisa jadi item tidak ditemukan
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

  if (isLoading || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat detail item...</p>
      </div>
    );
  }

  const getMoveIcon = (type: string) => {
    switch(type) {
      case 'in': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'transfer': return <RefreshCcw className="w-4 h-4 text-blue-600" />;
      case 'usage': return <TrendingDown className="w-4 h-4 text-amber-600" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getMoveLabel = (type: string) => {
    switch(type) {
      case 'in': return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">Masuk</span>;
      case 'transfer': return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">Transfer</span>;
      case 'usage': return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">Pemakaian</span>;
      default: return type;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      {/* Top Nav */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/dashboard/inventory" className="flex items-center hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Inventory
        </Link>
        {warehouseId && (
          <>
            <span className="text-border">|</span>
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-xs font-medium border border-amber-200">
              Filter: Gudang ID {warehouseId} aktif
            </span>
          </>
        )}
      </div>

      {/* Header Section */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{itemData.name}</h1>
            <p className="text-muted-foreground">ID: {itemData.id} &bull; Satuan: {itemData.unit?.name || itemData.unit?.symbol}</p>
          </div>
        </div>
        <div className="text-left md:text-right bg-muted/30 p-4 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Stok Keseluruhan</p>
          <div className="text-3xl font-bold">
            {totalQuantity} <span className="text-lg text-muted-foreground font-normal">{itemData.unit?.symbol}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown Section */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-500" /> Lokasi Stok
          </h2>
          <div className="bg-card border border-border rounded-xl p-1 shadow-sm">
            {breakdown.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Tidak ada stok tersedia.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {breakdown.map((b) => {
                  const isHighlighted = warehouseId && b.warehouse_id === warehouseId;
                  return (
                    <div 
                      key={b.id} 
                      className={`p-4 flex items-center justify-between ${isHighlighted ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                    >
                      <div>
                        <p className="font-medium">{b.warehouse?.name || `Gudang #${b.warehouse_id}`}</p>
                        <p className="text-xs text-muted-foreground">{b.warehouse?.type === 'main' ? 'Utama' : 'Project'}</p>
                      </div>
                      <div className="font-bold text-lg">
                        {Number(b.quantity_on_hand)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* History Timeline Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" /> Histori Pergerakan
            </h2>
            {warehouseId && (
              <Link href={`/dashboard/inventory/${itemId}`} className="text-xs text-blue-600 hover:underline">
                Hapus filter gudang
              </Link>
            )}
          </div>
          
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {moves.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <History className="w-10 h-10 mx-auto text-muted/50 mb-3" />
                <p>Belum ada histori pergerakan stok{warehouseId ? ' untuk gudang ini' : ''}.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline vertical line */}
                <div className="absolute left-8 top-6 bottom-6 w-px bg-border hidden sm:block"></div>
                
                <div className="divide-y divide-border/50 sm:divide-y-0">
                  {moves.map((move, idx) => (
                    <div key={`${move.reference_number}-${idx}`} className="p-4 sm:p-6 sm:pl-20 relative hover:bg-muted/30 transition-colors">
                      {/* Timeline Dot */}
                      <div className="hidden sm:flex absolute left-[1.65rem] top-7 w-8 h-8 rounded-full bg-background border border-border items-center justify-center z-10 shadow-sm">
                        {getMoveIcon(move.type)}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            {getMoveLabel(move.type)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(move.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {move.reference_number}
                            </span>
                          </div>
                          
                          <div className="text-sm mt-2 flex flex-wrap items-center gap-2">
                            {/* Source */}
                            {move.type === 'in' ? (
                              <span className="text-muted-foreground italic">Pembelian / Sumber Eksternal</span>
                            ) : (
                              <span className="font-medium text-foreground">{move.source_warehouse || '-'}</span>
                            )}
                            
                            <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                            
                            {/* Destination */}
                            {move.type === 'usage' ? (
                              <span className="text-amber-600 font-medium bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-xs border border-amber-100">Terpakai (Project)</span>
                            ) : (
                              <span className="font-medium text-foreground">{move.destination_warehouse || '-'}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Quantity</p>
                            <p className={`font-bold text-lg ${move.type === 'usage' || move.type === 'transfer' ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {move.type === 'in' ? '+' : ''}{move.quantity}
                            </p>
                          </div>
                          <div className="hidden md:block min-w-[100px]">
                            <p className="text-xs text-muted-foreground mb-0.5">Harga/Unit</p>
                            <p className="font-medium text-sm">Rp {move.unit_price.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
