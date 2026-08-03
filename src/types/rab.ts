// ─── Response shapes from GET /projects/{id}/rab-summary ────────────────────

export interface RabItem {
  id: number;
  category_id: number;
  description: string;
  volume: number;
  unit: string;
  unit_price: number;
  total_price: number;
  bobot_percentage: number;
  latest_progress_percentage: number;
  total_percentage: number;
  status: 'aktif' | 'dikurangi';
}

export interface RabCategory {
  id: number;
  code: string;
  name: string;
  total_bobot_percentage: number;
  total_progress_percentage: number;
  items: RabItem[];
  children: RabCategory[];
}

export interface RabDeduction {
  description: string;
  volume: number;
  unit: string;
  unit_price: number;
  total_price: number;
  status: string;
}

export interface RabSummary {
  total_rab_aktif: number;
  total_deduction: number;
  final_total: number;
  rounded_total: number;
  overall_progress_percentage: number;
  categories: RabCategory[];
  deductions: RabDeduction[];
}

// ─── Form payload types ──────────────────────────────────────────────────────

export interface CreateCategoryPayload {
  code?: string;
  name: string;
  parent_id?: number | null;
  sort_order?: number;
}

export interface UpdateCategoryPayload {
  code?: string;
  name?: string;
}

export interface CreateItemPayload {
  description: string;
  volume: number;
  unit: string;
  unit_price: number;
  status: 'aktif' | 'dikurangi';
}

export interface UpdateItemPayload {
  description?: string;
  volume?: number;
  unit?: string;
  unit_price?: number;
  status?: 'aktif' | 'dikurangi';
}

export interface CreateProgressReportPayload {
  report_date: string;
  percentage_complete: number;
  notes?: string;
}
