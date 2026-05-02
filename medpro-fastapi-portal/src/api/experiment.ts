import request from '../lib/request';

export interface ExperimentCategory {
  categoryId: number;
  categoryName: string;
  parentId: number | null;
  icon: string | null;
  sortOrder: number;
  status: string;
  children?: ExperimentCategory[];
}

export interface Experiment {
  expId: number;
  expName: string;
  categoryId: number | null;
  categoryName: string | null;
  simSystemId: number | null;
  expType: 'web' | 'exe' | null;
  launchUrl: string | null;
  coverImage: string | null;
  description: string | null;
  expDuration: number | null;
  expGuide: string | null;
  envRequirements: string | null;
  softwareRequirements: string | null;
  attachments: string | null;
  tags: string | null;
  status: '0' | '1' | null;
  viewCount: number | null;
  participateCount: number | null;
  sortOrder: number | null;
  createTime: string | null;
}

export interface ExperimentListQuery {
  pageNum?: number;
  pageSize?: number;
  expName?: string;
  categoryId?: number;
  expType?: string;
  status?: string;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export function getExperimentCategories(): Promise<ExperimentCategory[]> {
  return request.get('/simhub/portal/experiment/categories').then((res: any) => res.data.data ?? []);
}

export function getExperimentList(params?: ExperimentListQuery): Promise<PageResult<Experiment>> {
  return request.get('/simhub/portal/experiment', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function getExperimentDetail(expId: number): Promise<Experiment> {
  return request.get(`/simhub/portal/experiment/${expId}`).then((res: any) => res.data.data);
}

export function participateExperiment(expId: number): Promise<void> {
  return request.post(`/simhub/portal/experiment/${expId}/participate`);
}
