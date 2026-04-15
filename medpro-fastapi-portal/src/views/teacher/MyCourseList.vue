<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <!-- 页头 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold font-headline text-on-surface">我的课程</h1>
        <p class="text-slate-400 text-sm mt-0.5">管理您创建的所有课程</p>
      </div>
      <button class="btn-primary flex items-center gap-1" @click="openCreate">
        <span class="material-symbols-outlined text-sm">add</span>新建课程
      </button>
    </div>

    <!-- 搜索过滤条 -->
    <div class="card px-5 py-4 mb-5 flex flex-wrap items-center gap-3">
      <input
        v-model="search.courseName"
        class="input flex-1 min-w-40"
        placeholder="搜索课程名称…"
        @keyup.enter="loadCourses"
      />
      <select v-model="search.status" class="input w-32" @change="loadCourses">
        <option value="">全部状态</option>
        <option value="0">已发布</option>
        <option value="1">草稿</option>
      </select>
      <button class="btn-outline py-2 px-4" @click="loadCourses">搜索</button>
    </div>

    <!-- 课程表格 -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="py-16 text-center text-slate-400 text-sm">加载中…</div>
      <div v-else-if="courses.length === 0" class="py-16 text-center text-slate-400 text-sm">
        暂无课程，
        <button class="text-primary hover:underline" @click="openCreate">新建一门课程</button>
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">课程名称</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">分类</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">选课人数</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">状态</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="course in courses" :key="course.courseId" class="hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3">
              <div class="font-medium text-on-surface">{{ course.courseName }}</div>
              <div class="text-xs text-slate-400 mt-0.5">ID: {{ course.courseId }}</div>
            </td>
            <td class="px-5 py-3 hidden md:table-cell text-slate-500">{{ course.category || '—' }}</td>
            <td class="px-5 py-3 hidden md:table-cell text-slate-500">{{ course.enrollCount || 0 }} 人</td>
            <td class="px-5 py-3">
              <span
                :class="course.status === '0'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'"
                class="px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {{ course.status === '0' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-3 flex-wrap">
                <button class="text-primary text-xs hover:underline" @click="openEdit(course)">编辑</button>
                <router-link
                  :to="`/teacher/course/${course.courseId}/sections`"
                  class="text-primary text-xs hover:underline"
                >章节</router-link>
                <router-link
                  :to="`/teacher/course/${course.courseId}/students`"
                  class="text-primary text-xs hover:underline"
                >学生</router-link>
                <button class="text-red-400 text-xs hover:underline" @click="removeCourse(course)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-slate-500">
        <span>共 {{ total }} 门课程</span>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
            :disabled="pageNum <= 1"
            @click="changePage(pageNum - 1)"
          >上一页</button>
          <span>{{ pageNum }} / {{ Math.ceil(total / pageSize) }}</span>
          <button
            class="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
            :disabled="pageNum >= Math.ceil(total / pageSize)"
            @click="changePage(pageNum + 1)"
          >下一页</button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <CourseFormDialog
      v-model="showForm"
      :course-id="editingCourse?.courseId || null"
      :initial-data="editingCourse"
      @saved="handleSaved"
    />

    <!-- 删除确认 -->
    <div
      v-if="deletingCourse"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      @click.self="deletingCourse = null"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 class="font-bold text-on-surface mb-2">确认删除</h3>
        <p class="text-sm text-slate-500 mb-5">
          删除课程「{{ deletingCourse.courseName }}」后将无法恢复，确定吗？
        </p>
        <div class="flex justify-end gap-3">
          <button class="btn-outline py-2 px-4" @click="deletingCourse = null">取消</button>
          <button class="bg-red-500 text-white rounded-xl py-2 px-4 text-sm font-semibold hover:bg-red-600" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTeacherCourses, deleteTeacherCourse } from '@/api/teacher'
import CourseFormDialog from './CourseFormDialog.vue'

const loading = ref(false)
const courses = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const search = ref({ courseName: '', status: '' })

const showForm = ref(false)
const editingCourse = ref(null)
const deletingCourse = ref(null)

async function loadCourses() {
  try {
    loading.value = true
    const res = await getTeacherCourses({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      courseName: search.value.courseName || undefined,
      status: search.value.status || undefined,
    })
    const data = res.data || res
    courses.value = data.rows || []
    total.value = data.total || 0
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingCourse.value = null
  showForm.value = true
}

function openEdit(course) {
  editingCourse.value = course
  showForm.value = true
}

function removeCourse(course) {
  deletingCourse.value = course
}

async function confirmDelete() {
  if (!deletingCourse.value) return
  try {
    await deleteTeacherCourse(deletingCourse.value.courseId)
    deletingCourse.value = null
    await loadCourses()
  } catch {
    // ignore
  }
}

function handleSaved() {
  showForm.value = false
  loadCourses()
}

function changePage(p) {
  pageNum.value = p
  loadCourses()
}

onMounted(loadCourses)
</script>
