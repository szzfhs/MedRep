import request from '@/utils/request'

const T = '/simhub/teacher'

export const getTeacherDashboard = () => request.get(`${T}/dashboard`)
export const getTeacherStats = () => request.get(`${T}/stats`)

// 课程管理
export const getTeacherCourses = (params) => request.get(`${T}/courses`, { params })
export const createTeacherCourse = (data) => request.post(`${T}/course`, data)
export const updateTeacherCourse = (id, data) => request.put(`${T}/course/${id}`, data)
export const deleteTeacherCourse = (id) => request.delete(`${T}/course/${id}`)

// 章节管理
export const getCourseSections = (courseId) => request.get(`${T}/course/${courseId}/sections`)
export const createSection = (data) => request.post(`${T}/section`, data)
export const updateSection = (id, data) => request.put(`${T}/section/${id}`, data)
export const deleteSection = (id) => request.delete(`${T}/section/${id}`)

// 学生列表
export const getCourseStudents = (courseId) => request.get(`${T}/course/${courseId}/students`)
