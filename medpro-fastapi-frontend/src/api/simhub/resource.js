import request from '@/utils/request'

// ——— 资源分类 ———
export function listResourceCategoryTree() {
  return request({ url: '/simhub/resource/category/tree', method: 'get' })
}

export function addResourceCategory(data) {
  return request({ url: '/simhub/resource/category', method: 'post', data })
}

export function updateResourceCategory(data) {
  return request({ url: '/simhub/resource/category', method: 'put', data })
}

export function delResourceCategory(categoryId) {
  return request({ url: '/simhub/resource/category/' + categoryId, method: 'delete' })
}

// ——— 资源管理 ———
export function listResource(query) {
  return request({ url: '/simhub/resource/list', method: 'get', params: query })
}

export function getResource(resourceId) {
  return request({ url: '/simhub/resource/' + resourceId, method: 'get' })
}

export function addResource(data) {
  return request({ url: '/simhub/resource', method: 'post', data })
}

export function updateResource(data) {
  return request({ url: '/simhub/resource', method: 'put', data })
}

export function delResource(resourceIds) {
  return request({ url: '/simhub/resource/' + resourceIds, method: 'delete' })
}
