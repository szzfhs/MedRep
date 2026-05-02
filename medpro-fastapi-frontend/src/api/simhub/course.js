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

// ——— 章节-实验 关联 ———
export function getSectionExperiments(sectionId) {
  return request({ url: `/simhub/course/section/${sectionId}/experiments`, method: 'get' })
}

export function bindSectionExperiment(data) {
  return request({ url: '/simhub/course/section/experiment', method: 'post', data })
}

export function unbindSectionExperiment(sectionId, expId) {
  return request({ url: `/simhub/course/section/${sectionId}/experiment/${expId}`, method: 'delete' })
}

// ——— 章节-资源 关联 ———
export function getSectionResources(sectionId) {
  return request({ url: `/simhub/course/section/${sectionId}/resources`, method: 'get' })
}

export function bindSectionResource(data) {
  return request({ url: '/simhub/course/section/resource', method: 'post', data })
}

export function unbindSectionResource(sectionId, resourceId) {
  return request({ url: `/simhub/course/section/${sectionId}/resource/${resourceId}`, method: 'delete' })
}
