<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-2/3 bg-surface-container rounded animate-pulse" />
      <div class="h-64 bg-surface-container rounded animate-pulse" />
    </div>

    <template v-else-if="regulation">
      <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <router-link to="/regulation" class="hover:text-primary">规章制度</router-link>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-on-surface line-clamp-1">{{ regulation.title }}</span>
      </nav>

      <h1 class="text-3xl font-extrabold font-headline text-on-surface mb-3">{{ regulation.title }}</h1>
      <div class="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6 border-b border-outline-variant pb-4">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">calendar_today</span>
          发布日期：{{ regulation.createTime ? new Date(regulation.createTime).toLocaleDateString('zh-CN') : '' }}
        </span>
        <span v-if="regulation.updateTime" class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">update</span>
          更新日期：{{ new Date(regulation.updateTime).toLocaleDateString('zh-CN') }}
        </span>
      </div>

      <!-- 附件下载 -->
      <div v-if="regulation.attachmentUrl" class="mb-6 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
        <span class="material-symbols-outlined text-primary">attach_file</span>
        <span class="flex-1 text-sm text-on-surface">附件文件</span>
        <a
          :href="regulation.attachmentUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary text-sm py-1.5 px-4"
        >下载附件</a>
      </div>

      <div class="prose max-w-none" v-html="regulation.content" />
    </template>

    <div v-else class="text-center py-20 text-slate-400">
      制度文件不存在
      <router-link to="/regulation" class="text-primary mt-4 block">返回列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getRegulationDetail } from '@/api/portal'

const route = useRoute()
const regulation = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getRegulationDetail(route.params.id)
    regulation.value = res.data
  } finally {
    loading.value = false
  }
})
</script>
