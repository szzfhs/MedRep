<template>
  <div class="flex flex-col min-h-[calc(100vh-64px)]">
    <!-- 顶部课程信息栏 -->
    <div class="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-[64px] z-30">
      <div class="flex items-center gap-3 min-w-0">
        <button class="text-slate-500 hover:text-primary" @click="$router.back()">
          <span class="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 class="font-semibold text-on-surface text-base truncate">
          {{ courseData?.courseName || '课程加载中…' }}
        </h1>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <div class="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span>进度</span>
          <div class="w-24 h-1.5 rounded-full bg-outline-variant overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all" :style="{ width: progress + '%' }" />
          </div>
          <span class="font-medium text-on-surface">{{ progress }}%</span>
        </div>
        <router-link to="/student/courses" class="text-sm text-primary hover:underline hidden sm:inline">
          我的课程
        </router-link>
      </div>
    </div>

    <!-- 主体：左章节 + 右内容 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧章节导航 -->
      <aside
        class="hidden md:flex flex-col w-72 shrink-0 border-r bg-white overflow-y-auto sticky top-[116px] h-[calc(100vh-116px)]"
      >
        <div class="p-4 border-b">
          <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">课程目录</p>
        </div>
        <nav class="p-3 flex-1 overflow-y-auto">
          <template v-if="loading">
            <div v-for="i in 5" :key="i" class="h-8 rounded bg-surface-container animate-pulse mb-2" />
          </template>
          <template v-else>
            <SectionTreeItem
              v-for="sec in sections"
              :key="sec.sectionId"
              :section="sec"
              :current-id="currentSectionId"
              @select="selectSection"
            />
          </template>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="p-8">
          <div class="h-8 w-48 bg-surface-container rounded animate-pulse mb-4" />
          <div class="h-4 w-full bg-surface-container rounded animate-pulse mb-2 max-w-xl" />
          <div class="h-4 w-3/4 bg-surface-container rounded animate-pulse max-w-xl" />
        </div>

        <div v-else-if="!currentSection" class="p-8 text-slate-400 text-center">
          <span class="material-symbols-outlined text-5xl mb-3 block">menu_book</span>
          <p>请从左侧目录选择章节开始学习</p>
        </div>

        <div v-else class="max-w-3xl mx-auto p-8">
          <!-- 章节标题 -->
          <div class="mb-6">
            <p class="text-xs text-slate-400 mb-1">
              {{ currentSection.sectionType === 'chapter' ? '章' : '节' }}
            </p>
            <h2 class="text-xl font-bold text-on-surface">{{ currentSection.title }}</h2>
            <p v-if="currentSection.description" class="text-slate-500 mt-2 text-sm">
              {{ currentSection.description }}
            </p>
          </div>

          <!-- 内容占位（实际项目中可接入视频/PDF/文字） -->
          <div class="rounded-xl bg-surface-container p-8 text-center text-slate-400 mb-6">
            <span class="material-symbols-outlined text-4xl mb-2 block">play_circle</span>
            <p class="text-sm">此处将显示章节学习内容（视频/文档/文字）</p>
          </div>

          <!-- 标记完成 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm">
              <span
                class="material-symbols-outlined text-base"
                :class="currentSection.completed ? 'text-green-500' : 'text-slate-300'"
              >
                check_circle
              </span>
              <span :class="currentSection.completed ? 'text-green-600' : 'text-slate-400'">
                {{ currentSection.completed ? '已完成本章节' : '尚未标记完成' }}
              </span>
            </div>
            <button
              v-if="!currentSection.completed"
              class="btn-primary text-sm px-5 py-2 flex items-center gap-2"
              :disabled="completing"
              @click="markComplete"
            >
              <span v-if="completing" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
              标记为已完成
            </button>
          </div>

          <!-- 上一节/下一节 -->
          <div class="flex justify-between mt-10 border-t pt-6">
            <button
              v-if="prevSection"
              class="btn-outline text-sm flex items-center gap-1"
              @click="selectSection(prevSection)"
            >
              <span class="material-symbols-outlined text-base">chevron_left</span>
              上一节
            </button>
            <span v-else />
            <button
              v-if="nextSection"
              class="btn-primary text-sm flex items-center gap-1"
              @click="selectSection(nextSection)"
            >
              下一节
              <span class="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端底部章节按钮 -->
    <div class="md:hidden border-t bg-white px-4 py-3 flex gap-3">
      <button
        class="flex-1 btn-outline text-sm"
        @click="mobileNavOpen = !mobileNavOpen"
      >
        <span class="material-symbols-outlined text-base mr-1">list</span>目录
      </button>
      <button
        v-if="currentSection && !currentSection.completed"
        class="flex-1 btn-primary text-sm"
        :disabled="completing"
        @click="markComplete"
      >
        标记完成
      </button>
    </div>

    <!-- 移动端章节抽屉 -->
    <transition name="slide-up">
      <div
        v-if="mobileNavOpen"
        class="md:hidden fixed inset-0 z-40 bg-black/40"
        @click="mobileNavOpen = false"
      >
        <div
          class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto p-4"
          @click.stop
        >
          <div class="flex items-center justify-between mb-3">
            <p class="font-semibold text-on-surface">课程目录</p>
            <button @click="mobileNavOpen = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <SectionTreeItem
            v-for="sec in sections"
            :key="sec.sectionId"
            :section="sec"
            :current-id="currentSectionId"
            @select="(s) => { selectSection(s); mobileNavOpen = false }"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCourseLearnDetail, completeSectionProgress } from '@/api/student'
