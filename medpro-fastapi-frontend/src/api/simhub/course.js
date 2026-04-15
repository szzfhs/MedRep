import request from '@/utils/request'

// ——— 课程管理 ———
export function listCourse(query) {
  return request({ url: '/simhub/course/list', method: 'get', params: query })
}

export function getCourse(courseId) {
  return request({ url: '/simhub/course/' + courseId, method: 'get' })
}

export function addCourse(data) {
  return request({ url: '/simhub/course', method: 'post', data })
}

export function updateCourse(data) {
  return request({ url: '/simhub/course', method: 'put', data })
}

export function delCourse(courseIds) {
  return request({ url: '/simhub/course/' + courseIds, method: 'delete' })
}

// ——— 章节管理 ———
export function addSection(data) {
  return request({ url: '/simhub/course/section', method: 'post', data })
}

export function updateSection(data) {
  return request({ url: '/simhub/course/section', method: 'put', data })
}

export function delSection(sectionId) {
  return request({ url: '/simhub/course/section/' + sectionId, method: 'delete' })
}
