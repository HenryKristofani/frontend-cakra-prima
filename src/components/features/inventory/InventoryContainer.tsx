"use client";

import { useState, useCallback, useEffect } from "react";
import { useInventoryBalances } from "@/hooks/useInventoryBalances";
import { StockBalancesTable } from "./StockBalancesTable";
import { LocationBreakdownModal } from "./LocationBreakdownModal";
import { StockBalanceAggregate } from "@/types/inventory";
import { Building2, Layers, Plus, ArrowRightLeft, HardHat, FileText, CheckCircle2, History } from "lucide-react";
import { ReceiptFormModal } from "./ReceiptFormModal";
import { TransferFormModal } from "./TransferFormModal";
import { UsageFormModal } from "./UsageFormModal";
import { UsagePendingList } from "./UsagePendingList";
import Link from "next/link";

import { WarehouseManagementModal } from "./WarehouseManagementModal";

export function InventoryContainer() {
  const {
    activeTab,
    aggregateData,
    warehouseData,
    warehouses,
    selectedWarehouseId,
    isLoading,
    error,
    switchTab,
    selectWarehouse,
    fetchAggregateBalances,
    fetchWarehouses
  } = useInventoryBalances();

  const [selectedItem, setSelectedItem] = useState<StockBalanceAggregate | null>(null);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'none' | 'receipt' | 'transfer' | 'usage' | 'manage_warehouses'>('none');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    fetchAggregateBalances();
    fetchWarehouses();
  }, [fetchAggregateBalances, fetchWarehouses]);

  const handleMutationSuccess = (message: string) => {
    setActiveModal('none');
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(null), 3000);
    // Refresh data depending on active tab
    if (activeTab === 'all') fetchAggregateBalances();
    else if (selectedWarehouseId) selectWarehouse(selectedWarehouseId);
  };

  const handleWarehouseManageSuccess = () => {
    // Just refresh the warehouse list so dropdowns are updated
    fetchWarehouses();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setActiveModal('receipt')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Penerimaan Barang
          </button>
          <button 
            onClick={() => setActiveModal('transfer')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer Antar Gudang
          </button>
          <button 
            onClick={() => setActiveModal('usage')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <HardHat className="w-4 h-4" /> Catat Pemakaian
          </button>
        </div>
        <div>
          <button 
            onClick={() => setActiveModal('manage_warehouses')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Building2 className="w-4 h-4" /> Kelola Gudang
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => switchTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'all' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            Semua Stok
          </button>
          <button
            onClick={() => switchTab('warehouse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'warehouse' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Per Gudang/Project
          </button>
          <button
            onClick={() => switchTab('pending-kas' as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              (activeTab as any) === 'pending-kas' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            Pemakaian Pending Kas
          </button>
        </div>

        {/* Dropdown Gudang */}
        {activeTab === 'warehouse' && (
          <div className="flex-1 flex items-center gap-3">
            <div className="w-full max-w-xs">
              <select
                value={selectedWarehouseId || ''}
                onChange={(e) => selectWarehouse(Number(e.target.value))}
                className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="" disabled>-- Pilih Gudang/Lokasi --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.type === 'project' ? '(Project)' : '(Utama)'}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedWarehouseId && (
              <Link
                href={`/dashboard/inventory/warehouses/${selectedWarehouseId}`}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md text-sm font-medium transition-colors"
                title="Lihat Histori Gudang"
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">Histori Transaksi Gudang Ini</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Warning for unselected warehouse */}
      {activeTab === 'warehouse' && !selectedWarehouseId && !error && (
        <div className="p-8 text-center bg-card border border-border rounded-xl">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium">Pilih Lokasi Gudang</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Silakan pilih gudang pada dropdown di atas untuk melihat rincian stok material di lokasi tersebut.
          </p>
        </div>
      )}

      {/* Table Area (Stok) */}
      {(activeTab === 'all' || (activeTab === 'warehouse' && selectedWarehouseId)) && (
        <StockBalancesTable 
          isLoading={isLoading}
          isWarehouseMode={activeTab === 'warehouse'}
          selectedWarehouseId={selectedWarehouseId}
          aggregateData={aggregateData}
          warehouseData={warehouseData}
          onRowClick={(item) => setSelectedItem(item)}
        />
      )}

      {/* Pending Kas Area */}
      {(activeTab as any) === 'pending-kas' && (
        <UsagePendingList />
      )}

      {/* Modals */}
      {selectedItem && (
        <LocationBreakdownModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
      
      {activeModal === 'manage_warehouses' && (
        <WarehouseManagementModal 
          warehouses={warehouses}
          onClose={() => setActiveModal('none')}
          onSuccess={handleWarehouseManageSuccess}
        />
      )}
      {activeModal === 'receipt' && (
        <ReceiptFormModal 
          warehouses={warehouses} 
          onClose={() => setActiveModal('none')}
          onSuccess={() => handleMutationSuccess("Penerimaan barang berhasil disimpan!")}
        />
      )}
      {activeModal === 'transfer' && (
        <TransferFormModal 
          warehouses={warehouses} 
          onClose={() => setActiveModal('none')}
          onSuccess={() => handleMutationSuccess("Transfer antar gudang berhasil diproses!")}
        />
      )}
      {activeModal === 'usage' && (
        <UsageFormModal 
          warehouses={warehouses} 
          onClose={() => setActiveModal('none')}
          onSuccess={() => handleMutationSuccess("Pemakaian barang berhasil dicatat!")}
        />
      )}
    </div>
  );
}
