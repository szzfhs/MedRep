import request from '@/utils/request'

// ——— 实验分类 ———
export function listExperimentCategoryTree() {
  return request({ url: '/simhub/experiment/category/tree', method: 'get' })
}

export function addExperimentCategory(data) {
  return request({ url: '/simhub/experiment/category', method: 'post', data })
}

export function updateExperimentCategory(data) {
  return request({ url: '/simhub/experiment/category', method: 'put', data })
}

export function delExperimentCategory(categoryId) {
  return request({ url: '/simhub/experiment/category/' + categoryId, method: 'delete' })
}

// ——— 实验管理 ———
export function listExperiment(query) {
  return request({ url: '/simhub/experiment/list', method: 'get', params: query })
}

export function getExperiment(expId) {
  return request({ url: '/simhub/experiment/' + expId, method: 'get' })
}

export function addExperiment(data) {
  return request({ url: '/simhub/experiment', method: 'post', data })
}

export function updateExperiment(data) {
  return request({ url: '/simhub/experiment', method: 'put', data })
}

export function delExperiment(expIds) {
  return request({ url: '/simhub/experiment/' + expIds, method: 'delete' })
}
