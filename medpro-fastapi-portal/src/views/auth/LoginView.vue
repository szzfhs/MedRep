<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2 text-primary font-headline font-bold text-2xl">
          <span class="material-symbols-outlined text-3xl">biotech</span>
          SimHub
        </router-link>
        <p class="text-slate-400 mt-2">虚拟仿真实验教学平台</p>
      </div>

      <div class="card p-8">
        <h2 class="text-2xl font-bold font-headline text-on-surface mb-6 text-center">登录账号</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1.5">用户名</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              class="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              @keyup.enter="handleLogin"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1.5">密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              @keyup.enter="handleLogin"
            />
          </div>

          <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>

          <button
            class="btn-primary w-full py-3 text-base"
            :disabled="submitting"
            @click="handleLogin"
          >
            <span v-if="submitting" class="material-symbols-outlined animate-spin align-text-bottom mr-1">refresh</span>
            {{ submitting ? '登录中...' : '登  录' }}
          </button>
        </div>

        <p class="text-center text-sm text-slate-400 mt-6">
          还没有账号？
          <router-link to="/register" class="text-primary hover:underline">立即注册</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = ref({ username: '', password: '' })
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  error.value = ''
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码'
    return
  }
  submitting.value = true
  try {
    await auth.loginAction(form.value)
    if (route.query.redirect) {
      router.push(route.query.redirect)
    } else if (auth.isTeacher) {
      router.push('/teacher')
    } else if (auth.isStudent) {
      router.push('/student')
    } else {
      router.push('/')
    }
  } catch (e) {
    error.value = e?.response?.data?.message || '用户名或密码错误'
  } finally {
    submitting.value = false
  }
}
</script>
