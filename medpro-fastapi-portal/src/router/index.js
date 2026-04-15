import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // 公开页面 — DefaultLayout
  { path: '/', name: 'Home', component: () => import('@/views/home/HomeView.vue') },
  { path: '/experiment', name: 'ExperimentHall', component: () => import('@/views/experiment/ExperimentHall.vue') },
  { path: '/experiment/:id', name: 'ExperimentDetail', component: () => import('@/views/experiment/ExperimentDetail.vue') },
  { path: '/course', name: 'CourseCenter', component: () => import('@/views/course/CourseCenter.vue') },
  { path: '/course/:id', name: 'CourseDetail', component: () => import('@/views/course/CourseDetail.vue') },
  { path: '/resource', name: 'ResourceCenter', component: () => import('@/views/resource/ResourceCenter.vue') },
  { path: '/resource/:id', name: 'ResourceView', component: () => import('@/views/resource/ResourceView.vue') },
  { path: '/news', name: 'NewsList', component: () => import('@/views/news/NewsList.vue') },
  { path: '/news/:id', name: 'NewsDetail', component: () => import('@/views/news/NewsDetail.vue') },
  { path: '/regulation', name: 'RegulationList', component: () => import('@/views/regulation/RegulationList.vue') },
  { path: '/regulation/:id', name: 'RegulationDetail', component: () => import('@/views/regulation/RegulationDetail.vue') },
  { path: '/about', name: 'About', component: () => import('@/views/about/AboutView.vue') },

  // 需登录页面 — DefaultLayout + auth guard
  {
    path: '/my',
    name: 'MyCenter',
    component: () => import('@/views/user/MyCenter.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my/courses',
    name: 'MyCourses',
    component: () => import('@/views/user/MyCourses.vue'),
    meta: { requiresAuth: true }
  },

  // ——— 教师端（需登录 + teacher 角色）———
  {
    path: '/teacher',
    name: 'TeacherDashboard',
    component: () => import('@/views/teacher/TeacherDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'teacher' }
  },
  {
    path: '/teacher/courses',
    name: 'TeacherCourses',
    component: () => import('@/views/teacher/MyCourseList.vue'),
    meta: { requiresAuth: true, requiresRole: 'teacher' }
  },
  {
    path: '/teacher/course/:id/sections',
    name: 'TeacherSections',
    component: () => import('@/views/teacher/SectionManager.vue'),
    meta: { requiresAuth: true, requiresRole: 'teacher' }
  },
  {
    path: '/teacher/course/:id/students',
    name: 'TeacherStudents',
    component: () => import('@/views/teacher/CourseStudents.vue'),
    meta: { requiresAuth: true, requiresRole: 'teacher' }
  },

  // ——— 学生端（需登录）———
  {
    path: '/student',
    name: 'StudentDashboard',
    component: () => import('@/views/student/StudentDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/experiments',
    name: 'MyExperiments',
    component: () => import('@/views/student/MyExperiments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/courses',
    name: 'MyCourseLearning',
    component: () => import('@/views/student/MyCourseLearning.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/course/:id/learn',
    name: 'CourseLearnPage',
    component: () => import('@/views/student/CourseLearnPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/profile',
    name: 'StudentProfile',
    component: () => import('@/views/student/StudentProfile.vue'),
    meta: { requiresAuth: true }
  },

  // 认证页面 — AuthLayout
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue'), meta: { layout: 'auth' } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue'), meta: { layout: 'auth' } },

  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth) {
    if (!auth.isLoggedIn) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  }
  if (to.meta.requiresRole === 'teacher') {
    if (!auth.isTeacher) {
      return next({ name: 'Home' })
    }
  }
  next()
})

export default router
