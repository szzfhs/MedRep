import request from '@/utils/request'

// ====================== 租户 CRUD ======================

// 分页查询租户列表
export function listTenant(query) {
  return request({ url: '/simhub/tenant/list', method: 'get', params: query })
}

// 获取所有启用租户（下拉用）
export function getAllTenants() {
  return request({ url: '/simhub/tenant/all', method: 'get' })
}

// 获取租户详情
export function getTenant(tenantId) {
  return request({ url: '/simhub/tenant/' + tenantId, method: 'get' })
}

// 新增租户
export function addTenant(data) {
  return request({ url: '/simhub/tenant', method: 'post', data })
}

// 修改租户
export function updateTenant(data) {
  return request({ url: '/simhub/tenant', method: 'put', data })
}

// 删除租户（支持批量，逗号分隔）
export function delTenant(tenantIds) {
  return request({ url: '/simhub/tenant/' + tenantIds, method: 'delete' })
}

// ====================== 租户统计 ======================

// 获取租户统计数据
export function getTenantStats(tenantId) {
  return request({ url: `/simhub/tenant/${tenantId}/stats`, method: 'get' })
}

// ====================== 内容授权 ======================

// 获取租户已授权内容列表
export function getTenantGrants(tenantId, contentType) {
  return request({
    url: `/simhub/tenant/${tenantId}/grants`,
    method: 'get',
    params: contentType ? { contentType } : {}
  })
}

// 批量授权内容给租户
export function grantContent(tenantId, data) {
  return request({ url: `/simhub/tenant/${tenantId}/grant`, method: 'post', data })
}

// 撤销授权
export function revokeContent(tenantId, contentType, contentId) {
  return request({
    url: `/simhub/tenant/${tenantId}/grant/${contentType}/${contentId}`,
    method: 'delete'
  })
}
