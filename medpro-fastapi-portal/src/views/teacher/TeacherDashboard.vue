<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <!-- 欢迎头部 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold font-headline text-on-surface">
        欢迎回来，{{ auth.user?.nickName || auth.user?.userName || '老师' }} 👋
      </h1>
      <p class="text-slate-400 mt-1 text-sm">教师工作台 — 管理您的课程和学生</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div
        v-for="stat in statCards"
        :key="stat.label"
        class="card p-5 flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-slate-400 text-sm">{{ stat.label }}</span>
          <span class="material-symbols-outlined text-primary text-xl">{{ stat.icon }}</span>
        </div>
        <p class="text-3xl font-bold font-headline text-on-surface">
          {{ loading ? '—' : stat.value }}
        </p>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <router-link
        to="/teacher/courses"
        class="card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition"
      >
        <span class="material-symbols-outlined text-primary text-3xl">school</span>
        <div>
          <p class="font-semibold text-on-surface">我的课程</p>
          <p class="text-xs text-slate-400 mt-0.5">查看和管理所有课程</p>
        </div>
      </router-link>
      <button
        class="card p-5 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 transition"
        @click="showCreateCourse = true"
      >
        <span class="material-symbols-outlined text-primary text-3xl">add_circle</span>
        <div>
          <p class="font-semibold text-on-surface">新建课程</p>
          <p class="text-xs text-slate-400 mt-0.5">创建一门新课程</p>
        </div>
      </button>
      <router-link
        to="/teacher/courses"
        class="card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition"
      >
        <span class="material-symbols-outlined text-primary text-3xl">bar_chart</span>
        <div>
          <p class="font-semibold text-on-surface">数据统计</p>
          <p class="text-xs text-slate-400 mt-0.5">学生学习进度概览</p>
        </div>
      </router-link>
    </div>

    <!-- 最近课程 -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-on-surface text-base">最近创建的课程</h2>
        <router-link to="/teacher/courses" class="text-sm text-primary hover:underline">全部课程 →</router-link>
      </div>

      <div v-if="loading" class="py-8 text-center text-slate-400 text-sm">加载中…</div>
      <div v-else-if="recentCourses.length === 0" class="py-8 text-center text-slate-400 text-sm">
        暂无课程，
        <button class="text-primary hover:underline" @click="showCreateCourse = true">立即新建</button>
      </div>
      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="course in recentCourses"
          :key="course.courseId"
          class="py-3 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-slate-300 text-xl">menu_book</span>
            <div>
              <p class="text-sm font-medium text-on-surface">{{ course.courseName }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ course.enrollCount || 0 }} 人选课</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              :class="course.status === '0' ? 'text-green-500' : 'text-yellow-500'"
              class="text-xs font-medium"
            >
              {{ course.status === '0' ? '已发布' : '草稿' }}
            </span>
            <router-link
              :to="`/teacher/course/${course.courseId}/sections`"
              class="text-xs text-primary hover:underline"
            >管理</router-link>
          </div>
        </li>
      </ul>
    </div>

    <!-- 新建课程弹窗 -->
    <CourseFormDialog v-model="showCreateCourse" @saved="handleCourseSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getTeacherDashboard } from '@/api/teacher'
import CourseFormDialog from './CourseFormDialog.vue'

const auth = useAuthStore()
const loading = ref(true)
const dashboardData = ref({})
const showCreateCourse = ref(false)

const recentCourses = computed(() => dashboardData.value.recentCourses || [])

const statCards = computed(() => [
  { label: '我的课程', icon: 'school', value: dashboardData.value.courseCount ?? 0 },
  { label: '选课学生', icon: 'group', value: dashboardData.value.studentCount ?? 0 },
  { label: '实验参与', icon: 'biotech', value: dashboardData.value.expCount ?? 0 },
  { label: '本月新增', icon: 'trending_up', value: '—' },
])

async function load() {
  try {
    loading.value = true
    const res = await getTeacherDashboard()
    dashboardData.value = res.data || {}
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function handleCourseSaved() {
  showCreateCourse.value = false
  load()
}

onMounted(load)
</script>
