<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold font-headline text-on-surface mb-2">实验记录</h1>
    <p class="text-slate-400 mb-6">我参与过的所有虚拟仿真实验</p>

    <!-- 筛选区 -->
    <div class="flex flex-wrap gap-3 mb-6">
      <select
        v-model="statusFilter"
        class="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-white text-on-surface focus:outline-none focus:border-primary"
      >
        <option value="">全部状态</option>
        <option value="completed">已完成</option>
        <option value="started">进行中</option>
      </select>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-16 bg-surface-container rounded-xl animate-pulse" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="!filteredRows.length" class="text-center py-24 text-slate-400">
      <span class="material-symbols-outlined text-5xl mb-3 block">biotech</span>
      <p>暂无实验记录</p>
      <router-link to="/experiment" class="btn-primary inline-block mt-4">去实验大厅</router-link>
    </div>

    <!-- 列表 -->
    <div v-else class="space-y-3">
      <div
        v-for="row in filteredRows"
        :key="row.participationId"
        class="card p-4 flex items-center gap-4"
      >
        <div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
          <img v-if="row.coverImage" :src="row.coverImage" class="w-full h-full object-cover" />
          <span v-else class="material-symbols-outlined text-2xl text-outline">biotech</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-on-surface truncate">{{ row.expName }}</p>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ formatDate(row.startTime) }}
            <span v-if="row.durationSeconds"> · {{ formatDuration(row.durationSeconds) }}</span>
          </p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span
            class="text-xs font-medium px-2 py-0.5 rounded-full"
            :class="row.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'"
          >
            {{ row.status === 'completed' ? '已完成' : '进行中' }}
          </span>
          <a
            v-if="row.launchUrl"
            :href="row.launchUrl"
            target="_blank"
            rel="noopener"
            class="text-xs text-primary hover:underline"
          >
            再次启动
          </a>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="flex justify-center gap-2 mt-8">
      <button
        class="btn-outline text-sm px-4"
        :disabled="page <= 1"
        @click="page--; load()"
      >上一页</button>
      <span class="text-sm text-slate-500 self-center">{{ page }} / {{ totalPages }}</span>
      <button
        class="btn-outline text-sm px-4"
        :disabled="page >= totalPages"
        @click="page++; load()"
      >下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyExperiments } from '@/api/student'

const rows = ref([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const statusFilter = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)

const filteredRows = computed(() =>
  statusFilter.value
    ? rows.value.filter(r => r.status === statusFilter.value)
    : rows.value
)

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDuration(s) {
  if (!s) return ''
  if (s < 60) return `${s}秒`
  if (s < 3600) return `${Math.round(s / 60)}分钟`
  return `${Math.round(s / 3600)}小时`
}

async function load() {
  loading.value = true
  try {
    const res = await getMyExperiments({ pageNum: page.value, pageSize })
    const d = res.data || {}
    rows.value = d.rows || []
    total.value = d.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
