import request from '@/utils/request'

// 获取中心简介
export function getCenterInfo() {
  return request({ url: '/simhub/center', method: 'get' })
}

// 更新中心简介
export function updateCenterInfo(data) {
  return request({ url: '/simhub/center', method: 'put', data })
}
