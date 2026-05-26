import request from '@/utils/request'

// ==================== 学年学期配置 ====================
export function listTermConfig(query) {
  return request({ url: '/simhub/class-admin/term/list', method: 'get', params: query })
}

export function getTermConfig(termId) {
  return request({ url: '/simhub/class-admin/term/' + termId, method: 'get' })
}

export function addTermConfig(data) {
  return request({ url: '/simhub/class-admin/term', method: 'post', data })
}

export function updateTermConfig(data) {
  return request({ url: '/simhub/class-admin/term', method: 'put', data })
}

export function delTermConfig(termIds) {
  return request({ url: '/simhub/class-admin/term/' + termIds, method: 'delete' })
}

export function getTermConfigOptions() {
  return request({ url: '/simhub/class-admin/term/options', method: 'get' })
}

// ==================== 行政班级 ====================
export function listClassAdmin(query) {
  return request({ url: '/simhub/class-admin/list', method: 'get', params: query })
}

export function getClassAdmin(classId) {
  return request({ url: '/simhub/class-admin/' + classId, method: 'get' })
}

export function addClassAdmin(data) {
  return request({ url: '/simhub/class-admin', method: 'post', data })
}

export function updateClassAdmin(data) {
  return request({ url: '/simhub/class-admin', method: 'put', data })
}

export function delClassAdmin(classIds) {
  return request({ url: '/simhub/class-admin/' + classIds, method: 'delete' })
}

export function getClassAdminOptions() {
  return request({ url: '/simhub/class-admin/options', method: 'get' })
}

// ==================== 班级学生管理 ====================
export function listClassStudent(query) {
  return request({ url: '/simhub/class-admin/student/list', method: 'get', params: query })
}

export function addClassStudent(data) {
  return request({ url: '/simhub/class-admin/student', method: 'post', data })
}

export function batchAddClassStudent(data) {
  return request({ url: '/simhub/class-admin/student/batch', method: 'post', data })
}

export function delClassStudent(ids) {
  return request({ url: '/simhub/class-admin/student/' + ids, method: 'delete' })
}
