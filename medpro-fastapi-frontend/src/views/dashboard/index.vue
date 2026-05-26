<template>
  <div class="app-container dashboard-page">

    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <el-avatar :size="60" :src="userStore.avatar" class="user-avatar">
          {{ userStore.nickName?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="welcome-text">
          <h2 class="greeting">{{ greeting }}，{{ userStore.nickName }}！</h2>
          <p class="center-subtitle" v-if="centerInfo.centerName">
            <el-icon><OfficeBuilding /></el-icon>
            {{ centerInfo.centerName }}
          </p>
        </div>
      </div>
      <div class="stat-bar">
        <div v-for="s in statCards" :key="s.key" class="stat-item">
          <el-skeleton v-if="statsLoading" :rows="1" animated style="width:64px" />
          <template v-else>
            <el-statistic :value="s.value">
              <template #title>
                <div class="stat-label">
                  <el-icon :color="s.color"><component :is="s.icon" /></el-icon>
                  {{ s.label }}
                </div>
              </template>
            </el-statistic>
          </template>
        </div>
      </div>
    </div>

    <!-- 快捷功能入口 -->
    <el-row :gutter="14" class="shortcut-row">
      <el-col
        v-for="sc in shortcuts"
        :key="sc.path"
        :xl="4" :lg="4" :md="8" :sm="8" :xs="12"
      >
        <div class="shortcut-card" @click="router.push(sc.path)">
          <span class="sc-icon-wrap" :style="{ background: sc.bg }">
            <el-icon :size="22" :color="sc.color"><component :is="sc.icon" /></el-icon>
          </span>
          <span class="sc-label">{{ sc.title }}</span>
          <el-icon class="sc-arrow" :size="14"><ArrowRight /></el-icon>
        </div>
      </el-col>
    </el-row>

    <!-- 主内容区 -->
    <el-row :gutter="16">

      <!-- 左：最新资讯 -->
      <el-col :xl="16" :lg="16" :md="24" :xs="24">
        <el-card shadow="never" class="content-card news-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Bell /></el-icon> 最新资讯
              </span>
              <el-button type="primary" link size="small" @click="router.push('/simhub/news')">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div v-if="newsLoading" class="skeleton-list">
            <el-skeleton v-for="i in 5" :key="i" :rows="1" animated class="skeleton-item" />
          </div>
          <template v-else>
            <div
              v-for="item in newsList"
              :key="item.newsId"
              class="news-item"
              @click="router.push('/simhub/news')"
            >
              <div class="news-badge">
                <el-tag type="primary" size="small" effect="plain">资讯</el-tag>
              </div>
              <div class="news-body">
                <p class="news-title">{{ item.title }}</p>
                <p class="news-summary" v-if="item.summary">{{ item.summary }}</p>
              </div>
              <div class="news-meta-right">
                <span class="news-time">
                  <el-icon><Clock /></el-icon>
                  {{ parseTime(item.createTime, '{y}-{m}-{d}') }}
                </span>
                <span class="news-views">
                  <el-icon><View /></el-icon> {{ item.viewCount ?? 0 }}
                </span>
              </div>
            </div>
            <el-empty v-if="!newsList.length" description="暂无资讯" :image-size="60" />
          </template>
        </el-card>
      </el-col>

      <!-- 右：操作日志 + 班级 -->
      <el-col :xl="8" :lg="8" :md="24" :xs="24">
        <el-card shadow="never" class="content-card operlog-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Memo /></el-icon> 最近操作
              </span>
              <el-button type="primary" link size="small" @click="router.push('/system/log/operlog')">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div v-if="operlogLoading" class="skeleton-list">
            <el-skeleton v-for="i in 6" :key="i" :rows="1" animated class="skeleton-item" />
          </div>
          <template v-else>
            <div v-for="item in operlogs" :key="item.operId" class="operlog-item">
              <div class="operlog-main">
                <span class="operlog-name">{{ item.title }}</span>
                <el-tag
                  :type="item.status === 0 ? 'success' : 'danger'"
                  size="small"
                  effect="plain"
                >{{ item.status === 0 ? '成功' : '失败' }}</el-tag>
              </div>
              <div class="operlog-sub">
                <el-icon><UserFilled /></el-icon>
                <span class="operlog-operator">{{ item.operName }}</span>
                <span class="operlog-time">
                  {{ parseTime(item.operTime, '{m}-{d} {h}:{i}') }}
                </span>
              </div>
            </div>
            <el-empty v-if="!operlogs.length" description="暂无记录" :image-size="60" />
          </template>
        </el-card>

        <!-- 班级概况 -->
        <el-card shadow="never" class="content-card class-card" style="margin-top:16px">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><School /></el-icon> 班级概况
              </span>
              <el-button type="primary" link size="small" @click="router.push('/simhub/class-admin')">
                管理 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div v-if="classLoading">
            <el-skeleton :rows="3" animated style="padding:16px 18px" />
          </div>
          <template v-else>
            <div v-for="cls in classList" :key="cls.classId" class="class-item">
              <div class="class-icon">
                <el-icon :size="20" color="#0B5394"><School /></el-icon>
              </div>
              <div class="class-info">
                <span class="class-name">{{ cls.className }}</span>
                <span class="class-sub">{{ cls.major }} · {{ cls.grade }}级</span>
              </div>
              <div class="class-badge">
                <el-tag
                  :type="cls.status === '0' ? 'success' : 'info'"
                  size="small"
                  effect="plain"
                >{{ cls.status === '0' ? '进行中' : '已结课' }}</el-tag>
              </div>
            </div>
            <el-empty v-if="!classList.length" description="暂无班级" :image-size="48" />
          </template>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  OfficeBuilding, Bell, Memo, School, UserFilled,
  View, Clock, ArrowRight, Reading, VideoCamera,
  Document, Management, Grid,
} from '@element-plus/icons-vue'

import useUserStore from '@/store/modules/user'
import { getCenterInfo } from '@/api/simhub/center'
import { listCourse } from '@/api/simhub/course'
import { listExperiment } from '@/api/simhub/experiment'
import { listResource } from '@/api/simhub/resource'
import { listNews } from '@/api/simhub/news'
import { listClassAdmin } from '@/api/simhub/class_admin'
import { list as listOperlog } from '@/api/monitor/operlog'
import { parseTime } from '@/utils/ruoyi'

defineOptions({ name: 'DashBoard' })

const router = useRouter()
const userStore = useUserStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const centerInfo = reactive({ centerName: '' })
async function fetchCenter() {
  try {
    const res = await getCenterInfo()
    if (res?.data) centerInfo.centerName = res.data.centerName || ''
  } catch (_) {}
}

const statsLoading = ref(true)
const stats = reactive({ courses: 0, experiments: 0, resources: 0, classes: 0 })

const statCards = computed(() => [
  { key: 'courses',     label: '课程',   value: stats.courses,     icon: 'Reading',     color: '#fff' },
  { key: 'experiments', label: '实验',   value: stats.experiments, icon: 'VideoCamera', color: '#fff' },
  { key: 'resources',   label: '资源',   value: stats.resources,   icon: 'Document',    color: '#fff' },
  { key: 'classes',     label: '班级',   value: stats.classes,     icon: 'Management',  color: '#fff' },
])

async function fetchStats() {
  statsLoading.value = true
  try {
    const [c, e, r, cl] = await Promise.all([
      listCourse({ pageNum: 1, pageSize: 1 }),
      listExperiment({ pageNum: 1, pageSize: 1 }),
      listResource({ pageNum: 1, pageSize: 1 }),
      listClassAdmin({ pageNum: 1, pageSize: 1 }),
    ])
    stats.courses = c?.total ?? 0
    stats.experiments = e?.total ?? 0
    stats.resources = r?.total ?? 0
    stats.classes = cl?.total ?? 0
  } finally {
    statsLoading.value = false
  }
}

const shortcuts = [
  { title: '课程管理', path: '/simhub/course',      icon: 'Reading',    color: '#0B5394', bg: '#EBF4FF' },
  { title: '实验管理', path: '/simhub/experiment',  icon: 'VideoCamera',color: '#00897B', bg: '#E6F7F5' },
  { title: '资源中心', path: '/simhub/resource',    icon: 'Document',   color: '#E65100', bg: '#FFF3E0' },
  { title: '新闻资讯', path: '/simhub/news',        icon: 'Bell',       color: '#1E88E5', bg: '#E3F2FD' },
  { title: '班级管理', path: '/simhub/class-admin', icon: 'Management', color: '#7B1FA2', bg: '#F3E5F5' },
  { title: '系统用户', path: '/system/user',        icon: 'Grid',       color: '#455A64', bg: '#ECEFF1' },
]

const newsLoading = ref(true)
const newsList = ref([])
async function fetchNews() {
  newsLoading.value = true
  try {
    const res = await listNews({ pageNum: 1, pageSize: 5, status: '1' })
    newsList.value = res?.rows ?? []
    if (!newsList.value.length) {
      const fallback = await listNews({ pageNum: 1, pageSize: 5 })
      newsList.value = fallback?.rows ?? []
    }
  } finally {
    newsLoading.value = false
  }
}

const operlogLoading = ref(true)
const operlogs = ref([])
async function fetchOperlogs() {
  operlogLoading.value = true
  try {
    const res = await listOperlog({ pageNum: 1, pageSize: 6 })
    operlogs.value = res?.rows ?? []
  } finally {
    operlogLoading.value = false
  }
}

const classLoading = ref(true)
const classList = ref([])
async function fetchClasses() {
  classLoading.value = true
  try {
    const res = await listClassAdmin({ pageNum: 1, pageSize: 5 })
    classList.value = res?.rows ?? []
  } finally {
    classLoading.value = false
  }
}

onMounted(() => {
  fetchCenter()
  fetchStats()
  fetchNews()
  fetchOperlogs()
  fetchClasses()
})
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 16px 20px 24px;
}

