// ─── Response shapes from RAP endpoints ──────────────────────────────────────

export interface RapItem {
  id: number;
  category_id: number;
  description: string;
  volume: number;
  unit: string;
  unit_price: string | number;         // Serialized as string from backend to prevent JS float loss
  effective_unit_price: string | number; // Setelah potongan%
  total_price: string | number;          // volume × effective_unit_price (bcmath precision)
  total_realisasi: number;               // SUM(transactions.expense)
  selisih_laba_rugi: string | number;    // total_price - total_realisasi
  pajak_percentage: number;
  sort_order: number;
  source_rab_item_id?: number | null;
  source_rab_item?: {
    id: number;
    description: string;
    unit_price: string | number;  // String from backend
  };
}

export interface RapCategory {
  id: number;
  project_id: number;
  parent_id: number | null;
  code: string | null;
  name: string;
  sort_order: number;
  items: RapItem[];
  children: RapCategory[];
}

export interface RapSetting {
  id?: number;
  project_id: number | null;
  pajak_percentage: number;
}

export interface RapSettingResponse {
  project_setting: RapSetting | null;
  global_setting: RapSetting | null;
  effective_pajak_percentage: number;
}

// ─── Form payload types ──────────────────────────────────────────────────────

export interface CreateRapCategoryPayload {
  code?: string;
  name: string;
  parent_id?: number | null;
  sort_order?: number;
}

export interface LabaRugiItem {
  id: number;
  description: string;
  total_price: number;
  total_realisasi: number;
  selisih_laba_rugi: number;
  status_label: 'untung' | 'rugi' | 'impas';
}

export interface LabaRugiSummary {
  total_rencana: number;
  total_realisasi: number;
  total_selisih: number;
  status_label: 'untung' | 'rugi' | 'impas';
  pajak_percentage: number;
}

export interface LabaRugiResponse {
  items: LabaRugiItem[];
  summary: LabaRugiSummary;
}

export interface UpdateRapCategoryPayload {
  code?: string;
  name?: string;
  sort_order?: number;
}

export interface CreateRapItemPayload {
  description: string;
  volume: number;
  unit: string;
  unit_price: number | string;  // String to preserve full decimal precision
  sort_order?: number;
}

export interface UpdateRapItemPayload {
  description?: string;
  volume?: number;
  unit?: string;
  unit_price?: number | string;  // String to preserve full decimal precision
  sort_order?: number;
}
