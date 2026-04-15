<template>
  <div class="bg-white rounded-xl overflow-hidden group hover:shadow-xl transition-all border border-transparent hover:border-primary/10">
    <router-link :to="`/experiment/${experiment.expId}`">
      <div class="h-48 relative overflow-hidden">
        <img
          v-if="experiment.coverImage"
          :src="experiment.coverImage"
          :alt="experiment.expName"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div v-else class="w-full h-full bg-surface-container flex items-center justify-center">
          <span class="material-symbols-outlined text-5xl text-outline">biotech</span>
        </div>
        <div
          class="absolute top-4 left-4 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter"
          :class="typeBadgeClass"
        >
          {{ experiment.expCategory || experiment.expType || 'web' }}
        </div>
      </div>
    </router-link>
    <div class="p-6">
      <router-link :to="`/experiment/${experiment.expId}`">
        <h3 class="font-headline font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {{ experiment.expName }}
        </h3>
      </router-link>
      <div class="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">visibility</span>
          {{ formatCount(experiment.viewCount) }}
        </span>
        <span class="flex items-center gap-1 text-tertiary font-bold">
          <span
            class="material-symbols-outlined text-sm"
            style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;"
          >star</span>
          {{ experiment.rating ?? '4.5' }}
        </span>
      </div>
      <div class="w-full bg-surface-container h-1 rounded-full mb-5">
        <div class="bg-primary h-full rounded-full transition-all" :style="{ width: progressWidth }"></div>
      </div>
      <router-link
        :to="`/experiment/${experiment.expId}`"
        class="block w-full py-2.5 text-center bg-surface-container-low text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-sm"
      >
        启动
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ experiment: { type: Object, required: true } })

const typeColors = [
  'bg-primary',
  'bg-tertiary',
  'bg-secondary',
  'bg-on-primary-fixed-variant'
]
const typeBadgeClass = computed(() => {
  const id = props.experiment.expId || 0
  return typeColors[id % typeColors.length]
})

function formatCount(n) {
  if (!n) return '0'
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

const progressWidth = computed(() => {
  const count = props.experiment.viewCount || 0
  const pct = Math.min(count / 5000, 0.92)
  return `${Math.max(Math.round(pct * 100), 12)}%`
})
</script>

