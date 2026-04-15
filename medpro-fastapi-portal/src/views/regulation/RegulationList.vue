<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <h1 class="text-3xl font-extrabold font-headline text-on-surface mb-2">规章制度</h1>
    <p class="text-slate-400 mb-8">实验室安全管理规定、教学管理规范及相关制度文件</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="h-16 bg-surface-container rounded-xl animate-pulse" />
    </div>

    <div v-else-if="regulations.length" class="space-y-3">
      <div
        v-for="r in regulations"
        :key="r.regId"
        class="card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
        @click="$router.push(`/regulation/${r.regId}`)"
      >
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-primary">gavel</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-on-surface truncate">{{ r.title }}</h3>
          <p class="text-xs text-slate-400 mt-0.5">发布日期：{{ r.createTime ? new Date(r.createTime).toLocaleDateString('zh-CN') : '' }}</p>
        </div>
        <span class="material-symbols-outlined text-slate-400">chevron_right</span>
      </div>
    </div>
    <div v-else class="text-center py-24 text-slate-400">暂无制度文件</div>

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
import { getRegulationList } from '@/api/portal'

const regulations = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const pageSize = 15
const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function loadData() {
  loading.value = true
  try {
    const res = await getRegulationList({ pageNum: page.value, pageSize })
    regulations.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  page.value = p
  loadData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(loadData)
</script>
