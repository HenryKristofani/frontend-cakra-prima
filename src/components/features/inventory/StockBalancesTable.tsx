"use client";

import { Box, MapPin, PackageOpen } from "lucide-react";
import { StockBalanceAggregate, StockBalanceDetail } from "@/types/inventory";
import { useRouter } from "next/navigation";

interface StockBalancesTableProps {
  isLoading: boolean;
  isWarehouseMode: boolean;
  selectedWarehouseId?: number | null;
  aggregateData: StockBalanceAggregate[];
  warehouseData: StockBalanceDetail[];
  onRowClick?: (item: StockBalanceAggregate) => void;
}

export function StockBalancesTable({ 
  isLoading, 
  isWarehouseMode, 
  selectedWarehouseId,
  aggregateData, 
  warehouseData,
  onRowClick 
}: StockBalancesTableProps) {
  
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Total Stok</th>
              {!isWarehouseMode && <th className="px-4 py-3 text-center">Sebaran Lokasi</th>}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-border animate-pulse">
                <td className="px-4 py-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
                </td>
                {!isWarehouseMode && (
                  <td className="px-4 py-4 text-center flex justify-center">
                    <div className="h-6 w-20 bg-muted rounded-full"></div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const isEmpty = isWarehouseMode ? warehouseData.length === 0 : aggregateData.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Belum ada stok</h3>
        <p className="text-muted-foreground mt-1 max-w-sm">
          Data stok belum tersedia atau item sudah habis di lokasi ini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
          <tr>
            <th className="px-5 py-3">Barang / Material</th>
            <th className="px-5 py-3 text-right">Jumlah Stok</th>
            {!isWarehouseMode && <th className="px-5 py-3 text-center w-40">Lokasi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {!isWarehouseMode && aggregateData.map((item) => (
            <tr 
              key={item.item_id} 
              onClick={() => onRowClick?.(item)}
              className="hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-base">{item.item_name}</p>
                    <p className="text-xs text-muted-foreground">ID: {item.item_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="font-bold text-lg">{item.total_qty}</span>
                <span className="text-muted-foreground ml-1">{item.item_unit}</span>
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-800">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.location_count} Gudang
                </span>
              </td>
            </tr>
          ))}

          {isWarehouseMode && warehouseData.map((detail) => (
            <tr 
              key={detail.id} 
              onClick={() => router.push(`/dashboard/inventory/${detail.item_id}?warehouse_id=${selectedWarehouseId}`)}
              className="hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-base">{detail.item?.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {detail.item_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="font-bold text-lg">{Number(detail.quantity_on_hand)}</span>
                <span className="text-muted-foreground ml-1">{detail.item?.unit?.symbol}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
