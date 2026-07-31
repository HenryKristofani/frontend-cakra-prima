import { useState, useCallback } from 'react';
import { projectService } from '@/lib/services/projectService';
import { Project } from '@/types/transaction';

export function useProjects(initialData: Project[]) {
  const [data, setData] = useState<Project[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projects = await projectService.getProjects();
      setData(projects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProject = useCallback(async (payload: Omit<Project, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      await projectService.createProject(payload);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to add project');
      setIsLoading(false);
      throw err;
    }
  }, [fetchProjects]);

  const updateProject = useCallback(async (id: number, payload: Partial<Project>) => {
    setIsLoading(true);
    setError(null);
    try {
      await projectService.updateProject(id, payload);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
      setIsLoading(false);
      throw err;
    }
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await projectService.deleteProject(id);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
      setIsLoading(false);
      throw err;
    }
  }, [fetchProjects]);

  const bulkUpdateProjects = useCallback(async (changes: Record<number, Partial<Project>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = Object.entries(changes).map(([id, data]) => ({
        id: Number(id),
        ...data,
      }));
      await projectService.bulkUpdateProjects(payload);
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to save project changes');
      setIsLoading(false);
      throw err;
    }
  }, [fetchProjects]);

  return {
    projects: data,
    isLoading,
    error,
    addProject,
    updateProject,
    bulkUpdateProjects,
    deleteProject,
  };
}