import SectionTreeItem from './components/SectionTreeItem.vue'

const route = useRoute()
const courseId = Number(route.params.id)

const loading = ref(true)
const completing = ref(false)
const mobileNavOpen = ref(false)

const courseData = ref(null)
const sections = ref([])
const doneSections = ref(0)
const totalSections = ref(0)
const currentSectionId = ref(null)

const progress = computed(() => {
  if (!totalSections.value) return 0
  return Math.round(doneSections.value * 100 / totalSections.value)
})

// 拍平章节树用于上一/下一节导航
function flattenSections(nodes) {
  const result = []
  for (const n of nodes) {
    if (n.sectionType !== 'chapter') result.push(n)
    if (n.children?.length) result.push(...flattenSections(n.children))
  }
  return result
}

const flatSections = computed(() => flattenSections(sections.value))

const currentSection = computed(() =>
  currentSectionId.value ? findSection(sections.value, currentSectionId.value) : null
)

const currentIndex = computed(() =>
  flatSections.value.findIndex(s => s.sectionId === currentSectionId.value)
)

const prevSection = computed(() =>
  currentIndex.value > 0 ? flatSections.value[currentIndex.value - 1] : null
)

const nextSection = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < flatSections.value.length - 1
    ? flatSections.value[currentIndex.value + 1]
    : null
)

function findSection(nodes, id) {
  for (const n of nodes) {
    if (n.sectionId === id) return n
    if (n.children?.length) {
      const found = findSection(n.children, id)
      if (found) return found
    }
  }
  return null
}

function selectSection(sec) {
  if (sec.sectionType !== 'chapter') {
    currentSectionId.value = sec.sectionId
  }
}

async function markComplete() {
  if (!currentSection.value || completing.value) return
  completing.value = true
  try {
    await completeSectionProgress(currentSectionId.value)
    // 本地更新状态
    const sec = findSection(sections.value, currentSectionId.value)
    if (sec) {
      sec.completed = true
      doneSections.value++
    }
    // 自动跳到下一节
    if (nextSection.value) {
      selectSection(nextSection.value)
    }
  } finally {
    completing.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getCourseLearnDetail(courseId)
    const d = res.data || {}
    courseData.value = d.course
    sections.value = d.sections || []
    doneSections.value = d.doneSections || 0
    totalSections.value = d.course?.totalSections || 0

    // 默认选第一个叶子节点
    if (flatSections.value.length) {
      currentSectionId.value = flatSections.value[0].sectionId
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}
</style>
