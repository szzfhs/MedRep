import request from '@/utils/request'

// 认证
export const login = (data) => {
  const form = new URLSearchParams()
  form.append('username', data.username)
  form.append('password', data.password)
  return request.post('/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
export const register = (data) => request.post('/register', data)
export const registerUser = (data) => request.post('/register', data)
export const getUserInfo = () => request.get('/getInfo')

// 门户公开接口
const P = '/simhub/portal'

export const getCenterInfo = () => request.get(`${P}/center`)
export const getNewsList = (params) => request.get(`${P}/news`, { params })
export const getNewsDetail = (id) => request.get(`${P}/news/${id}`)
export const getRegulationList = (params) => request.get(`${P}/regulation`, { params })
export const getRegulationDetail = (id) => request.get(`${P}/regulation/${id}`)
export const getExperimentCategories = () => request.get(`${P}/experiment/categories`)
export const getExperimentList = (params) => request.get(`${P}/experiment`, { params })
export const getExperimentDetail = (id) => request.get(`${P}/experiment/${id}`)
export const participateExperiment = (id) => request.post(`${P}/experiment/${id}/participate`)
export const getCourseList = (params) => request.get(`${P}/course`, { params })
export const getCourseDetail = (id) => request.get(`${P}/course/${id}`)
export const getResourceCategories = () => request.get(`${P}/resource/categories`)
export const getResourceList = (params) => request.get(`${P}/resource`, { params })
export const getResourceDetail = (id) => request.get(`${P}/resource/${id}`)

// 需认证的操作
export const enrollCourse = (courseId) => request.post(`/simhub/course/enroll/${courseId}`)
export const getMyCourses = () => request.get('/simhub/course/my/courses')
export const updateProgress = (data) => request.put('/simhub/course/progress', data)
export const getCourseProgress = (courseId) => request.get(`/simhub/course/progress/${courseId}`)
