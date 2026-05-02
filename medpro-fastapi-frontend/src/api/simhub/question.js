import request from '@/utils/request'

// ——— 习题管理 ———
export function listQuestion(query) {
  return request({ url: '/simhub/question/list', method: 'get', params: query })
}

export function getQuestion(questionId) {
  return request({ url: '/simhub/question/' + questionId, method: 'get' })
}

export function addQuestion(data) {
  return request({ url: '/simhub/question', method: 'post', data })
}

export function updateQuestion(data) {
  return request({ url: '/simhub/question', method: 'put', data })
}

export function delQuestion(questionIds) {
  return request({ url: '/simhub/question/' + questionIds, method: 'delete' })
}

// ——— 章节-习题关联 ———
export function getSectionQuestions(sectionId) {
  return request({ url: '/simhub/question/section/' + sectionId, method: 'get' })
}

export function bindSectionQuestion(data) {
  return request({ url: '/simhub/question/section', method: 'post', data })
}

export function unbindSectionQuestion(sectionId, questionId) {
  return request({ url: `/simhub/question/section/${sectionId}/${questionId}`, method: 'delete' })
}
