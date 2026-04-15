<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- 面包屑 -->
    <div class="flex items-center gap-2 text-sm text-slate-400 mb-6">
      <router-link to="/teacher" class="hover:text-primary">工作台</router-link>
      <span>/</span>
      <router-link to="/teacher/courses" class="hover:text-primary">我的课程</router-link>
      <span>/</span>
      <span class="text-on-surface font-medium">选课学生</span>
    </div>

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold font-headline text-on-surface">选课学生</h1>
        <p v-if="courseName" class="text-slate-400 text-sm mt-0.5">{{ courseName }}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-slate-400">共 {{ total }} 人选课</span>
        <button class="btn-outline flex items-center gap-1 text-sm" @click="exportCSV">
          <span class="material-symbols-outlined text-sm">download</span>导出 CSV
        </button>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="card px-5 py-3 mb-4 flex items-center gap-3">
      <input
        v-model="searchKeyword"
        class="input flex-1"
        placeholder="搜索学生姓名或用户名…"
      />
    </div>

    <!-- 学生列表 -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="py-16 text-center text-slate-400 text-sm">加载中…</div>
      <div v-else-if="filteredStudents.length === 0" class="py-16 text-center text-slate-400 text-sm">
        暂无学生选课
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">姓名</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">用户名</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">选课时间</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">状态</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="stu in filteredStudents" :key="stu.enrollmentId" class="hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3 font-medium text-on-surface">{{ stu.nickName || '—' }}</td>
            <td class="px-5 py-3 text-slate-500">{{ stu.userName || '—' }}</td>
            <td class="px-5 py-3 hidden md:table-cell text-slate-400 text-xs">
              {{ stu.enrollTime ? formatTime(stu.enrollTime) : '—' }}
            </td>
            <td class="px-5 py-3">
              <span
                :class="stu.status === '1' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
                class="px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {{ stu.status === '1' ? '已完成' : '学习中' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCourseStudents } from '@/api/teacher'
import { getCourseDetail } from '@/api/portal'

const route = useRoute()
const courseId = Number(route.params.id)
const courseName = ref('')
const students = ref([])
const loading = ref(true)
const searchKeyword = ref('')
const total = computed(() => students.value.length)

const filteredStudents = computed(() => {
  const kw = searchKeyword.value.toLowerCase()
  if (!kw) return students.value
  return students.value.filter(s =>
    (s.nickName || '').toLowerCase().includes(kw) ||
    (s.userName || '').toLowerCase().includes(kw)
  )
})

function formatTime(iso) {
  return new Date(iso).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })
}

function exportCSV() {
  const header = '姓名,用户名,选课时间,状态'
  const rows = students.value.map(s =>
    `${s.nickName || ''},${s.userName || ''},${s.enrollTime ? formatTime(s.enrollTime) : ''},${s.status === '1' ? '已完成' : '学习中'}`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `course_${courseId}_students.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  try {
    const infoRes = await getCourseDetail(courseId)
    courseName.value = infoRes.data?.course?.courseName || ''
  } catch { /* ignore */ }

  try {
    const res = await getCourseStudents(courseId)
    students.value = res.data?.list || []
  } catch {
    students.value = []
  } finally {
    loading.value = false
  }
})
</script>
