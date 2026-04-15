<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- 加载状态 -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-2/3 bg-surface-container rounded animate-pulse" />
      <div class="h-64 bg-surface-container rounded animate-pulse" />
    </div>

    <template v-else-if="experiment">
      <!-- 面包屑 -->
      <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <router-link to="/experiment" class="hover:text-primary">实验大厅</router-link>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-on-surface">{{ experiment.expName }}</span>
      </nav>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 主内容 -->
        <div class="flex-1">
          <div class="relative h-64 md:h-80 rounded-xl overflow-hidden bg-surface-container mb-6">
            <img v-if="experiment.coverImage" :src="experiment.coverImage" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="material-symbols-outlined text-8xl text-outline">biotech</span>
            </div>
          </div>

          <h1 class="text-3xl font-extrabold font-headline text-on-surface mb-4">{{ experiment.expName }}</h1>

          <div class="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">visibility</span>{{ experiment.viewCount }} 次浏览
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">person</span>{{ experiment.participateCount }} 次参与
            </span>
            <span class="bg-primary/10 text-primary px-3 py-0.5 rounded-full font-medium uppercase">
              {{ experiment.expType }}
            </span>
          </div>

          <div class="prose max-w-none" v-html="experiment.description" />
        </div>

        <!-- 侧边操作栏 -->
        <aside class="w-full lg:w-72 flex-shrink-0">
          <div class="card p-6 sticky top-24">
            <h3 class="font-headline font-bold text-lg mb-4">{{ experiment.expName }}</h3>

            <template v-if="experiment.launchUrl">
              <a
                :href="experiment.launchUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="block btn-primary text-center mb-3"
                @click="handleParticipate"
              >
                <span class="material-symbols-outlined align-text-bottom mr-1">rocket_launch</span>
                启动实验
              </a>
            </template>
            <div v-else class="text-center text-slate-400 text-sm py-4">实验暂未上线</div>

            <button
              v-if="auth.isLoggedIn && !participated"
              class="w-full btn-outline text-sm mt-2"
              @click="handleParticipate"
            >
              标记已参与
            </button>
            <p v-if="participated" class="text-center text-sm text-green-500 mt-2 flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-sm">check_circle</span>已参与
            </p>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="text-center py-20 text-slate-400">
      <p>实验不存在或已下线</p>
      <router-link to="/experiment" class="text-primary mt-4 block">返回实验大厅</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getExperimentDetail, participateExperiment } from '@/api/portal'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const experiment = ref(null)
const loading = ref(true)
const participated = ref(false)

onMounted(async () => {
  try {
    const res = await getExperimentDetail(route.params.id)
    experiment.value = res.data
  } finally {
    loading.value = false
  }
})

async function handleParticipate() {
  if (!auth.isLoggedIn || participated.value) return
  try {
    await participateExperiment(route.params.id)
    participated.value = true
    if (experiment.value) experiment.value.participateCount++
  } catch {
    // ignore if already participated
    participated.value = true
  }
}
</script>
