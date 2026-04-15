<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold font-headline text-on-surface mb-8">个人资料</h1>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-10 bg-surface-container rounded-lg animate-pulse" />
    </div>

    <form v-else class="card p-6 space-y-5" @submit.prevent="handleSave">
      <!-- 基本信息（只读，来自 sys_user） -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="field-label">用户名</label>
          <input :value="auth.user?.userName" class="field" disabled />
        </div>
        <div>
          <label class="field-label">昵称</label>
          <input :value="auth.user?.nickName" class="field" disabled />
        </div>
      </div>

      <hr class="border-outline-variant" />

      <!-- 学生扩展信息 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="field-label">学号</label>
          <input v-model="form.studentNo" class="field" placeholder="请输入学号" maxlength="30" />
        </div>
        <div>
          <label class="field-label">年级</label>
          <input v-model="form.grade" class="field" placeholder="例如：2022级" maxlength="20" />
        </div>
        <div>
          <label class="field-label">学院</label>
          <input v-model="form.college" class="field" placeholder="请输入学院名称" maxlength="100" />
        </div>
        <div>
          <label class="field-label">专业</label>
          <input v-model="form.major" class="field" placeholder="请输入专业名称" maxlength="100" />
        </div>
        <div class="sm:col-span-2">
          <label class="field-label">班级</label>
          <input v-model="form.className" class="field" placeholder="例如：计科2201班" maxlength="100" />
        </div>
        <div>
          <label class="field-label">入学年份</label>
          <input
            v-model.number="form.enrollYear"
            type="number"
            class="field"
            placeholder="例如：2022"
            :min="2000"
            :max="new Date().getFullYear()"
          />
        </div>
      </div>

      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">保存成功！</div>

      <div class="flex gap-3 pt-2">
        <button type="submit" class="btn-primary px-6" :disabled="saving">
          {{ saving ? '保存中…' : '保存' }}
        </button>
        <router-link to="/student" class="btn-outline px-6">返回</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getStudentProfile, updateStudentProfile } from '@/api/student'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  studentNo: '',
  grade: '',
  college: '',
  major: '',
  className: '',
  enrollYear: null,
})

async function handleSave() {
  saving.value = true
  error.value = ''
  success.value = false
  try {
    await updateStudentProfile({ ...form })
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    error.value = e?.message || '保存失败，请重试'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getStudentProfile()
    const d = res.data || {}
    Object.assign(form, {
      studentNo: d.studentNo || '',
      grade: d.grade || '',
      college: d.college || '',
      major: d.major || '',
      className: d.className || '',
      enrollYear: d.enrollYear || null,
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.field-label {
  @apply block text-sm font-medium text-slate-500 mb-1;
}
.field {
  @apply w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary disabled:bg-surface-container disabled:text-slate-400;
}
</style>
