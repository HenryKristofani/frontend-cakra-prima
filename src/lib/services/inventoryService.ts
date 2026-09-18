import { fetchApi } from '../api';
import { ApiResponse, StockBalanceAggregate, StockBalanceDetail, Warehouse, InventoryItem, Unit } from '@/types/inventory';

export const inventoryService = {
  getWarehouses: async (type?: string): Promise<Warehouse[]> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchApi<ApiResponse<Warehouse[]>>(`/inventory/warehouses${queryString}`);
    return data.data;
  },

  getWarehouse: async (id: number): Promise<Warehouse> => {
    const data = await fetchApi<ApiResponse<Warehouse>>(`/inventory/warehouses/${id}`);
    return data.data;
  },

  getAllBalances: async (): Promise<StockBalanceAggregate[]> => {
    const data = await fetchApi<ApiResponse<StockBalanceAggregate[]>>(`/inventory/stock-balances`);
    return data.data;
  },

  getBalancesByWarehouse: async (warehouseId: number): Promise<StockBalanceDetail[]> => {
    const data = await fetchApi<ApiResponse<StockBalanceDetail[]>>(`/inventory/stock-balances?warehouse_id=${warehouseId}`);
    return data.data;
  },

  getItemBreakdown: async (itemId: number): Promise<StockBalanceDetail[]> => {
    const data = await fetchApi<ApiResponse<StockBalanceDetail[]>>(`/inventory/stock-balances?item_id=${itemId}`);
    return data.data;
  },

  getItems: async (search?: string, all?: boolean): Promise<InventoryItem[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (all) params.append('all', '1');
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchApi<ApiResponse<InventoryItem[]>>(`/inventory/items${queryString}`);
    return data.data;
  },

  getItem: async (itemId: number): Promise<InventoryItem> => {
    const data = await fetchApi<ApiResponse<InventoryItem>>(`/inventory/items/${itemId}`);
    return data.data;
  },

  createItem: async (payload: any): Promise<InventoryItem> => {
    const data = await fetchApi<ApiResponse<InventoryItem>>('/inventory/items', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data.data;
  },

  updateItem: async (id: number, payload: any): Promise<InventoryItem> => {
    const data = await fetchApi<ApiResponse<InventoryItem>>(`/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return data.data;
  },

  // --- UNITS ---
  getUnits: async (search?: string, isActive?: boolean): Promise<Unit[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (isActive !== undefined) params.append('is_active', isActive ? 'true' : 'false');
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchApi<ApiResponse<Unit[]>>(`/inventory/units${queryString}`);
    return data.data;
  },

  createUnit: async (payload: { name: string; symbol: string; is_active?: boolean }): Promise<Unit> => {
    const data = await fetchApi<ApiResponse<Unit>>('/inventory/units', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data.data;
  },

  updateUnit: async (id: number, payload: { name: string; symbol: string; is_active?: boolean }): Promise<Unit> => {
    const data = await fetchApi<ApiResponse<Unit>>(`/inventory/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return data.data;
  },

  getStockMoves: async (itemId: number, warehouseId?: number): Promise<any[]> => {
    const params = new URLSearchParams();
    params.append('item_id', itemId.toString());
    if (warehouseId) {
      params.append('warehouse_id', warehouseId.toString());
    }
    const data = await fetchApi<ApiResponse<any[]>>(`/inventory/stock-moves?${params.toString()}`);
    return data.data;
  },

  getWarehouseTransactions: async (warehouseId: number, page: number = 1): Promise<any> => {
    const params = new URLSearchParams({
      warehouse_id: warehouseId.toString(),
      page: page.toString()
    });
    const data = await fetchApi<any>(`/inventory/stock-transfers?${params.toString()}`);
    return data;
  },

  createMutation: async (payload: any): Promise<void> => {
    await fetchApi('/inventory/stock-transfers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPendingUsages: async (): Promise<any[]> => {
    const data = await fetchApi<ApiResponse<any[]>>('/inventory/stock-usages?posted_to_kas=false');
    return data.data;
  },

  postToKas: async (usageId: number, payload: { payment_method: string; date: string; account_id?: number }): Promise<void> => {
    await fetchApi(`/inventory/stock-usages/${usageId}/post-to-kas`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAccounts: async (): Promise<any[]> => {
    const data = await fetchApi<any[]>('/accounts');
    return data; // Backend returns array directly, not wrapped in {data: ...}
  },

  getProjects: async (): Promise<{ id: number; name: string }[]> => {
    const data = await fetchApi<any[]>('/projects?status=aktif'); // From ProjectController, it returns direct array
    return data;
  },

  createWarehouse: async (payload: any): Promise<void> => {
    await fetchApi('/inventory/warehouses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateWarehouse: async (id: number, payload: any): Promise<void> => {
    await fetchApi(`/inventory/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
