<template>
  <header class="bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
      <!-- Logo -->
      <div class="flex items-center gap-8">
        <router-link to="/" class="text-2xl font-extrabold text-primary tracking-tighter font-headline">
          SimHub
        </router-link>
        <nav class="hidden md:flex items-center gap-6">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="font-headline font-bold text-sm tracking-tight transition-colors duration-200"
            :class="[$route.path === item.to ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 hover:text-primary']"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </div>

      <!-- 右侧操作 -->
      <div class="flex items-center gap-3">
        <div class="hidden lg:flex items-center bg-surface-container px-3 py-1.5 rounded-full">
          <span class="material-symbols-outlined text-outline text-lg">search</span>
          <input
            v-model="searchKeyword"
            class="bg-transparent border-none focus:outline-none text-sm w-40 ml-1"
            placeholder="搜索实验..."
            @keyup.enter="handleSearch"
          />
        </div>

        <template v-if="auth.isLoggedIn">
          <!-- 教师工作台入口（仅教师角色可见） -->
          <router-link
            v-if="auth.isTeacher"
            to="/teacher"
            class="text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-full transition-colors"
          >
            教师工作台
          </router-link>
          <!-- 学习中心入口（学生角色可见） -->
          <router-link
            v-if="auth.isStudent"
            to="/student"
            class="text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-full transition-colors"
          >
            学习中心
          </router-link>
          <router-link to="/my" class="text-sm font-medium text-primary hover:underline">
            {{ auth.user?.nickName || auth.user?.userName || '我的' }}
          </router-link>
          <button @click="auth.logout()" class="text-sm text-slate-500 hover:text-red-500 transition-colors">退出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn-outline text-sm py-1.5 px-4">登录</router-link>
          <router-link to="/register" class="btn-primary text-sm py-1.5 px-4">注册</router-link>
        </template>

        <!-- 移动端菜单按钮 -->
        <button class="md:hidden p-2" @click="mobileMenuOpen = !mobileMenuOpen">
          <span class="material-symbols-outlined">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-3">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="font-headline font-bold text-sm text-slate-700"
        @click="mobileMenuOpen = false"
      >
        {{ item.label }}
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const searchKeyword = ref('')
const mobileMenuOpen = ref(false)

const navItems = [
  { to: '/', label: '首页' },
  { to: '/experiment', label: '实验大厅' },
  { to: '/course', label: '课程中心' },
  { to: '/resource', label: '资源中心' },
  { to: '/about', label: '关于中心' }
]

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/experiment', query: { keyword: searchKeyword.value } })
    searchKeyword.value = ''
  }
}
</script>
