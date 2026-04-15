<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold font-headline text-on-surface mb-2">我的课程</h1>
    <p class="text-slate-400 mb-8">已报名的虚拟仿真实验课程</p>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-56 bg-surface-container rounded-xl animate-pulse" />
    </div>

    <div v-else-if="courses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="c in courses"
        :key="c.courseId"
        class="card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
        @click="$router.push(`/course/${c.courseId}`)"
      >
        <div class="relative h-40 bg-surface-container overflow-hidden rounded-t-xl">
          <img v-if="c.coverImage" :src="c.coverImage" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols-outlined text-5xl text-outline">school</span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-on-surface line-clamp-2 mb-2">{{ c.courseName }}</h3>
          <!-- 进度条 -->
          <div class="mt-2">
            <div class="flex justify-between text-xs text-slate-400 mb-1">
              <span>学习进度</span>
              <span>{{ c.progress || 0 }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-outline-variant overflow-hidden">
              <div
                class="h-full rounded-full bg-primary transition-all"
                :style="{ width: (c.progress || 0) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-24 text-slate-400">
      <span class="material-symbols-outlined text-5xl mb-3 block">school</span>
      <p>暂无已报名课程</p>
      <router-link to="/course" class="btn-primary inline-block mt-4">去课程中心</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyCourses } from '@/api/portal'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const courses = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push('/login?redirect=/my/courses')
    return
  }
  try {
    const res = await getMyCourses()
    courses.value = res.data?.rows || res.data || []
  } finally {
    loading.value = false
  }
})
</script>
