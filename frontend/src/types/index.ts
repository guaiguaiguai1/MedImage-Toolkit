export interface SynthesisTask {
  id: string;
  prompt: string;
  modality: 'CT' | 'MRI' | 'X-Ray';
  condition_type: string | null;
  steps: number;
  guidance_scale: number;
  image_width: number;
  image_height: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result_path: string | null;
  fid_score: number | null;
  ssim_score: number | null;
  psnr_score: number | null;
  generation_time: number | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface Dataset {
  id: string;
  name: string;
  modality: 'CT' | 'MRI' | 'X-Ray';
  image_count: number;
  description: string | null;
  source: string | null;
  file_size_mb: number;
  created_at: string | null;
}

export interface PretrainedModel {
  id: string;
  name: string;
  modality: 'CT' | 'MRI' | 'X-Ray';
  version: string;
  description: string | null;
  fid_score: number | null;
  download_url: string | null;
  download_size_mb: number;
  status: 'ready' | 'training' | 'downloading' | 'error';
  created_at: string | null;
}

export interface GenerateRequest {
  prompt: string;
  modality: 'CT' | 'MRI' | 'X-Ray';
  condition_type?: string | null;
  steps: number;
  guidance_scale: number;
  image_width: number;
  image_height: number;
}

export interface DashboardStats {
  total_synthesized: number;
  completed_tasks: number;
  active_models: number;
  total_datasets: number;
  avg_fid_score: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface ModalityDistribution {
  modality: string;
  count: number;
}

export interface QualityTrend {
  date: string;
  avg_fid: number;
  avg_ssim: number;
  avg_psnr: number;
  task_count: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
}
