import { fetchApi } from "../api";

export interface FundSource {
  id: number;
  name: string;
  type: "HutangBank" | "ModalInvestor" | "ModalProjectLain" | "Lainnya";
  initial_amount: number;
  notes?: string;
  is_active: boolean;
  total_allocated: number;
  remaining_unallocated: number;
  created_at: string;
  updated_at: string;
}

export interface FundSourceBreakdownItem {
  project_id: number;
  project_name: string;
  current_amount: number;
  percentage: number;
}

export interface FundSourceBreakdown {
  fund_source: FundSource;
  breakdown: FundSourceBreakdownItem[];
}

export interface FundSourceSummaryBreakdownItem {
  fund_source_id: number;
  fund_source_name: string;
  fund_source_type: string;
  initial_amount: number;
  total_allocated: number;
  percentage_of_kas: number;
}

export interface FundSourceSummary {
  total_saldo_kas: number;
  total_from_fund_sources: number;
  untracked_amount: number;
  percentage_tracked: number;
  breakdown: FundSourceSummaryBreakdownItem[];
}

export const fundSourceService = {
  getFundSources: async (): Promise<FundSource[]> => {
    return fetchApi("/fund-sources");
  },
  
  getFundSourceBreakdown: async (id: string | number): Promise<FundSourceBreakdown> => {
    return fetchApi(`/fund-sources/${id}/breakdown`);
  },
  
  createFundSource: async (data: Partial<FundSource>): Promise<{ message: string, data: FundSource }> => {
    return fetchApi("/fund-sources", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateFundSource: async (id: number, data: Partial<FundSource>): Promise<{ message: string, data: FundSource }> => {
    return fetchApi(`/fund-sources/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getSummaryByFundSource: async (): Promise<FundSourceSummary> => {
    return fetchApi("/transactions-summary/by-fund-source");
  },

  getProjectKasBreakdownByFundSource: async (projectId: number | string, totalSaldoKas?: number): Promise<FundSourceSummary> => {
    const params = totalSaldoKas !== undefined ? `?total_saldo_kas=${totalSaldoKas}` : "";
    return fetchApi(`/projects/${projectId}/kas-breakdown-by-fund-source${params}`);
  },
};
