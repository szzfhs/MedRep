<template>
  <div>
    <!-- Hero -->
    <div class="relative bg-primary text-white py-20 px-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-extrabold font-headline mb-4">{{ center.centerName || 'SimHub 虚拟仿真实验教学中心' }}</h1>
        <p class="text-white/80 text-lg">面向医学教育的高质量虚拟仿真实验教学平台</p>
      </div>
    </div>

    <!-- 简介 -->
    <div class="max-w-4xl mx-auto px-6 py-12">
      <div v-if="loading">
        <div class="space-y-3"><div v-for="i in 5" :key="i" class="h-4 bg-surface-container rounded animate-pulse" /></div>
      </div>
      <template v-else>
        <section class="mb-12">
          <h2 class="text-2xl font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">info</span>中心简介
          </h2>
          <div class="prose max-w-none" v-html="center.description" />
        </section>

        <section v-if="center.orgStructure" class="mb-12">
          <h2 class="text-2xl font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">account_tree</span>组织架构
          </h2>
          <div class="prose max-w-none" v-html="center.orgStructure" />
        </section>

        <section v-if="center.teamIntro" class="mb-12">
          <h2 class="text-2xl font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">groups</span>团队介绍
          </h2>
          <div class="prose max-w-none" v-html="center.teamIntro" />
        </section>

        <section v-if="center.contactInfo" class="mb-12">
          <h2 class="text-2xl font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">contact_mail</span>联系方式
          </h2>
          <div class="prose max-w-none" v-html="center.contactInfo" />
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCenterInfo } from '@/api/portal'

const center = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getCenterInfo()
    center.value = res.data || {}
  } finally {
    loading.value = false
  }
})
</script>
