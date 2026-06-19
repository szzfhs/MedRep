import request from '../lib/request';

export interface ResourceItem {
  bindId: number;
  resourceId: number;
  resourceName: string;
  resourceType: string;
  fileFormat: string | null;
  fileUrl: string | null;
  coverImage: string | null;
  duration: number | null;
  sortOrder: number;
}

export interface CourseSection {
  sectionId: number;
  courseId: number;
  parentId: number | null;
  title: string;
  sortOrder: number;
  sectionType: string;
  hours: number | null;
  hasResource: string | null;
  hasExperiment: string | null;
  hasTest: string | null;
  hasMicroVideo: string | null;
  hasExtension: string | null;
  description: string | null;
  status: string;
  children?: CourseSection[];
  resources?: ResourceItem[];
  questionsCount?: number;
}

export interface Course {
  courseId: number;
  courseName: string;
  subtitle: string | null;
  teacherId: number | null;
  teacherName: string | null;
  department: string | null;
  coverImage: string | null;
  description: string | null;
  learningOutcomes: string | null;
  certificateInfo: string | null;
  courseCategory: '1' | '2' | '3' | null;
  totalSections: number | null;
  totalResources: number | null;
  totalHours: number | null;
  status: '0' | '1' | '2' | null;
  enrollCount: number | null;
  rating: number | null;
  reviewCount: number | null;
  publishDate: string | null;
  sortOrder: number | null;
  createTime: string | null;
}

export interface CourseDetail {
  course: Course;
  sections: CourseSection[];
}

export interface CourseListQuery {
  pageNum?: number;
  pageSize?: number;
  courseName?: string;
  courseCategory?: string;
  status?: string;
  tenantId?: number | null;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export function getCourseList(params?: CourseListQuery): Promise<PageResult<Course>> {
  return request.get('/simhub/portal/course', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function getCourseDetail(courseId: number): Promise<CourseDetail> {
  return request.get(`/simhub/portal/course/${courseId}`).then((res: any) => res.data.data);
}

export function getPortalSectionResources(sectionId: number): Promise<ResourceItem[]> {
  return request.get(`/simhub/portal/section/${sectionId}/resources`).then((res: any) => res.data.data ?? []);
}

export function getTeacherCourses(params?: { pageNum?: number; pageSize?: number; courseName?: string; status?: string }): Promise<PageResult<Course>> {
  return request.get('/simhub/teacher/courses', { params }).then((res: any) => res.data ?? { rows: [], total: 0 });
}

export function getTeacherDashboard(): Promise<any> {
  return request.get('/simhub/teacher/dashboard').then((res: any) => res.data.data);
}

export function getTeacherStudents(courseId: number): Promise<any> {
  return request.get(`/simhub/teacher/course/${courseId}/students`).then((res: any) => res.data.data);
}

export function getSectionResources(sectionId: number): Promise<ResourceItem[]> {
  return request.get(`/simhub/teacher/section/${sectionId}/resources`).then((res: any) => res.data.data ?? []);
}

export function bindSectionResources(sectionId: number, resourceIds: number[]): Promise<void> {
  return request.post(`/simhub/teacher/section/${sectionId}/resources/bind`, { resourceIds });
}

export function unbindSectionResource(sectionId: number, resourceId: number): Promise<void> {
  return request.delete(`/simhub/teacher/section/${sectionId}/resources/${resourceId}`);
}

export function sortSectionResources(sectionId: number, bindIds: number[]): Promise<void> {
  return request.put(`/simhub/teacher/section/${sectionId}/resources/sort`, { bindIds });
}
