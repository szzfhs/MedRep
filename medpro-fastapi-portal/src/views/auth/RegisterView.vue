<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2 text-primary font-headline font-bold text-2xl">
          <span class="material-symbols-outlined text-3xl">biotech</span>
          SimHub
        </router-link>
        <p class="text-slate-400 mt-2">注册新账号</p>
      </div>

      <div class="card p-8">
        <h2 class="text-2xl font-bold font-headline text-on-surface mb-6 text-center">创建账号</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1.5">用户名</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="4-20位字母数字"
              class="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1.5">真实姓名</label>
            <input
              v-model="form.nickName"
              type="text"
              placeholder="请输入姓名"
              class="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1.5">手机号码</label>
            <input
              v-model="form.phonenumber"
              type="tel"
              placeholder="请输入手机号"
              class="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1.5">密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="8位以上，含字母和数字"
              class="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1.5">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              class="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              @keyup.enter="handleRegister"
            />
          </div>

          <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>
          <p v-if="success" class="text-green-500 text-sm text-center">注册成功！正在跳转登录...</p>

          <button
            class="btn-primary w-full py-3 text-base"
            :disabled="submitting"
            @click="handleRegister"
          >
            {{ submitting ? '注册中...' : '注  册' }}
          </button>
        </div>

        <p class="text-center text-sm text-slate-400 mt-6">
          已有账号？
          <router-link to="/login" class="text-primary hover:underline">去登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '@/api/portal'

const router = useRouter()
const form = ref({ username: '', nickName: '', phonenumber: '', password: '' })
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const submitting = ref(false)

async function handleRegister() {
  error.value = ''
  success.value = false
  const { username, nickName, phonenumber, password } = form.value
  if (!username || !password || !nickName) {
    error.value = '请填写必填项'
    return
  }
  if (password !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }
  if (password.length < 8) {
    error.value = '密码不少于8位'
    return
  }
  submitting.value = true
  try {
    await registerUser({ username, password, confirmPassword: confirmPassword.value })
    success.value = true
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = e?.response?.data?.message || '注册失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>
