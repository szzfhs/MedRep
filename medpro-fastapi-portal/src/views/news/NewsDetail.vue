<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-2/3 bg-surface-container rounded animate-pulse" />
      <div class="h-64 bg-surface-container rounded animate-pulse" />
    </div>

    <template v-else-if="news">
      <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <router-link to="/news" class="hover:text-primary">新闻动态</router-link>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-on-surface line-clamp-1">{{ news.title }}</span>
      </nav>

      <h1 class="text-3xl font-extrabold font-headline text-on-surface mb-3">{{ news.title }}</h1>
      <div class="flex items-center gap-4 text-sm text-slate-400 mb-6 border-b border-outline-variant pb-4">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">calendar_today</span>
          {{ news.publishTime ? new Date(news.publishTime).toLocaleDateString('zh-CN') : '' }}
        </span>
        <span v-if="news.author" class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">person</span>{{ news.author }}
        </span>
      </div>

      <div class="prose max-w-none" v-html="news.content" />
    </template>

    <div v-else class="text-center py-20 text-slate-400">
      新闻不存在
      <router-link to="/news" class="text-primary mt-4 block">返回新闻列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getNewsDetail } from '@/api/portal'

const route = useRoute()
const news = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getNewsDetail(route.params.id)
    news.value = res.data
  } finally {
    loading.value = false
  }
})
</script>
