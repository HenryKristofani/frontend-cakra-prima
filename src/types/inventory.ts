export interface Unit {
  id: number;
  name: string;
  symbol: string;
  is_active: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku?: string | null;
  unit_id: number;
  unit?: Unit;
  category?: string | null;
  is_active?: boolean;
}

export interface ItemRequest {
  name: string;
  sku?: string;
  unit_id: number;
  category?: string;
  is_active?: boolean;
}

export interface Warehouse {
  id: number;
  name: string;
  type: 'main' | 'project';
  project_id: number | null;
  location?: string | null;
  is_active?: boolean;
  project?: {
    id: number;
    name: string;
  };
}

export interface WarehouseRequest {
  name: string;
  type: 'main' | 'project';
  project_id?: number | null;
  location?: string;
  is_active?: boolean;
}

export interface StockBalanceAggregate {
  item_id: number;
  item_name: string;
  item_unit: string;
  total_qty: number;
  location_count: number;
}

export interface StockBalanceDetail {
  id: number;
  warehouse_id: number;
  item_id: number;
  quantity_on_hand: string | number; // sometimes Laravel decimals come as string
  updated_at: string;
  warehouse?: Warehouse;
  item?: InventoryItem;
}

// Just wrapping response structure
export interface ApiResponse<T> {
  data: T;
}

export interface StockTransferRequest {
  type: 'in' | 'transfer' | 'usage';
  source_warehouse_id?: number | null;
  destination_warehouse_id?: number | null;
  warehouse_id?: number | null;  // For usage (type=usage), backend expects this field
  source_type?: 'purchase' | 'warehouse';
  notes?: string;
  items: {
    item_id: number;
    quantity: number;
    unit_price?: number;
    usage_note?: string;
  }[];
}

export interface StockUsage {
  id: number;
  stock_transfer_line_id: number;
  warehouse_id: number;
  item_id: number;
  quantity: string | number;
  usage_note: string | null;
  posted_to_kas: boolean;
  kas_transaction_id: number | null;
  used_at: string;
  item?: any;
  warehouse?: Warehouse & {
    project?: {
      id: number;
      name: string;
      is_isolated_cash: boolean;
    };
  };
  stock_transfer_line?: {
    id: number;
    stock_transfer_id: number;
    item_id: number;
    quantity: string | number;
    unit_price: string | number;
    total_price: string | number;
    stock_transfer?: {
      id: number;
      reference_number: string;
      type: string;
      created_at: string;
    }
  };
}

export interface Account {
  id: number;
  name: string;
  code?: string;
  type?: string;
  current_balance?: number;
}

export interface StockMove {
  // Backend returns a flattened/transformed response from InventoryQueryController::stockMoves()
  date: string;             // ISO 8601, mapped from stock_transfer.created_at
  type: 'in' | 'transfer' | 'usage';
  reference_number: string;
  source_warehouse: string | null;       // plain string name, not an object
  destination_warehouse: string | null;  // plain string name, not an object
  item_name: string | null;
  item_unit: string | null;
  quantity: number;
  unit_price: number;
}

export interface StockTransferLine {
  id: number;
  stock_transfer_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  item_unit?: string;
  item?: {
    id: number;
    name: string;
    unit_id: number;
    unit?: Unit;
  };
}

export interface StockTransferDocument {
  id: number;
  type: 'in' | 'transfer' | 'usage';
  reference_number: string;
  source_warehouse_id: number | null;
  destination_warehouse_id: number | null;
  created_at: string;
  source_warehouse?: { id: number; name: string; type: string };
  destination_warehouse?: { id: number; name: string; type: string };
  lines: StockTransferLine[];
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}
