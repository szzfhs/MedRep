import request from '../lib/request';

export interface ResourceCategory {
  categoryId: number;
  categoryName: string;
  parentId: number | null;
  sortOrder: number;
  status: string;
  children?: ResourceCategory[];
}

export interface Resource {
  resourceId: number;
  resourceName: string;
  resourceContent: string | null;
  fileFormat: string | null;
  resourceType: 'courseware' | 'lesson_plan' | 'micro_video' | 'ebook' | 'extension' | null;
  fileUrl: string | null;
  coverImage: string | null;
  description: string | null;
  fileSize: number | null;
  duration: number | null;
  categoryId: number | null;
  allowDownload: string | null;
  downloadCount: number | null;
  viewCount: number | null;
  status: '0' | '1' | null;
  createTime: string | null;
}

export interface ResourceListQuery {
  pageNum?: number;
  pageSize?: number;
  resourceName?: string;
  resourceType?: string;
  categoryId?: number;
  status?: string;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export function getResourceCategories(): Promise<ResourceCategory[]> {
  return request.get('/simhub/portal/resource/categories').then((res: any) => res.data.data ?? []);
}

export function getResourceList(params?: ResourceListQuery): Promise<PageResult<Resource>> {
  return request.get('/simhub/portal/resource', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function getResourceDetail(resourceId: number): Promise<Resource> {
  return request.get(`/simhub/portal/resource/${resourceId}`).then((res: any) => res.data.data);
}
