<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <h1 class="text-3xl font-extrabold font-headline text-on-surface mb-2">新闻动态</h1>
    <p class="text-slate-400 mb-8">了解平台最新消息与医学教育动态</p>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-24 bg-surface-container rounded-xl animate-pulse" />
    </div>

    <div v-else-if="newsList.length" class="space-y-4">
      <NewsCard
        v-for="n in newsList"
        :key="n.newsId"
        :news="n"
        @click="$router.push(`/news/${n.newsId}`)"
      />
    </div>
    <div v-else class="text-center py-24 text-slate-400">暂无新闻</div>

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
import NewsCard from '@/components/NewsCard.vue'
import { getNewsList } from '@/api/portal'

const newsList = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const pageSize = 10
const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function loadNews() {
  loading.value = true
  try {
    const res = await getNewsList({ pageNum: page.value, pageSize })
    newsList.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  page.value = p
  loadNews()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(loadNews)
</script>
