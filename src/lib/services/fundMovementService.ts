import { fetchApi } from "../api";

export interface FundMovement {
  id: number;
  fund_source_id: number;
  type: "InitialAllocation" | "Transfer" | "Withdrawal";
  source_project_id?: number | null;
  destination_project_id?: number | null;
  amount: number;
  reference_number: string;
  notes?: string;
  created_by: number;
  created_at: string;
  reversal_of_id?: number | null;
  fund_source?: { id: number; name: string };
  source_project?: { id: number; name: string } | null;
  destination_project?: { id: number; name: string } | null;
}

export const fundMovementService = {
  getFundMovements: async (params?: { fund_source_id?: number, project_id?: number }): Promise<FundMovement[]> => {
    const query = new URLSearchParams();
    if (params?.fund_source_id) query.append("fund_source_id", params.fund_source_id.toString());
    if (params?.project_id) query.append("project_id", params.project_id.toString());
    
    const queryString = query.toString();
    const url = queryString ? `/fund-movements?${queryString}` : "/fund-movements";
    return fetchApi(url);
  },

  createFundMovement: async (data: Record<string, unknown>): Promise<{ message: string; data: FundMovement }> => {
    return fetchApi("/fund-movements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  reverseMovement: async (id: number): Promise<{ message: string; data: FundMovement }> => {
    return fetchApi(`/fund-movements/${id}/reverse`, {
      method: "POST",
    });
  },
};
