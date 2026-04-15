<template>
  <div class="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
    <!-- 分类侧边栏 -->
    <aside class="w-full lg:w-56 flex-shrink-0">
      <div class="card p-4">
        <h3 class="font-headline font-bold text-on-surface mb-3 text-sm uppercase tracking-widest">资源分类</h3>
        <ul class="space-y-1">
          <li>
            <button
              class="w-full text-left px-3 py-2 rounded-lg text-sm transition"
              :class="!activeCategoryId ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface'"
              @click="selectCategory(null)"
            >全部资源</button>
          </li>
          <li v-for="cat in categories" :key="cat.categoryId">
            <CategoryTreeItem :category="cat" :selected-id="activeCategoryId" @select="selectCategory" />
          </li>
        </ul>
      </div>
    </aside>

    <!-- 主内容 -->
    <div class="flex-1">
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索资源..."
          class="flex-1 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          @keyup.enter="doSearch"
        />
        <select
          v-model="resType"
          class="px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none"
          @change="doSearch"
        >
          <option value="">全部类型</option>
          <option value="VIDEO">视频</option>
          <option value="PDF">PDF</option>
          <option value="IMAGE">图片</option>
          <option value="OTHER">其他</option>
        </select>
        <button class="btn-primary px-6" @click="doSearch">搜索</button>
      </div>

      <!-- 加载 -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="h-40 bg-surface-container rounded-xl animate-pulse" />
      </div>

      <!-- 资源卡片列表 -->
      <div v-else-if="resources.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="r in resources"
          :key="r.resourceId"
          class="card p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
          @click="$router.push(`/resource/${r.resourceId}`)"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">{{ typeIcon(r.resourceType) }}</span>
            </div>
              <span class="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary uppercase">{{ r.resourceType || 'FILE' }}</span>
          </div>
          <h4 class="font-semibold text-on-surface line-clamp-2 mb-2">{{ r.resourceName }}</h4>
          <p class="text-xs text-slate-400 line-clamp-2">{{ r.description || '无简介' }}</p>
          <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
            <span><span class="material-symbols-outlined text-xs align-text-bottom">visibility</span> {{ r.viewCount }}</span>
            <span><span class="material-symbols-outlined text-xs align-text-bottom">download</span> {{ r.downloadCount }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-24 text-slate-400">暂无资源</div>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CategoryTreeItem from '@/components/CategoryTreeItem.vue'
import { getResourceCategories, getResourceList } from '@/api/portal'

const categories = ref([])
const resources = ref([])
const loading = ref(true)
const keyword = ref('')
const resType = ref('')
const activeCategoryId = ref(null)
const page = ref(1)
const total = ref(0)
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

const typeIconMap = { VIDEO: 'videocam', PDF: 'picture_as_pdf', IMAGE: 'image', OTHER: 'folder' }
function typeIcon(t) { return typeIconMap[t] || 'description' }

async function loadData() {
  loading.value = true
  try {
    const res = await getResourceList({
      keyword: keyword.value || undefined,
      resourceType: resType.value || undefined,
      categoryId: activeCategoryId.value || undefined,
      pageNum: page.value,
      pageSize,
    })
    resources.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function selectCategory(id) {
  activeCategoryId.value = id
  page.value = 1
  loadData()
}

function doSearch() {
  page.value = 1
  loadData()
}

function changePage(p) {
  page.value = p
  loadData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  const res = await getResourceCategories()
  categories.value = res.data || []
  loadData()
})
</script>
