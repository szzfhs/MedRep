<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div v-if="loading" class="space-y-4">
      <div class="h-8 w-2/3 bg-surface-container rounded animate-pulse" />
      <div class="h-48 bg-surface-container rounded animate-pulse" />
    </div>

    <template v-else-if="course">
      <!-- 面包屑 -->
      <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <router-link to="/course" class="hover:text-primary">课程中心</router-link>
        <span class="material-symbols-outlined text-sm">chevron_right</span>
        <span class="text-on-surface">{{ course.courseName }}</span>
      </nav>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 主区域 -->
        <div class="flex-1">
          <div class="relative h-64 rounded-xl overflow-hidden bg-surface-container mb-6">
            <img v-if="course.coverImage" :src="course.coverImage" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="material-symbols-outlined text-8xl text-outline">school</span>
            </div>
          </div>

          <h1 class="text-3xl font-extrabold font-headline text-on-surface mb-3">{{ course.courseName }}</h1>
          <p class="text-slate-400 text-sm mb-6 flex items-center gap-3">
            <span><span class="material-symbols-outlined text-sm align-text-bottom">group</span> {{ course.enrollCount }} 人已报名</span>
          </p>

          <div class="prose max-w-none mb-8" v-html="course.description" />

          <!-- 章节树 -->
          <h2 class="text-xl font-bold font-headline text-on-surface mb-4">课程章节</h2>
          <div v-if="sections.length" class="space-y-2">
            <div v-for="sec in topSections" :key="sec.sectionId">
              <SectionItem :section="sec" :all-sections="sections" />
            </div>
          </div>
          <p v-else class="text-slate-400">暂无章节</p>
        </div>

        <!-- 侧边栏 -->
        <aside class="w-full lg:w-72 flex-shrink-0">
          <div class="card p-6 sticky top-24">
            <h3 class="font-headline font-bold text-lg mb-4">{{ course.courseName }}</h3>
            <template v-if="!enrolled">
              <button class="btn-primary w-full" @click="handleEnroll">
                <span class="material-symbols-outlined align-text-bottom mr-1">add_circle</span>
                报名课程
              </button>
              <p v-if="enrollMsg" class="text-red-400 text-sm mt-2">{{ enrollMsg }}</p>
            </template>
            <div v-else class="text-center text-green-500 py-4 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">check_circle</span>已报名，继续学习
            </div>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="text-center py-20 text-slate-400">课程不存在</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRoute } from 'vue-router'
import { getCourseDetail, enrollCourse } from '@/api/portal'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const course = ref(null)
const sections = ref([])
const loading = ref(true)
const enrolled = ref(false)
const enrollMsg = ref('')

const topSections = computed(() => sections.value.filter(s => !s.parentId))

// Inline recursive section component
const SectionItem = defineComponent({
  name: 'SectionItem',
  props: { section: Object, allSections: Array },
  setup(props) {
    const expanded = ref(false)
    const children = computed(() => props.allSections.filter(s => s.parentId === props.section.sectionId))
    return () => h('div', { class: 'border border-outline-variant rounded-lg overflow-hidden' }, [
      h('button', {
        class: 'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container transition',
        onClick: () => { expanded.value = !expanded.value }
      }, [
        h('span', { class: 'material-symbols-outlined text-sm text-primary' }, expanded.value ? 'expand_less' : 'expand_more'),
        h('span', { class: 'font-medium text-on-surface flex-1' }, props.section.title),
        props.section.sectionType && h('span', { class: 'text-xs text-slate-400' }, props.section.sectionType),
      ]),
      expanded.value && children.value.length && h('div', { class: 'pl-8 border-t border-outline-variant divide-y divide-outline-variant' },
        children.value.map(c => h(SectionItem, { key: c.sectionId, section: c, allSections: props.allSections }))
      )
    ])
  }
})

onMounted(async () => {
  try {
    const res = await getCourseDetail(route.params.id)
    course.value = res.data?.course || res.data
    sections.value = res.data?.sections || []
    enrolled.value = res.data?.enrolled || false
  } finally {
    loading.value = false
  }
})

async function handleEnroll() {
  if (!auth.isLoggedIn) {
    enrollMsg.value = '请先登录'
    return
  }
  try {
    await enrollCourse(route.params.id)
    enrolled.value = true
    if (course.value) course.value.enrollCount++
  } catch (e) {
    enrollMsg.value = e?.response?.data?.message || '报名失败'
  }
}
</script>
