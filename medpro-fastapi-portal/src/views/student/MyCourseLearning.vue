<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold font-headline text-on-surface mb-2">我的课程</h1>
    <p class="text-slate-400 mb-8">已报名课程的学习进度</p>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-64 bg-surface-container rounded-xl animate-pulse" />
    </div>

    <div v-else-if="courses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="c in courses"
        :key="c.courseId"
        class="card flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
        @click="$router.push(`/student/course/${c.courseId}/learn`)"
      >
        <div class="relative h-36 bg-surface-container overflow-hidden rounded-t-xl">
          <img v-if="c.coverImage" :src="c.coverImage" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols-outlined text-5xl text-outline">school</span>
          </div>
          <!-- 完成标签 -->
          <span
            v-if="c.progress >= 100"
            class="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
          >
            已完成
          </span>
        </div>
        <div class="p-4 flex flex-col flex-1">
          <h3 class="font-semibold text-on-surface line-clamp-2 mb-2 flex-1">{{ c.courseName }}</h3>
          <!-- 进度 -->
          <div class="mt-auto">
            <div class="flex justify-between text-xs text-slate-400 mb-1">
              <span>{{ c.doneSections }}/{{ c.totalSections }} 章节</span>
              <span>{{ c.progress }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-outline-variant overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="c.progress >= 100 ? 'bg-green-500' : 'bg-primary'"
                :style="{ width: c.progress + '%' }"
              />
            </div>
          </div>
          <button
            class="mt-4 btn-primary text-sm w-full text-center py-2 rounded-lg"
            @click.stop="$router.push(`/student/course/${c.courseId}/learn`)"
          >
            {{ c.progress > 0 ? '继续学习' : '开始学习' }}
          </button>
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
import { getMyCourseProgress } from '@/api/student'

const courses = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getMyCourseProgress()
    courses.value = res.data || []
  } finally {
    loading.value = false
  }
})
</script>
