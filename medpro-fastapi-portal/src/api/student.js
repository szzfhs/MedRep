import request from '@/utils/request'

const S = '/simhub/student'

export const getStudentDashboard = () => request.get(`${S}/dashboard`)
export const getMyExperiments = (params) => request.get(`${S}/experiments`, { params })
export const getMyCourseProgress = () => request.get(`${S}/courses`)
export const getCourseLearnDetail = (courseId) => request.get(`${S}/course/${courseId}/progress`)
export const completeSectionProgress = (sectionId) => request.put(`${S}/section/${sectionId}/complete`)

// 学生档案（复用 profile 路由）
export const getStudentProfile = () => request.get('/simhub/profile/student')
export const updateStudentProfile = (data) => request.put('/simhub/profile/student', data)
