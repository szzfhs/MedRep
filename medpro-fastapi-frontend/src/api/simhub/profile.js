import request from '@/utils/request'

// 获取学生档案
export function getStudentProfile() {
  return request({ url: '/simhub/profile/student', method: 'get' })
}

// 保存学生档案
export function saveStudentProfile(data) {
  return request({ url: '/simhub/profile/student', method: 'put', data })
}

// 获取教师档案
export function getTeacherProfile() {
  return request({ url: '/simhub/profile/teacher', method: 'get' })
}

// 保存教师档案
export function saveTeacherProfile(data) {
  return request({ url: '/simhub/profile/teacher', method: 'put', data })
}