.welcome-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0B5394 0%, #1565C0 50%, #00897B 100%);
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 20px;
  color: #fff;
  gap: 24px;
  flex-wrap: wrap;

  .welcome-left {
    display: flex;
    align-items: center;
    gap: 18px;
    flex: 1;

    .user-avatar {
      border: 3px solid rgba(255, 255, 255, 0.5);
      font-size: 22px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      flex-shrink: 0;
    }

    .welcome-text {
      .greeting {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 700;
        color: #fff;
      }
      .center-subtitle {
        margin: 0;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .stat-bar {
    display: flex;
    gap: 0;
    align-items: center;
    flex-shrink: 0;

    .stat-item {
      padding: 4px 28px;
      text-align: center;
      position: relative;

      + .stat-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        bottom: 8px;
        width: 1px;
        background: rgba(255, 255, 255, 0.25);
      }

      :deep(.el-statistic__number) {
        font-size: 26px;
        font-weight: 700;
        color: #fff !important;
        line-height: 1.2;
      }
      :deep(.el-statistic__head) {
        color: rgba(255, 255, 255, 0.8) !important;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .stat-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
      }
    }
  }
}

.shortcut-row {
  margin-bottom: 16px;

  .shortcut-card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #0B5394;
      box-shadow: 0 4px 16px rgba(11, 83, 148, 0.12);
      transform: translateY(-2px);

      .sc-arrow { color: #0B5394; opacity: 1; }
    }

    .sc-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sc-label {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #1A2332;
      white-space: nowrap;
    }

    .sc-arrow {
      color: #CBD5E1;
      opacity: 0;
      transition: opacity 0.2s;
    }
  }
}

