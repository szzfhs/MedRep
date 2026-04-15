<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <h1 class="text-3xl font-extrabold font-headline text-on-surface mb-2">虚拟仿真课程中心</h1>
    <p class="text-slate-400 mb-8">精选高质量虚拟仿真实验课程，助力医学实践教学</p>

    <!-- 搜索栏 -->
    <div class="flex gap-3 mb-8">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索课程..."
        class="flex-1 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        @keyup.enter="doSearch"
      />
      <button class="btn-primary px-6" @click="doSearch">搜索</button>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="h-60 bg-surface-container rounded-xl animate-pulse" />
    </div>

    <!-- 课程列表 -->
    <div v-else-if="courses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <CourseCard
        v-for="c in courses"
        :key="c.courseId"
        :course="c"
        @click="$router.push(`/course/${c.courseId}`)"
      />
    </div>
    <div v-else class="text-center py-24 text-slate-400">暂无课程</div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="flex justify-center gap-2 mt-10">
      <button
        v-for="p in totalPages"
        :key="p"
        class="px-4 py-2 rounded-lg text-sm font-medium transition"
        :class="p === page ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-primary/10'"
        @click="changePage(p)"
      >{{ p }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CourseCard from '@/components/CourseCard.vue'
import { getCourseList } from '@/api/portal'

const courses = ref([])
const loading = ref(true)
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function loadCourses() {
  loading.value = true
  try {
    const res = await getCourseList({ keyword: keyword.value || undefined, pageNum: page.value, pageSize })
    courses.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function doSearch() {
  page.value = 1
  loadCourses()
}

function changePage(p) {
  page.value = p
  loadCourses()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(loadCourses)
</script>
