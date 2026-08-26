import { fetchApi } from '@/lib/api';

export interface ImportPreviewRow {
  row: number;
  is_valid: boolean;
  errors: string[];
  data: {
    date?: string;
    description?: string;
    payment_method?: string;
    income?: number;
    expense?: number;
    account_id?: number | null;
    project_id?: number | null;
    rap_item_id?: number | null;
    company?: string | null;
    _is_isolated?: boolean;
  };
  raw: {
    tanggal: string;
    akun: string;
    project: string;
    item_rap: string;
    deskripsi: string;
    perusahaan_pihak: string | null;
    metode: string;
    pemasukan: number;
    pengeluaran: number;
  };
}

export interface ImportPreviewResponse {
  rows: ImportPreviewRow[];
  total_rows: number;
  valid_count: number;
  error_count: number;
}

export interface ImportConfirmResponse {
  message: string;
  imported_count: number;
}

export const transactionImportService = {
  async downloadTemplate(): Promise<void> {
    const response = await fetchApi<Response>('/transactions/import/template', {
      method: 'GET',
      responseType: 'response',
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-kas.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async preview(
    file: File, 
    options?: {
      format: 'new' | 'legacy';
      project_id?: number | string;
      cash_account_id?: number | string;
      rek_account_id?: number | string;
    }
  ): Promise<ImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      if (options.format) formData.append('format', options.format);
      if (options.project_id) formData.append('project_id', String(options.project_id));
      if (options.cash_account_id) formData.append('cash_account_id', String(options.cash_account_id));
      if (options.rek_account_id) formData.append('rek_account_id', String(options.rek_account_id));
    }

    const response = await fetchApi<Response>('/transactions/import/preview', {
      method: 'POST',
      body: formData,
      responseType: 'response',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || 'Gagal memproses file');
    }
    return response.json();
  },

  async confirm(rows: ImportPreviewRow['data'][]): Promise<ImportConfirmResponse> {
    return fetchApi<ImportConfirmResponse>('/transactions/import/confirm', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
  },
};
