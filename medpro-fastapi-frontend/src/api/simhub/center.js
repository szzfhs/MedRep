import request from '@/utils/request'

// ===== 中心基本信息 =====

export function getCenterInfo() {
  return request({ url: '/simhub/center', method: 'get' })
}

export function updateCenterInfo(data) {
  return request({ url: '/simhub/center', method: 'put', data })
}

// ===== 组织架构成员 =====

export function listOrgMembers() {
  return request({ url: '/simhub/center/org', method: 'get' })
}

export function addOrgMember(data) {
  return request({ url: '/simhub/center/org', method: 'post', data })
}

export function updateOrgMember(memberId, data) {
  return request({ url: `/simhub/center/org/${memberId}`, method: 'put', data })
}

export function deleteOrgMember(memberId) {
  return request({ url: `/simhub/center/org/${memberId}`, method: 'delete' })
}

// ===== 核心团队成员 =====

export function listTeamMembers() {
  return request({ url: '/simhub/center/team', method: 'get' })
}

export function addTeamMember(data) {
  return request({ url: '/simhub/center/team', method: 'post', data })
}

export function updateTeamMember(memberId, data) {
  return request({ url: `/simhub/center/team/${memberId}`, method: 'put', data })
}

export function deleteTeamMember(memberId) {
  return request({ url: `/simhub/center/team/${memberId}`, method: 'delete' })
}
