<template>
  <div>
    <!-- 页面头部 -->
    <section class="bg-primary text-white py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-extrabold font-headline mb-2">虚拟实验大厅</h1>
        <p class="text-blue-200">探索丰富的虚拟仿真实验，开启数字化学习之旅</p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- 左侧分类树 -->
        <aside class="w-full md:w-56 flex-shrink-0">
          <div class="card p-4">
            <h3 class="font-headline font-bold text-on-surface mb-4">实验分类</h3>
            <ul class="space-y-1">
              <li>
                <button
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="selectedCategoryId === null ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface'"
                  @click="selectCategory(null)"
                >
                  全部实验
                </button>
              </li>
              <CategoryTreeItem
                v-for="cat in categories"
                :key="cat.categoryId"
                :category="cat"
                :selected-id="selectedCategoryId"
                @select="selectCategory"
              />
            </ul>
          </div>
        </aside>

        <!-- 右侧实验列表 -->
        <div class="flex-1">
          <!-- 搜索 & 筛选 -->
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <div class="flex items-center bg-white border border-outline-variant rounded-full px-4 py-2 flex-1 max-w-sm shadow-sm">
              <span class="material-symbols-outlined text-outline text-lg mr-2">search</span>
              <input
                v-model="keyword"
                placeholder="搜索实验名称..."
                class="bg-transparent border-none focus:outline-none text-sm w-full"
                @keyup.enter="handleSearch"
              />
            </div>
            <select
              v-model="expType"
              class="border border-outline-variant rounded-full px-4 py-2 text-sm bg-white focus:outline-none focus:border-primary"
              @change="handleSearch"
            >
              <option value="">全部类型</option>
              <option value="web">Web仿真</option>
              <option value="exe">客户端</option>
              <option value="video">视频</option>
            </select>
          </div>

          <!-- 实验卡片网格 -->
          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="card h-64 bg-surface-container animate-pulse" />
          </div>
          <div v-else-if="experiments.length === 0" class="text-center py-20 text-slate-400">
            <span class="material-symbols-outlined text-6xl block mb-4">science</span>
            <p>暂无实验数据</p>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ExperimentCard v-for="exp in experiments" :key="exp.expId" :experiment="exp" />
          </div>

          <!-- 分页 -->
          <div v-if="total > pageSize" class="flex justify-center gap-2 mt-10">
            <button
              v-for="p in totalPages"
              :key="p"
              class="w-9 h-9 rounded-full text-sm font-medium transition-colors"
              :class="p === page ? 'bg-primary text-white' : 'bg-white border border-outline-variant hover:border-primary hover:text-primary'"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExperimentCategories, getExperimentList } from '@/api/portal'
import ExperimentCard from '@/components/ExperimentCard.vue'
import CategoryTreeItem from '@/components/CategoryTreeItem.vue'

const route = useRoute()
const router = useRouter()

const categories = ref([])
const experiments = ref([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const pageSize = 12
const keyword = ref(route.query.keyword || '')
const expType = ref('')
const selectedCategoryId = ref(null)

const totalPages = computed(() => Math.ceil(total.value / pageSize))

async function loadCategories() {
  const res = await getExperimentCategories()
  categories.value = res.data || []
}

async function loadExperiments() {
  loading.value = true
  try {
    const res = await getExperimentList({
      pageNum: page.value,
      pageSize,
      expName: keyword.value || undefined,
      expType: expType.value || undefined,
      categoryId: selectedCategoryId.value || undefined,
      status: '1'
    })
    experiments.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function selectCategory(id) { selectedCategoryId.value = id; page.value = 1; loadExperiments() }
function handleSearch() { page.value = 1; loadExperiments() }
function goPage(p) { page.value = p; loadExperiments(); window.scrollTo(0, 0) }

onMounted(() => {
  loadCategories()
  loadExperiments()
})
</script>
