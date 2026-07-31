import { fetchApi } from '@/lib/api';
import { Project } from '@/types/transaction';

export const projectService = {
  /**
   * Fetch a list of all projects, optionally filtered by status.
   */
  async getProjects(status?: 'aktif' | 'nonaktif'): Promise<Project[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    
    return fetchApi<Project[]>('/projects', {
      method: 'GET',
      params,
    });
  },

  /**
   * Fetch a single project by ID.
   */
  async getProjectById(id: number | string): Promise<Project> {
    return fetchApi<Project>(`/projects/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new project.
   */
  async createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    return fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing project.
   */
  async updateProject(id: number, data: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project> {
    return fetchApi<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async bulkUpdateProjects(changes: Array<Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>> & { id: number }>): Promise<Project[]> {
    return fetchApi<Project[]>('/projects/bulk', {
      method: 'PUT',
      body: JSON.stringify({ projects: changes }),
    });
  },

  /**
   * Delete a project.
   */
  async deleteProject(id: number): Promise<void> {
    return fetchApi<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
};
