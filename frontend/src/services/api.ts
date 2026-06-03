import axios from 'axios';
import type {
  SynthesisTask,
  Dataset,
  PretrainedModel,
  GenerateRequest,
  DashboardStats,
  TrendData,
  ModalityDistribution,
  QualityTrend,
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
};

// Synthesis
export const synthesisApi = {
  generate: async (request: GenerateRequest): Promise<SynthesisTask> => {
    const response = await api.post('/synthesis/generate', request);
    return response.data;
  },
  getTasks: async (params?: {
    modality?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<SynthesisTask[]> => {
    const response = await api.get('/synthesis/tasks', { params });
    return response.data;
  },
  getTask: async (id: string): Promise<SynthesisTask> => {
    const response = await api.get(`/synthesis/tasks/${id}`);
    return response.data;
  },
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/synthesis/tasks/${id}`);
  },
};

// Datasets
export const datasetsApi = {
  list: async (params?: { modality?: string }): Promise<Dataset[]> => {
    const response = await api.get('/datasets', { params });
    return response.data;
  },
  get: async (id: string): Promise<Dataset> => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },
  create: async (data: Partial<Dataset>): Promise<Dataset> => {
    const response = await api.post('/datasets', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Dataset>): Promise<Dataset> => {
    const response = await api.put(`/datasets/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/datasets/${id}`);
  },
};

// Models
export const modelsApi = {
  list: async (params?: {
    modality?: string;
    status?: string;
  }): Promise<PretrainedModel[]> => {
    const response = await api.get('/models', { params });
    return response.data;
  },
  get: async (id: string): Promise<PretrainedModel> => {
    const response = await api.get(`/models/${id}`);
    return response.data;
  },
};

// Quality
export const qualityApi = {
  evaluate: async (data: {
    real_images: number;
    generated_images: number;
    modality: string;
  }) => {
    const response = await api.post('/quality/evaluate', data);
    return response.data;
  },
  compare: async (modelIds: string[]) => {
    const response = await api.post('/quality/compare', { model_ids: modelIds });
    return response.data;
  },
  getTrends: async (): Promise<QualityTrend[]> => {
    const response = await api.get('/quality/trends');
    return response.data;
  },
};

// Dashboard
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getSynthesisTrend: async (): Promise<TrendData[]> => {
    const response = await api.get('/dashboard/synthesis-trend');
    return response.data;
  },
  getModalityDistribution: async (): Promise<ModalityDistribution[]> => {
    const response = await api.get('/dashboard/modality-distribution');
    return response.data;
  },
  getQualityDistribution: async (): Promise<{ range: string; count: number }[]> => {
    const response = await api.get('/dashboard/quality-distribution');
    return response.data;
  },
  getRecentTasks: async (limit?: number): Promise<SynthesisTask[]> => {
    const response = await api.get('/dashboard/recent-tasks', {
      params: { limit },
    });
    return response.data;
  },
};

export default api;
