import { fetchApi } from '@/lib/api';

interface UploadResponse {
  file_path: string;
  sheets: string[];
}

interface PreviewResponse {
  preview_rows: (string | number | null)[][];
}

interface ProcessPayload {
  file_path: string;
  sheet: string;
  mapping: Record<string, number>;
  start_row: number;
  force?: boolean; // override duplicate check
}

interface ProcessResponse {
  batch_id: string;
  message: string;
}

interface BatchStatus {
  id: string;
  total_jobs: number;
  pending_jobs: number;
  processed_jobs: number;
  progress: number;
  finished: boolean;
  cancelled: boolean;
  has_failures: boolean;
  failure_detail?: string | null;
}

export const rabImportService = {
  async upload(projectId: number | string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<UploadResponse>(`/projects/${projectId}/rab/import/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  async preview(projectId: number | string, filePath: string, sheet: string): Promise<PreviewResponse> {
    return fetchApi<PreviewResponse>(`/projects/${projectId}/rab/import/preview`, {
      method: 'POST',
      body: JSON.stringify({ file_path: filePath, sheet }),
    });
  },

  async process(projectId: number | string, payload: ProcessPayload): Promise<ProcessResponse> {
    return fetchApi<ProcessResponse>(`/projects/${projectId}/rab/import/process`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async status(projectId: number | string, batchId: string): Promise<BatchStatus> {
    return fetchApi<BatchStatus>(`/projects/${projectId}/rab/import/status/${batchId}`);
  },
};
