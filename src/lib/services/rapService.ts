import { fetchApi } from '@/lib/api';
import {
  RapCategory,
  RapSettingResponse,
  CreateRapCategoryPayload,
  UpdateRapCategoryPayload,
  CreateRapItemPayload,
  UpdateRapItemPayload,
} from '@/types/rap';

export const rapService = {
  // ─── Categories ─────────────────────────────────────────────────────────────

  async getCategories(projectId: string | number): Promise<RapCategory[]> {
    return fetchApi<RapCategory[]>(`/projects/${projectId}/rap-categories`, {
      method: 'GET',
    });
  },

  async generateFromRab(projectId: string | number): Promise<any> {
    return fetchApi(`/projects/${projectId}/rap/generate-from-rab`, {
      method: 'POST',
    });
  },

  async getLabaRugi(projectId: string | number): Promise<any> {
    return fetchApi(`/projects/${projectId}/laba-rugi`);
  },

  async createCategory(projectId: string | number, data: CreateRapCategoryPayload): Promise<RapCategory> {
    return fetchApi<RapCategory>(`/projects/${projectId}/rap-categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(categoryId: number, data: UpdateRapCategoryPayload): Promise<RapCategory> {
    return fetchApi<RapCategory>(`/rap-categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(categoryId: number): Promise<void> {
    return fetchApi<void>(`/rap-categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  // ─── Items ──────────────────────────────────────────────────────────────────

  async bulkCreateItems(categoryId: number, items: CreateRapItemPayload[]): Promise<any[]> {
    return fetchApi<any[]>(`/rap-categories/${categoryId}/items/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async bulkUpdateItems(
    categoryId: number,
    items: Array<{ id: number } & UpdateRapItemPayload>,
  ): Promise<any[]> {
    return fetchApi<any[]>(`/rap-categories/${categoryId}/items/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  async deleteItem(categoryId: number, itemId: number): Promise<void> {
    return fetchApi<void>(`/rap-categories/${categoryId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // ─── Setting (Potongan %) ────────────────────────────────────────────────────

  async getSetting(projectId: string | number): Promise<RapSettingResponse> {
    return fetchApi<RapSettingResponse>(`/projects/${projectId}/rap-setting`, {
      method: 'GET',
    });
  },

  async updateProjectSetting(projectId: string | number, pajakPercentage: number): Promise<any> {
    const res = await fetchApi(`/projects/${projectId}/rap-setting`, {
      method: 'PUT',
      body: JSON.stringify({ pajak_percentage: pajakPercentage }),
    });
    return res;
  },

  async getGlobalSetting(): Promise<{ pajak_percentage: number }> {
    return fetchApi('/rap-setting/global');
  },

  async updateGlobalSetting(pajakPercentage: number): Promise<any> {
    const res = await fetchApi('/rap-setting/global', {
      method: 'PUT',
      body: JSON.stringify({ pajak_percentage: pajakPercentage }),
    });
    return res;
  },

  // --- RAB Sync ---

  async syncNewItems(projectId: string | number): Promise<{ message: string; created_count: number }> {
    return fetchApi(`/projects/${projectId}/rap/sync-new-items`, { method: 'POST' });
  },

  async getUnsyncedNewItemsCount(projectId: string | number): Promise<{ count: number }> {
    return fetchApi(`/projects/${projectId}/rap/unsynced-rab-items-count`);
  },

  async getSyncStatus(projectId: string | number): Promise<Record<string, {
    status: 'synced' | 'rab_changed' | 'rab_removed';
    latest_rab?: { description: string; volume: number };
    snapshot?: { description: string; volume: number };
  }>> {
    return fetchApi(`/projects/${projectId}/rap/sync-status`);
  },

  async syncFromRab(rapItemId: number): Promise<{ message: string; item: any }> {
    return fetchApi(`/rap-items/${rapItemId}/sync-from-rab`, { method: 'POST' });
  },
};