.content-card {
  border-radius: 12px !important;
  border-color: #E2E8F0 !important;

  :deep(.el-card__header) {
    padding: 14px 18px;
    border-bottom: 1px solid #F1F5F9;
  }
  :deep(.el-card__body) { padding: 0; }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #1A2332;

      .el-icon { color: #0B5394; font-size: 16px; }
    }
  }
}

.skeleton-list {
  padding: 12px 18px;
  .skeleton-item { margin-bottom: 14px; &:last-child { margin-bottom: 0; } }
}

.news-card {
  .news-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid #F1F5F9;
    cursor: pointer;
    transition: background 0.15s;

    &:last-child { border-bottom: none; }
    &:hover {
      background: #F8FAFC;
      .news-title { color: #0B5394; }
    }

    .news-badge { flex-shrink: 0; padding-top: 2px; }

    .news-body {
      flex: 1;
      min-width: 0;

      .news-title {
        font-size: 14px;
        font-weight: 600;
        color: #1A2332;
        transition: color 0.15s;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
        margin: 0 0 3px;
      }
      .news-summary {
        font-size: 12px;
        color: #64748B;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
        margin: 0;
      }
    }

    .news-meta-right {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;

      span {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        color: #94A3B8;
        white-space: nowrap;
      }
    }
  }
}

.operlog-card {
  .operlog-item {
    padding: 11px 18px;
    border-bottom: 1px solid #F1F5F9;

    &:last-child { border-bottom: none; }

    .operlog-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;

      .operlog-name {
        font-size: 13px;
        font-weight: 600;
        color: #334155;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 8px;
      }
    }

    .operlog-sub {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #94A3B8;

      .el-icon { font-size: 12px; }
      .operlog-operator { font-weight: 500; color: #64748B; }
      .operlog-time { margin-left: auto; }
    }
  }
}

.class-card {
  .class-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-bottom: 1px solid #F1F5F9;

    &:last-child { border-bottom: none; }

    .class-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #EBF4FF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .class-info {
      flex: 1;
      min-width: 0;

      .class-name {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #1A2332;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .class-sub {
        display: block;
        font-size: 11px;
        color: #94A3B8;
        margin-top: 2px;
      }
    }
  }
}

html.dark {
  .welcome-banner {
    background: linear-gradient(135deg, #0D2340 0%, #0B3D6E 50%, #004D40 100%);
  }
  .shortcut-card {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
    .sc-label { color: var(--el-text-color-primary); }
  }
  .content-card {
    border-color: var(--el-border-color) !important;
    :deep(.el-card__header) { border-bottom-color: var(--el-border-color-light); }
    .card-title { color: var(--el-text-color-primary); }
  }
  .news-item {
    border-bottom-color: var(--el-border-color-light) !important;
    &:hover { background: var(--el-bg-color-page) !important; }
    .news-title { color: var(--el-text-color-primary) !important; }
  }
  .operlog-item, .class-item {
    border-bottom-color: var(--el-border-color-light) !important;
  }
  .class-icon { background: rgba(11, 83, 148, 0.15) !important; }
}

@media (max-width: 768px) {
  .dashboard-page { padding: 12px; }
  .welcome-banner {
    flex-direction: column;
    padding: 20px 18px;
    .stat-bar {
      width: 100%;
      justify-content: space-around;
      .stat-item { padding: 4px 12px; }
    }
  }
}
</style>
