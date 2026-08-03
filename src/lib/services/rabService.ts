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
};
