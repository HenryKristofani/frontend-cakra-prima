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

  async updateProjectSetting(projectId: string | number, potonganPercentage: number): Promise<any> {
    return fetchApi(`/projects/${projectId}/rap-setting`, {
      method: 'PUT',
      body: JSON.stringify({ potongan_percentage: potonganPercentage }),
    });
  },

  async getGlobalSetting(): Promise<{ potongan_percentage: number }> {
    return fetchApi(`/rap-setting/global`, { method: 'GET' });
  },

  async updateGlobalSetting(potonganPercentage: number): Promise<any> {
    return fetchApi(`/rap-setting/global`, {
      method: 'PUT',
      body: JSON.stringify({ potongan_percentage: potonganPercentage }),
    });
  },
};
