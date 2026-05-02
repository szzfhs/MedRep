import request from '@/utils/request'

// ——— 实验系统管理 ———
export function listSimSystem(query) {
  return request({ url: '/simhub/sim-system/list', method: 'get', params: query })
}

export function getSimSystem(simSystemId) {
  return request({ url: '/simhub/sim-system/' + simSystemId, method: 'get' })
}

export function addSimSystem(data) {
  return request({ url: '/simhub/sim-system', method: 'post', data })
}

export function updateSimSystem(data) {
  return request({ url: '/simhub/sim-system', method: 'put', data })
}

export function delSimSystem(simSystemIds) {
  return request({ url: '/simhub/sim-system/' + simSystemIds, method: 'delete' })
}

// 获取所有启用的实验系统（用于下拉选项）
export function getSimSystemOptions() {
  return request({ url: '/simhub/sim-system/options', method: 'get' })
}
