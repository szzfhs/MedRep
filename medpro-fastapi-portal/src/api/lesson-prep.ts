import request from '../lib/request';

export interface LessonPrep {
  prepId: number;
  courseId: number | null;
  teacherId: number;
  prepName: string;
  currentStep: number;
  basicInfoJson: string | null;
  outlineJson: string | null;
  resourceConfigJson: string | null;
  status: '0' | '1' | '2';
  createTime: string | null;
  updateTime: string | null;
}

export interface OutlineNode {
  id: string;
  title: string;
  hours: number;
  description?: string;
  children?: OutlineNode[];
}

export interface BasicInfoDraft {
  courseName: string;
  teacherName?: string;
  department?: string;
  courseCategory?: '1' | '2' | '3';
  totalSections?: number;
  totalHours?: number;
  publishDate?: string;
  description?: string;
  learningOutcomes?: string[];
  certificateInfo?: string;
  coverImage?: string;
}

// ——— 备课草稿 CRUD ———

export function getLessonPrepList(): Promise<LessonPrep[]> {
  return request.get('/simhub/teacher/lesson-prep').then((res: any) => res.data.data ?? []);
}

export function getLessonPrepDetail(prepId: number): Promise<LessonPrep> {
  return request.get(`/simhub/teacher/lesson-prep/${prepId}`).then((res: any) => res.data.data);
}

export function createLessonPrep(prepName: string, courseId?: number): Promise<{ prepId: number }> {
  return request
    .post('/simhub/teacher/lesson-prep', { prepName, courseId: courseId ?? null })
    .then((res: any) => res.data.data);
}

export function saveLessonPrepStep(prepId: number, step: number, data: object): Promise<void> {
  return request.put(`/simhub/teacher/lesson-prep/${prepId}/step`, {
    step,
    data: JSON.stringify(data),
  });
}

export function deleteLessonPrep(prepId: number): Promise<void> {
  return request.delete(`/simhub/teacher/lesson-prep/${prepId}`);
}

export function publishLessonPrep(prepId: number): Promise<{ courseId: number }> {
  return request
    .post(`/simhub/teacher/lesson-prep/${prepId}/publish`)
    .then((res: any) => res.data.data);
}
