import { fetchApi } from '@/lib/api';
import {
  RabSummary,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateItemPayload,
  UpdateItemPayload,
  CreateProgressReportPayload,
} from '@/types/rab';

export const rabService = {
  // ─── Summary ────────────────────────────────────────────────────────────────

  async getRabSummary(projectId: string | number): Promise<RabSummary> {
    return fetchApi<RabSummary>(`/projects/${projectId}/rab-summary`, {
      method: 'GET',
    });
  },

  // ─── Categories ─────────────────────────────────────────────────────────────

  async createCategory(projectId: string | number, data: CreateCategoryPayload): Promise<any> {
    return fetchApi(`/projects/${projectId}/rab-categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(categoryId: number, data: UpdateCategoryPayload): Promise<any> {
    return fetchApi(`/rab-categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(categoryId: number): Promise<void> {
    return fetchApi<void>(`/rab-categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  // ─── Items ──────────────────────────────────────────────────────────────────

  async createItem(categoryId: number, data: CreateItemPayload): Promise<any> {
    return fetchApi(`/rab-categories/${categoryId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateItem(categoryId: number, itemId: number, data: UpdateItemPayload): Promise<any> {
    return fetchApi(`/rab-categories/${categoryId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteItem(categoryId: number, itemId: number): Promise<void> {
    return fetchApi<void>(`/rab-categories/${categoryId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async bulkCreateItems(categoryId: number, items: CreateItemPayload[]): Promise<any[]> {
    return fetchApi<any[]>(`/rab-categories/${categoryId}/items/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async bulkUpdateItems(
    categoryId: number,
    items: Array<{ id: number } & UpdateItemPayload>,
  ): Promise<any[]> {
    return fetchApi<any[]>(`/rab-categories/${categoryId}/items/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  // ─── Progress Reports ────────────────────────────────────────────────────────

  async createProgressReport(
    categoryId: number,
    itemId: number,
    data: CreateProgressReportPayload,
  ): Promise<any> {
    return fetchApi(`/rab-categories/${categoryId}/items/${itemId}/progress-reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async exportRabExcel(projectId: string | number): Promise<void> {
    const response = await fetchApi<Response>(`/projects/${projectId}/rab-export`, {
      method: 'GET',
      responseType: 'response',
    });
    
    // Convert to blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Try to get filename from content-disposition header if available, else fallback
    const disposition = response.headers.get('content-disposition');
    let filename = `RAB-Project-${projectId}.xlsx`;
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
