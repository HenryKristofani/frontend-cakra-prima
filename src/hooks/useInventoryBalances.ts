import { useState, useCallback } from 'react';
import { inventoryService } from '@/lib/services/inventoryService';
import { StockBalanceAggregate, StockBalanceDetail, Warehouse } from '@/types/inventory';

export function useInventoryBalances() {
  const [activeTab, setActiveTab] = useState<'all' | 'warehouse'>('all');
  
  // Data States
  const [aggregateData, setAggregateData] = useState<StockBalanceAggregate[]>([]);
  const [warehouseData, setWarehouseData] = useState<StockBalanceDetail[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await inventoryService.getWarehouses();
      setWarehouses(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const fetchAggregateBalances = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAllBalances();
      setAggregateData(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data stok keseluruhan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWarehouseBalances = useCallback(async (warehouseId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getBalancesByWarehouse(warehouseId);
      setWarehouseData(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data stok gudang');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to switch tabs and load corresponding data
  const switchTab = useCallback((tab: 'all' | 'warehouse') => {
    setActiveTab(tab);
    if (tab === 'all') {
      fetchAggregateBalances();
    } else {
      if (warehouses.length === 0) fetchWarehouses();
      if (selectedWarehouseId) fetchWarehouseBalances(selectedWarehouseId);
    }
  }, [warehouses.length, selectedWarehouseId, fetchAggregateBalances, fetchWarehouses, fetchWarehouseBalances]);

  const selectWarehouse = useCallback((id: number) => {
    setSelectedWarehouseId(id);
    fetchWarehouseBalances(id);
  }, [fetchWarehouseBalances]);

  return {
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
  };
}
