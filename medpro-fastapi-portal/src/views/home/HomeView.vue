<template>
  <div>
    <!-- Hero 区域 -->
    <section class="relative h-[600px] w-full overflow-hidden">
      <img src="/images/banner1.jpeg" alt="VR医学模拟" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent"></div>
      <div class="relative max-w-7xl mx-auto px-8 h-full flex flex-col justify-center items-start text-white">
        <div class="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">emergency</span>
          <span class="text-xs font-bold tracking-widest uppercase">虚拟教育的领航者</span>
        </div>
        <h1 class="font-headline text-5xl md:text-7xl font-extrabold leading-tight max-w-2xl tracking-tighter mb-8">
          <span class="text-primary-fixed">{{ centerInfo.centerName || '心血管介入' }}</span>虚拟仿真实验教学中心
        </h1>
        <p class="text-xl text-blue-50/80 max-w-xl mb-10 leading-relaxed">
          {{ centerInfo.centerSlogan || '体验身临其境的临床模拟，旨在架起课堂理论与真实医疗实践之间的桥梁。' }}
        </p>
        <div class="flex gap-4">
          <router-link
            to="/experiment"
            class="bg-gradient-to-r from-primary to-primary-container px-8 py-4 rounded-full font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all"
          >
            开始实验
          </router-link>
          <router-link
            to="/course"
            class="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full font-bold text-white hover:bg-white/20 transition-all"
          >
            查看课程
          </router-link>
        </div>
      </div>
    </section>

    <!-- 中心介绍 & 快速导航 (Bento Grid) -->
    <section class="max-w-7xl mx-auto px-8 -mt-20 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- 中心介绍 -->
      <div class="md:col-span-8 bg-white p-10 rounded-xl shadow-xl flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 text-primary">
            <span class="material-symbols-outlined">account_balance</span>
            <span class="font-headline font-bold text-sm uppercase tracking-widest">关于实验室</span>
          </div>
          <h2 class="font-headline text-3xl font-bold text-on-surface mb-6">
            {{ centerInfo.fullName || centerInfo.centerName || '大学虚拟仿真实验教学中心' }}
          </h2>
          <p class="text-on-surface-variant leading-relaxed text-base mb-6">
            {{ centerInfo.introduction || centerInfo.centerDesc || '我们的实验室致力于通过沉浸式技术推进医学教育，通过集成人工智能驱动的患者模型和高保真3D环境，为学生提供安全、可重复的临床操作训练平台，让他们在进入真实医院环境之前掌握复杂的临床操作流程。' }}
          </p>
        </div>
        <div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div v-for="stat in stats" :key="stat.label">
            <div class="font-extrabold text-primary text-4xl">{{ stat.value }}</div>
            <div class="text-xs font-medium text-slate-500 uppercase tracking-tighter mt-1">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      <!-- 快速导航 -->
      <div class="md:col-span-4">
        <div class="bg-primary p-8 rounded-xl text-white h-full flex flex-col justify-between">
          <h3 class="font-headline text-xl font-bold">快速导航</h3>
          <div class="space-y-3 mt-6">
            <router-link
              to="/register"
              class="w-full flex items-center justify-between bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-all group"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined">person_add</span>
                <span class="font-medium">新生门户</span>
              </div>
              <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </router-link>
            <router-link
              to="/experiment"
              class="w-full flex items-center justify-between bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-all group"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined">travel_explore</span>
                <span class="font-medium">实验大厅</span>
              </div>
              <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </router-link>
            <router-link
              to="/course"
              class="w-full flex items-center justify-between bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-all group"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined">menu_book</span>
                <span class="font-medium">浏览课程</span>
              </div>
              <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </router-link>
          </div>
          <div class="mt-8 pt-6 border-t border-white/10">
            <p class="text-xs text-blue-200">
              需要即时帮助？访问我们的
              <router-link to="/help" class="underline text-white">帮助中心</router-link>。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 新闻公告 (非对称网格) -->
    <section class="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4">
        <h2 class="font-headline text-4xl font-extrabold tracking-tight mb-6">
          实验室<br /><span class="text-primary">公告</span>
        </h2>
        <p class="text-on-surface-variant mb-8 leading-relaxed">
          随时了解最新的学术研究、软件更新和平台活动。
        </p>
        <router-link
          to="/news"
          class="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
        >
          查看存档 <span class="material-symbols-outlined">trending_flat</span>
        </router-link>
      </div>
      <div class="lg:col-span-8 space-y-2">
        <router-link
          v-for="news in latestNews"
          :key="news.newsId"
          :to="`/news/${news.newsId}`"
          class="group flex items-center gap-6 p-6 rounded-xl hover:bg-surface-container-low transition-all"
        >
          <div class="flex flex-col items-center justify-center bg-surface-container-high px-4 py-3 rounded-lg text-primary min-w-[72px]">
            <span class="text-xl font-bold leading-none">{{ getDay(news.publishTime) }}</span>
            <span class="text-[10px] uppercase font-bold tracking-widest mt-1">{{ getMonth(news.publishTime) }}</span>
          </div>
          <div class="flex-grow min-w-0">
            <span class="text-xs font-bold text-primary uppercase tracking-widest mb-1 block">
              {{ news.newsType || '新闻动态' }}
            </span>
            <h4 class="font-headline font-bold text-base group-hover:text-primary transition-colors line-clamp-2">
              {{ news.title }}
            </h4>
          </div>
          <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors flex-shrink-0">
            arrow_outward
          </span>
        </router-link>
        <div v-if="!latestNews.length" class="text-center py-16 text-slate-400">
          <span class="material-symbols-outlined text-5xl block mb-3">article</span>
          暂无公告
        </div>
      </div>
    </section>

    <!-- 热门实验 -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-7xl mx-auto px-8">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 class="font-headline text-3xl font-extrabold tracking-tight mb-3">热门实验</h2>
            <p class="text-on-surface-variant">本学期访问量最高的模拟实验项目。</p>
          </div>
          <router-link
            to="/experiment"
            class="mt-6 md:mt-0 text-sm text-primary font-bold hover:underline flex items-center gap-1"
          >
            查看全部 <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </router-link>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ExperimentCard v-for="exp in featuredExperiments" :key="exp.expId" :experiment="exp" />
        </div>
        <div v-if="!featuredExperiments.length" class="text-center py-16 text-slate-400">
          <span class="material-symbols-outlined text-5xl block mb-3">science</span>
          暂无实验数据
        </div>
      </div>
    </section>

    <!-- 最新课程 -->
    <section class="max-w-7xl mx-auto px-8 py-24">
      <div class="flex items-end justify-between mb-10">
        <div>
          <h2 class="font-headline text-3xl font-extrabold tracking-tight">最新课程</h2>
          <div class="h-1 w-16 bg-primary mt-3 rounded-full"></div>
        </div>
        <router-link
          to="/course"
          class="text-sm text-primary font-bold hover:underline flex items-center gap-1"
        >
          查看全部 <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CourseCard v-for="course in latestCourses" :key="course.courseId" :course="course" />
      </div>
      <div v-if="!latestCourses.length" class="text-center py-16 text-slate-400">
        <span class="material-symbols-outlined text-5xl block mb-3">menu_book</span>
        暂无课程数据
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCenterInfo, getExperimentList, getCourseList, getNewsList } from '@/api/portal'
import ExperimentCard from '@/components/ExperimentCard.vue'
import CourseCard from '@/components/CourseCard.vue'

const centerInfo = ref({})
const featuredExperiments = ref([])
const latestCourses = ref([])
const latestNews = ref([])

const stats = ref([
  { value: '500+', label: '活跃实验项目' },
  { value: '1.2万', label: '在校学生' },
  { value: '98%', label: '实验成功率' }
])

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
function getDay(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).getDate()
}
function getMonth(dateStr) {
  if (!dateStr) return ''
  return monthNames[new Date(dateStr).getMonth()] ?? ''
}

onMounted(async () => {
  const [centerRes, expRes, courseRes, newsRes] = await Promise.allSettled([
    getCenterInfo(),
    getExperimentList({ pageSize: 4, pageNum: 1, status: '1' }),
    getCourseList({ pageSize: 4, pageNum: 1, status: '1' }),
    getNewsList({ pageSize: 3, pageNum: 1, status: '1' })
  ])

  if (centerRes.status === 'fulfilled') centerInfo.value = centerRes.value?.data || {}
  if (expRes.status === 'fulfilled') featuredExperiments.value = expRes.value?.rows || []
  if (courseRes.status === 'fulfilled') latestCourses.value = courseRes.value?.rows || []
  if (newsRes.status === 'fulfilled') latestNews.value = newsRes.value?.rows || []
})
</script>
