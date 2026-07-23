export interface DebtItem {
  id: number;
  debt_group_id: number;
  no: number | null;
  description: string;
  trans_date: string | null;
  amount: number;
}

export interface DebtPayment {
  id: number;
  debt_group_id: number;
  description: string;
  payment_date: string | null;
  amount: number;
}

export interface DebtGroup {
  id: number;
  name: string;
  total_amount: number;
  remaining_amount: number;
  items_count?: number;
  payments_count?: number;
  items?: DebtItem[];
  payments?: DebtPayment[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedDebtGroupResponse {
  current_page: number;
  data: DebtGroup[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
