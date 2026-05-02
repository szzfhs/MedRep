import request from '../lib/request';

export interface CourseSection {
  sectionId: number;
  courseId: number;
  parentId: number | null;
  title: string;
  sortOrder: number;
  sectionType: string;
  description: string | null;
  status: string;
  children?: CourseSection[];
}

export interface Course {
  courseId: number;
  courseName: string;
  teacherId: number | null;
  teacherName: string | null;
  coverImage: string | null;
  description: string | null;
  courseCategory: '1' | '2' | '3' | null;
  totalSections: number | null;
  totalResources: number | null;
  status: '0' | '1' | '2' | null;
  enrollCount: number | null;
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
