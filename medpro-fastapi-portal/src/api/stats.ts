import request from '../lib/request';

export interface PlatformStats {
  experimentCount: number;
  courseCount: number;
  userCount: number;
  totalDuration: number;
}

export function getPlatformStats(tenantId?: number | null): Promise<PlatformStats> {
  return request.get('/simhub/portal/stats', { params: tenantId != null ? { tenantId } : undefined }).then((res: any) => res.data.data ?? {
    experimentCount: 0,
    courseCount: 0,
    userCount: 0,
    totalDuration: 0,
  });
}
