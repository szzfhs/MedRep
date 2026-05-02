import request from '../lib/request';

export type HwSupport = 'helmet' | 'pc' | 'zspace' | 'webgl';

export interface SimSystem {
  simSystemId: number;
  systemName: string;
  systemDetail: string | null;
  coverImage: string | null;
  hwRecommend: string | null;
  hwSupport: string | null; // comma-separated: "pc,zspace"
  sysCategory: string | null;
  viewCount: number;
  status: '0' | '1';
  createTime: string | null;
  images: string[];   // image URLs from portal service
  expCount: number;   // related experiment count
}

export interface SimSystemListQuery {
  pageNum?: number;
  pageSize?: number;
  systemName?: string;
  sysCategory?: string;
  hwSupport?: string;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export function getSimSystemList(params?: SimSystemListQuery): Promise<PageResult<SimSystem>> {
  return request.get('/simhub/portal/sim-system', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function getSimSystemDetail(simSystemId: number): Promise<SimSystem> {
  return request.get(`/simhub/portal/sim-system/${simSystemId}`).then((res: any) => res.data.data);
}
