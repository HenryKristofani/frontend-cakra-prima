export interface Project {
  id: number;
  name: string;
  status: "aktif" | "nonaktif";
}

export interface Account {
  id: number;
  name: string;
  type: string;
  initial_balance: number;
  current_balance?: number;
}

export interface Transaction {
  id: number;
  date: string;
  account_id?: number | null;
  project_id?: number | null;
  user_id?: number | null;
  company?: string | null;
  description: string;
  payment_method: 'cash' | 'rek';
  income: number;
  expense: number;
  rekap_saldo?: number;
  account?: Account | null;
  project?: Project | null;
  user?: { id: number; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionSummary {
  total_saldo_kas: number;
  pemasukan_bulan_ini: number;
  pengeluaran_bulan_ini: number;
  total_saldo_cash: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TransactionFilters {
  page?: number;
  month?: string | number;
  year?: string | number;
  project_id?: number | string;
}
