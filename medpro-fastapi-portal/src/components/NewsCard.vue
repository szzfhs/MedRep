<template>
  <router-link :to="`/news/${news.newsId}`" class="card block p-5 group">
    <div class="flex items-start gap-4">
      <img
        v-if="news.coverImage"
        :src="news.coverImage"
        class="w-20 h-16 object-cover rounded-lg flex-shrink-0"
      />
      <div v-else class="w-20 h-16 bg-surface-container rounded-lg flex-shrink-0 flex items-center justify-center">
        <span class="material-symbols-outlined text-2xl text-outline">article</span>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-headline font-bold text-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {{ news.title }}
        </h3>
        <p class="text-xs text-slate-400 line-clamp-2 mb-2">{{ news.summary }}</p>
        <span class="text-xs text-outline">{{ formatDate(news.publishTime) }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({ news: { type: Object, required: true } })
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
