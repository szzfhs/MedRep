<template>
  <router-link :to="`/course/${course.courseId}`" class="card block overflow-hidden group">
    <div class="relative h-40 bg-surface-container overflow-hidden">
      <img
        v-if="course.coverImage"
        :src="course.coverImage"
        :alt="course.courseName"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="material-symbols-outlined text-5xl text-outline">menu_book</span>
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-headline font-bold text-on-surface text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
        {{ course.courseName }}
      </h3>
      <div class="flex items-center gap-1 text-xs text-slate-400 mt-2">
        <span class="material-symbols-outlined text-sm">group</span>
        {{ course.enrollCount || 0 }} 人已选课
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({ course: { type: Object, required: true } })
</script>
