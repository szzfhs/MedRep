import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, getUserInfo } from '@/api/portal'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('portal_user') || 'null'))
  const token = ref(localStorage.getItem('portal_token') || '')
  const roles = ref(JSON.parse(localStorage.getItem('portal_roles') || '[]'))

  const isLoggedIn = computed(() => !!token.value)
  // roles可能是字符串数组 ["teacher"] 或对象数组 [{roleKey:"teacher"}]
  const hasRole = (key) =>
    Array.isArray(roles.value) &&
    roles.value.some(r => (typeof r === 'string' ? r === key : r.roleKey === key))
  const isTeacher = computed(() => hasRole('teacher'))
  const isStudent = computed(() => hasRole('student'))

  async function loginAction(credentials) {
    const res = await apiLogin(credentials)
    // 后端返回 {code, msg, token}（dict_content方式，token在顶层）
    token.value = res.token || res.access_token || res.data?.access_token || ''
    localStorage.setItem('portal_token', token.value)
    await fetchUser()
    return res
  }

  async function fetchUser() {
    try {
      const res = await getUserInfo()
      // 后端返回 {code, msg, user, roles, permissions}（model_content方式，user在顶层）
      user.value = res.user || res.data?.user || res.data
      roles.value = res.roles || res.data?.roles || []
      localStorage.setItem('portal_user', JSON.stringify(user.value))
      localStorage.setItem('portal_roles', JSON.stringify(roles.value))
    } catch {
      // ignore
    }
  }

  function logout() {
    user.value = null
    token.value = ''
    roles.value = []
    localStorage.removeItem('portal_token')
    localStorage.removeItem('portal_user')
    localStorage.removeItem('portal_roles')
  }

  return { user, token, roles, isLoggedIn, isTeacher, isStudent, loginAction, fetchUser, logout }
})
