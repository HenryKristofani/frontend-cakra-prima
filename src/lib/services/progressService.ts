import { fetchApi } from '@/lib/api';

export interface ProgressDetailItem {
  id: number;
  description: string;
  total_price: number;
  bobot_percentage: number;
  latest_percentage_complete: number;
  weighted_contribution: number;
  last_report_date: string | null;
}

export interface ProgressDetailCategory {
  id: number;
  name: string;
  code: string | null;
  items: ProgressDetailItem[];
  children: ProgressDetailCategory[];
}

export interface ProgressDetailResponse {
  date: string;
  total_rab_aktif: number;
  categories: ProgressDetailCategory[];
}

export interface ProgressReportHistory {
  id: number;
  rab_item_id: number;
  report_date: string;
  percentage_complete: number;
  notes: string | null;
  created_at: string;
}

export const progressService = {
  async getProgressDetail(projectId: string | number, date?: string): Promise<ProgressDetailResponse> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    return fetchApi<ProgressDetailResponse>(`/projects/${projectId}/progress-detail${queryString}`, {
      method: 'GET',
    });
  },

  async getItemHistory(itemId: string | number): Promise<{ data: ProgressReportHistory[] }> {
    return fetchApi<{ data: ProgressReportHistory[] }>(`/rab-items/${itemId}/progress-reports`, {
      method: 'GET',
    });
  }
};
