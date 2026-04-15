<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <!-- 欢迎头部 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold font-headline text-on-surface">
        欢迎回来，{{ auth.user?.nickName || auth.user?.userName || '同学' }} 👋
      </h1>
      <p class="text-slate-400 mt-1 text-sm">学习中心 — 查看您的学习进度和实验记录</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in statCards" :key="stat.label" class="card p-5 flex flex-col gap-2">
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
        to="/student/courses"
        class="card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition"
      >
        <span class="material-symbols-outlined text-primary text-3xl">school</span>
        <div>
          <p class="font-semibold text-on-surface">我的课程</p>
          <p class="text-xs text-slate-400 mt-0.5">查看学习进度</p>
        </div>
      </router-link>
      <router-link
        to="/student/experiments"
        class="card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition"
      >
        <span class="material-symbols-outlined text-primary text-3xl">biotech</span>
        <div>
          <p class="font-semibold text-on-surface">实验记录</p>
          <p class="text-xs text-slate-400 mt-0.5">查看历史参与实验</p>
        </div>
      </router-link>
      <router-link
        to="/student/profile"
        class="card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition"
      >
        <span class="material-symbols-outlined text-primary text-3xl">manage_accounts</span>
        <div>
          <p class="font-semibold text-on-surface">个人资料</p>
          <p class="text-xs text-slate-400 mt-0.5">编辑学号、专业信息</p>
        </div>
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近学习课程 -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-on-surface text-base">最近学习课程</h2>
          <router-link to="/student/courses" class="text-sm text-primary hover:underline">全部 →</router-link>
        </div>
        <div v-if="loading" class="py-6 text-center text-slate-400 text-sm">加载中…</div>
        <div v-else-if="!dashboard.recentCourses?.length" class="py-6 text-center text-slate-400 text-sm">
          暂无选课记录，<router-link to="/course" class="text-primary hover:underline">去课程中心</router-link>
        </div>
        <ul v-else class="space-y-3">
          <li v-for="c in dashboard.recentCourses" :key="c.courseId">
            <router-link :to="`/student/course/${c.courseId}/learn`" class="block">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-on-surface line-clamp-1">{{ c.courseName }}</span>
                <span class="text-slate-400 shrink-0 ml-2">{{ c.progress }}%</span>
              </div>
              <div class="h-1.5 rounded-full bg-outline-variant overflow-hidden">
                <div
                  class="h-full rounded-full bg-primary transition-all"
                  :style="{ width: c.progress + '%' }"
                />
              </div>
              <p class="text-xs text-slate-400 mt-1">
                已完成 {{ c.doneSections }}/{{ c.totalSections }} 章节
              </p>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- 最近参与实验 -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-on-surface text-base">最近参与实验</h2>
          <router-link to="/student/experiments" class="text-sm text-primary hover:underline">全部 →</router-link>
        </div>
        <div v-if="loading" class="py-6 text-center text-slate-400 text-sm">加载中…</div>
        <div v-else-if="!dashboard.recentExperiments?.length" class="py-6 text-center text-slate-400 text-sm">
          暂无实验记录，<router-link to="/experiment" class="text-primary hover:underline">去实验大厅</router-link>
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li
            v-for="e in dashboard.recentExperiments"
            :key="e.participationId"
            class="py-3 flex items-center justify-between"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="material-symbols-outlined text-slate-300 text-xl shrink-0">biotech</span>
              <div class="min-w-0">
                <p class="text-sm font-medium text-on-surface line-clamp-1">{{ e.expName }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ formatTime(e.startTime) }}</p>
              </div>
            </div>
            <span
              class="text-xs font-medium shrink-0 ml-2"
              :class="e.status === 'completed' ? 'text-green-500' : 'text-yellow-500'"
            >
              {{ e.status === 'completed' ? '已完成' : '已开始' }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getStudentDashboard } from '@/api/student'

const auth = useAuthStore()
const loading = ref(true)
const dashboard = ref({})

const statCards = computed(() => [
  { label: '选课总数', value: dashboard.value.enrollCount ?? 0, icon: 'school' },
  { label: '已完成课程', value: dashboard.value.completedCount ?? 0, icon: 'task_alt' },
  { label: '参与实验', value: dashboard.value.expCount ?? 0, icon: 'biotech' },
  { label: '完成章节', value: dashboard.value.sectionDone ?? 0, icon: 'menu_book' },
])

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await getStudentDashboard()
    dashboard.value = res.data || {}
  } finally {
    loading.value = false
  }
})
</script>
