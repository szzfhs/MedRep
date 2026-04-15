import request from '@/utils/request'

// 查询规章制度列表
export function listRegulation(query) {
  return request({ url: '/simhub/regulation/list', method: 'get', params: query })
}

// 查询规章制度详情
export function getRegulation(regId) {
  return request({ url: '/simhub/regulation/' + regId, method: 'get' })
}

// 新增规章制度
export function addRegulation(data) {
  return request({ url: '/simhub/regulation', method: 'post', data })
}

// 修改规章制度
export function updateRegulation(data) {
  return request({ url: '/simhub/regulation', method: 'put', data })
}

// 删除规章制度
export function delRegulation(regIds) {
  return request({ url: '/simhub/regulation/' + regIds, method: 'delete' })
}
