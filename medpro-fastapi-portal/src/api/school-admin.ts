/**
 * school-admin.ts
 * 校级管理员（simhub_admin）专用 API 封装层。
 * 所有请求通过 request.ts 拦截器自动携带 Bearer token。
 * 后端根据 token 中的 tenant_id 自动隔离本校数据，前端无需额外传参。
 */
import request from '@/lib/request';

// ─────────────────────────────────────────────
// 通用分页结果
// ─────────────────────────────────────────────
export interface PageResult<T> {
  rows: T[];
  total: number;
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
export interface VisitTrendItem {
  name: string;
  visits: number;
  experiments: number;
}

export interface UserTypeStat {
  name: string;
  value: number;
  color: string;
}

export interface SchoolDashboard {
  userCount: number;
  experimentCount: number;
  courseCount: number;
  resourceCount: number;
  userGrowth: string;
  experimentGrowth: string;
  courseGrowth: string;
  resourceGrowth: string;
  visitTrend: VisitTrendItem[];
  userTypeStats: UserTypeStat[];
}

export function getSchoolDashboard(): Promise<SchoolDashboard> {
  return request.get('/simhub/school/dashboard').then((res: any) => res.data.data);
}

// ─────────────────────────────────────────────
// 用户管理
// ─────────────────────────────────────────────
export interface SchoolUser {
  userId: number;
  userName: string;
  nickName: string;
  email?: string;
  phonenumber?: string;
  deptName?: string;
  status: '0' | '1';
  createTime: string;
  roles: string[];
}

export interface UserListQuery {
  pageNum?: number;
  pageSize?: number;
  userName?: string;
  nickName?: string;
  phonenumber?: string;
  status?: string;
  roleKey?: string;  // student / teacher
}

export interface CreateUserParams {
  userName: string;
  nickName: string;
  password: string;
  email?: string;
  phonenumber?: string;
  deptId?: number;
  roleIds?: number[];
}

export interface UpdateUserParams extends Partial<CreateUserParams> {
  userId: number;
  status?: '0' | '1';
}

export function getSchoolUsers(params?: UserListQuery): Promise<PageResult<SchoolUser>> {
  return request.get('/simhub/school/users', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function createSchoolUser(data: CreateUserParams): Promise<void> {
  return request.post('/simhub/school/users', data);
}

export function updateSchoolUser(data: UpdateUserParams): Promise<void> {
  return request.put('/simhub/school/users', data);
}

export function deleteSchoolUsers(userIds: number[]): Promise<void> {
  return request.delete(`/simhub/school/users/${userIds.join(',')}`);
}

// ─────────────────────────────────────────────
// 课程管理（含平台授权课程 + 本校课程）
// ─────────────────────────────────────────────
export interface AdminCourse {
  courseId: number;
  courseName: string;
  subtitle: string | null;
  teacherName: string | null;
  department: string | null;
  coverImage: string | null;
  description: string | null;
  courseCategory: string | null;
  totalSections: number | null;
  totalHours: number | null;
  status: '0' | '1' | '2' | null;
  enrollCount: number | null;
  publishDate: string | null;
  createTime: string | null;
  sourceType: 'platform' | 'tenant' | null;
}

export interface CourseListQuery {
  pageNum?: number;
  pageSize?: number;
  courseName?: string;
  courseCategory?: string;
  status?: string;
  tenantScope?: 'mine' | 'all';  // mine=本校(含授权), all=全部
}

export interface SaveCourseParams {
  courseId?: number;
  courseName?: string;
  subtitle?: string;
  teacherName?: string;
  department?: string;
  courseCategory?: string;
  totalHours?: number;
  totalSections?: number;
  description?: string;
  status?: '0' | '1' | '2';
}

export function getAdminCourseList(params?: CourseListQuery): Promise<PageResult<AdminCourse>> {
  return request.get('/simhub/course/list', { params: { ...params, tenantScope: params?.tenantScope ?? 'mine' } })
    .then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function createCourse(data: SaveCourseParams): Promise<void> {
  return request.post('/simhub/course', data);
}

export function updateCourse(data: SaveCourseParams & { courseId: number }): Promise<void> {
  return request.put('/simhub/course', data);
}

export function deleteCourse(courseId: number): Promise<void> {
  return request.delete(`/simhub/course/${courseId}`);
}

// ─────────────────────────────────────────────
// 实验管理
// ─────────────────────────────────────────────
export interface AdminExperiment {
  expId: number;
  expName: string;
  categoryId: number | null;
  categoryName: string | null;
  expType: 'web' | 'exe' | null;
  coverImage: string | null;
  description: string | null;
  expDuration: number | null;
  tags: string | null;
  status: '0' | '1' | null;
  participateCount: number | null;
  createTime: string | null;
  sourceType: 'platform' | 'tenant' | null;
}

export interface ExperimentListQuery {
  pageNum?: number;
  pageSize?: number;
  expName?: string;
  categoryId?: number;
  expType?: string;
  status?: string;
  tenantScope?: 'mine' | 'all';
}

export interface SaveExperimentParams {
  expId?: number;
  expName?: string;
  categoryId?: number;
  expType?: string;
  expDuration?: number;
  description?: string;
  tags?: string;
  status?: '0' | '1';
}

export function getAdminExperimentList(params?: ExperimentListQuery): Promise<PageResult<AdminExperiment>> {
  return request.get('/simhub/experiment/list', { params: { ...params, tenantScope: params?.tenantScope ?? 'mine' } })
    .then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function createExperiment(data: SaveExperimentParams): Promise<void> {
  return request.post('/simhub/experiment', data);
}

export function updateExperiment(data: SaveExperimentParams & { expId: number }): Promise<void> {
  return request.put('/simhub/experiment', data);
}

export function deleteExperiment(expId: number): Promise<void> {
  return request.delete(`/simhub/experiment/${expId}`);
}

// ─────────────────────────────────────────────
// 资源管理
// ─────────────────────────────────────────────
export interface AdminResource {
  resourceId: number;
  resourceName: string;
  resourceType: string | null;
  fileFormat: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  description: string | null;
  categoryId: number | null;
  allowDownload: string | null;
  downloadCount: number | null;
  viewCount: number | null;
  status: '0' | '1' | null;
  createTime: string | null;
  sourceType: 'platform' | 'tenant' | null;
}

export interface ResourceListQuery {
  pageNum?: number;
  pageSize?: number;
  resourceName?: string;
  resourceType?: string;
  categoryId?: number;
  status?: string;
  tenantScope?: 'mine' | 'all';
}

export interface SaveResourceParams {
  resourceId?: number;
  resourceName: string;
  resourceType?: string;
  fileFormat?: string;
  fileUrl?: string;
  fileSize?: number;
  description?: string;
  categoryId?: number;
  allowDownload?: string;
  status?: '0' | '1';
}

export function getAdminResourceList(params?: ResourceListQuery): Promise<PageResult<AdminResource>> {
  return request.get('/simhub/resource/list', { params: { ...params, tenantScope: params?.tenantScope ?? 'mine' } })
    .then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function createResource(data: SaveResourceParams): Promise<void> {
  return request.post('/simhub/resource', data);
}

export function updateResource(data: SaveResourceParams & { resourceId: number }): Promise<void> {
  return request.put('/simhub/resource', data);
}

export function deleteResource(resourceId: number): Promise<void> {
  return request.delete(`/simhub/resource/${resourceId}`);
}

// ─────────────────────────────────────────────
// 新闻管理
// ─────────────────────────────────────────────
export interface AdminNews {
  newsId: number;
  title: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  author: string | null;
  category: string | null;
  status: '0' | '1' | null;
  viewCount: number | null;
  publishTime: string | null;
  createTime: string | null;
}

export interface NewsListQuery {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  category?: string;
  status?: string;
}

export interface SaveNewsParams {
  newsId?: number;
  title?: string;
  summary?: string;
  content?: string;
  author?: string;
  category?: string;
  status?: '0' | '1';
}

export function getAdminNewsList(params?: NewsListQuery): Promise<PageResult<AdminNews>> {
  return request.get('/simhub/news/list', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function createNews(data: SaveNewsParams): Promise<void> {
  return request.post('/simhub/news', data);
}

export function updateNews(data: SaveNewsParams & { newsId: number }): Promise<void> {
  return request.put('/simhub/news', data);
}

export function deleteNews(newsId: number): Promise<void> {
  return request.delete(`/simhub/news/${newsId}`);
}

// ─────────────────────────────────────────────
// 规章制度管理
// ─────────────────────────────────────────────
export interface AdminRegulation {
  regId: number;
  title: string;
  category: string | null;
  content: string | null;
  fileUrl: string | null;
  hasAttachment: boolean;
  status: '0' | '1' | null;
  publishDate: string | null;
  createTime: string | null;
}

export interface RegulationListQuery {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  category?: string;
  status?: string;
}

export interface SaveRegulationParams {
  regId?: number;
  title?: string;
  category?: string;
  content?: string;
  fileUrl?: string;
  hasAttachment?: boolean;
  status?: '0' | '1';
  publishDate?: string;
}

export function getAdminRegulationList(params?: RegulationListQuery): Promise<PageResult<AdminRegulation>> {
  return request.get('/simhub/regulation/list', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function createRegulation(data: SaveRegulationParams): Promise<void> {
  return request.post('/simhub/regulation', data);
}

export function updateRegulation(data: SaveRegulationParams & { regId: number }): Promise<void> {
  return request.put('/simhub/regulation', data);
}

export function deleteRegulation(regId: number): Promise<void> {
  return request.delete(`/simhub/regulation/${regId}`);
}

// ─────────────────────────────────────────────
// 实验中心介绍管理
// ─────────────────────────────────────────────
export interface AdminCenterInfo {
  id: number | null;
  centerName: string | null;
  centerSlogan: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  statFoundedYear: string | null;
  statExperiments: string | null;
  statStudents: string | null;
  statCourses: string | null;
  contactAddress: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  updateTime: string | null;
}

export interface AdminTeamMember {
  id: number;
  name: string;
  titleRole: string | null;
  specialty: string | null;
  bio: string | null;
  imageUrl: string | null;
  sortOrder: number | null;
  status: string | null;
}

export interface FullAdminCenterData {
  info: AdminCenterInfo;
  teamMembers: AdminTeamMember[];
}

export function getAdminCenterInfo(): Promise<FullAdminCenterData> {
  return request.get('/simhub/center/info').then((res: any) => res.data?.data ?? { info: {}, teamMembers: [] });
}

export function updateCenterInfo(data: Partial<AdminCenterInfo>): Promise<void> {
  return request.put('/simhub/center/info', data);
}

export function createTeamMember(data: Omit<AdminTeamMember, 'id'>): Promise<void> {
  return request.post('/simhub/center/team', data);
}

export function updateTeamMember(data: AdminTeamMember): Promise<void> {
  return request.put('/simhub/center/team', data);
}

export function deleteTeamMember(memberId: number): Promise<void> {
  return request.delete(`/simhub/center/team/${memberId}`);
}

// ─────────────────────────────────────────────
// 应用系统管理（仿真系统）
// ─────────────────────────────────────────────
export interface AdminSimSystem {
  simSystemId: number;
  systemName: string;
  systemDetail: string | null;
  coverImage: string | null;
  hwRecommend: string | null;
  hwSupport: string | null;
  sysCategory: string | null;
  viewCount: number;
  status: '0' | '1';
  createTime: string | null;
  images: string[];
  expCount: number;
  sourceType: 'platform' | 'tenant' | null;
}

export interface SimSystemListQuery {
  pageNum?: number;
  pageSize?: number;
  systemName?: string;
  sysCategory?: string;
  hwSupport?: string;
  tenantScope?: 'mine' | 'all';
}

export interface SaveSimSystemParams {
  simSystemId?: number;
  systemName?: string;
  sysCategory?: string;
  systemDetail?: string;
  coverImage?: string;
  hwRecommend?: string;
  hwSupport?: string;
  status?: '0' | '1';
}

export function getAdminSimSystemList(params?: SimSystemListQuery): Promise<PageResult<AdminSimSystem>> {
  return request.get('/simhub/sim-system/list', { params: { ...params, tenantScope: params?.tenantScope ?? 'mine' } })
    .then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function createSimSystem(data: SaveSimSystemParams): Promise<void> {
  return request.post('/simhub/sim-system', data);
}

export function updateSimSystem(data: SaveSimSystemParams & { simSystemId: number }): Promise<void> {
  return request.put('/simhub/sim-system', data);
}

export function deleteSimSystem(simSystemId: number): Promise<void> {
  return request.delete(`/simhub/sim-system/${simSystemId}`);
}

// ─────────────────────────────────────────────
// 学校设置
// ─────────────────────────────────────────────
export interface SchoolSettings {
  siteName: string;
  siteSubtitle: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  icp: string;
  allowRegister: boolean;
  requireApproval: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableCaptcha: boolean;
  uploadLimit: number;
  allowedTypes: string;
  emailNewUser: boolean;
  emailNewExperiment: boolean;
  emailSystemAlert: boolean;
  smsAlert: boolean;
  browserNotify: boolean;
}

export function getSchoolSettings(): Promise<SchoolSettings> {
  return request.get('/simhub/school/settings').then((res: any) => res.data.data);
}

export function updateSchoolSettings(data: Partial<SchoolSettings>): Promise<void> {
  return request.put('/simhub/school/settings', data);
}
