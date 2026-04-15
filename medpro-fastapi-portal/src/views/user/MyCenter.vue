<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold font-headline text-on-surface mb-8">个人中心</h1>

    <div v-if="!auth.isLoggedIn" class="text-center py-20 text-slate-400">
      请先<router-link to="/login" class="text-primary mx-1">登录</router-link>后查看
    </div>

    <template v-else>
      <!-- 用户信息卡 -->
      <div class="card p-6 mb-6 flex items-center gap-5">
        <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white">
          <span class="material-symbols-outlined text-3xl">person</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-on-surface">{{ auth.user?.nickName || auth.user?.userName }}</h2>
          <p class="text-slate-400 text-sm mt-1">{{ auth.user?.phonenumber || auth.user?.email || '' }}</p>
          <p class="text-xs text-slate-400 mt-0.5">UID: {{ auth.user?.userId }}</p>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <span class="material-symbols-outlined text-primary text-3xl">{{ item.icon }}</span>
          <span class="text-sm font-medium text-on-surface">{{ item.label }}</span>
        </router-link>
      </div>

      <!-- 退出登录 -->
      <button class="text-red-400 text-sm hover:text-red-500 flex items-center gap-1" @click="handleLogout">
        <span class="material-symbols-outlined text-sm">logout</span>退出登录
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const menuItems = computed(() => {
  const base = [
    { to: '/experiment', icon: 'biotech', label: '实验大厅' },
    { to: '/resource', icon: 'folder_open', label: '资源中心' },
    { to: '/news', icon: 'newspaper', label: '新闻动态' },
  ]
  if (auth.isStudent) {
    return [
      { to: '/student', icon: 'auto_stories', label: '学习中心' },
      { to: '/student/courses', icon: 'school', label: '我的课程' },
      { to: '/student/experiments', icon: 'biotech', label: '实验记录' },
      { to: '/student/profile', icon: 'manage_accounts', label: '个人资料' },
      ...base.slice(2),
    ]
  }
  if (auth.isTeacher) {
    return [
      { to: '/teacher', icon: 'dashboard', label: '工作台' },
      { to: '/teacher/courses', icon: 'school', label: '我的课程' },
      ...base,
    ]
  }
  return [
    { to: '/my/courses', icon: 'school', label: '我的课程' },
    ...base,
  ]
})

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>
