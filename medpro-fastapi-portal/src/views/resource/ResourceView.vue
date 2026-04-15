<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div v-if="loading" class="space-y-4">
      <div class="h-6 w-1/2 bg-surface-container rounded animate-pulse" />
      <div class="h-96 bg-surface-container rounded animate-pulse" />
    </div>

    <template v-else-if="resource">
      <!-- 面包屑 -->
      <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <router-link to="/resource" class="hover:text-primary">资源中心</router-link>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-on-surface">{{ resource.resourceName }}</span>
      </nav>

      <h1 class="text-2xl font-extrabold font-headline text-on-surface mb-4">{{ resource.resourceName }}</h1>
      <div class="flex items-center gap-4 text-sm text-slate-400 mb-6">
        <span><span class="material-symbols-outlined text-sm align-text-bottom">visibility</span> {{ resource.viewCount }} 次浏览</span>
        <span><span class="material-symbols-outlined text-sm align-text-bottom">download</span> {{ resource.downloadCount }} 次下载</span>
        <span class="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold uppercase">{{ resource.resourceType }}</span>
      </div>

      <!-- 视频播放器 -->
      <template v-if="resource.resourceType === 'VIDEO' && resource.fileUrl">
        <video controls class="w-full rounded-xl mb-6 bg-black" :src="resource.fileUrl">
          您的浏览器不支持视频播放
        </video>
      </template>

      <!-- PDF 内嵌 -->
      <template v-else-if="resource.resourceType === 'PDF' && resource.fileUrl">
        <iframe :src="resource.fileUrl" class="w-full h-[600px] rounded-xl border border-outline-variant mb-6" />
      </template>

      <!-- 图片 -->
      <template v-else-if="resource.resourceType === 'IMAGE' && resource.fileUrl">
        <img :src="resource.fileUrl" class="w-full rounded-xl mb-6 object-contain max-h-[600px]" />
      </template>

      <!-- 其他文件下载 -->
      <template v-else-if="resource.fileUrl">
        <div class="card p-8 text-center mb-6">
          <span class="material-symbols-outlined text-6xl text-primary mb-4 block">insert_drive_file</span>
          <a
            :href="resource.fileUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary inline-flex items-center gap-2"
            @click="incremented = true"
          >
            <span class="material-symbols-outlined">download</span>下载文件
          </a>
        </div>
      </template>

      <!-- 描述 -->
      <div class="prose max-w-none" v-html="resource.description" />
    </template>

    <div v-else class="text-center py-20 text-slate-400">
      <p>资源不存在</p>
      <router-link to="/resource" class="text-primary mt-4 block">返回资源中心</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getResourceDetail } from '@/api/portal'

const route = useRoute()
const resource = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getResourceDetail(route.params.id)
    resource.value = res.data
  } finally {
    loading.value = false
  }
})
</script>
