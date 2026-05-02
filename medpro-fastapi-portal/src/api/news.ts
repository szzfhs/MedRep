import request from '../lib/request';

export interface News {
  newsId: number;
  title: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  author: string | null;
  status: '0' | '1' | null;
  viewCount: number | null;
  publishTime: string | null;
  createTime: string | null;
}

export interface NewsListQuery {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  status?: string;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export function getNewsList(params?: NewsListQuery): Promise<PageResult<News>> {
  return request.get('/simhub/portal/news', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function getNewsDetail(newsId: number): Promise<News> {
  return request.get(`/simhub/portal/news/${newsId}`).then((res: any) => res.data.data);
}
