<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold font-headline text-on-surface">
            {{ courseId ? '编辑课程' : '新建课程' }}
          </h3>
          <button @click="$emit('update:modelValue', false)" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 课程名称 -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">课程名称 <span class="text-red-500">*</span></label>
            <input
              v-model="form.courseName"
              type="text"
              class="input w-full"
              placeholder="请输入课程名称"
              required
            />
          </div>

          <!-- 课程分类 -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">课程分类</label>
            <input
              v-model="form.category"
              type="text"
              class="input w-full"
              placeholder="如：解剖学、护理学…"
            />
          </div>

          <!-- 课程描述 -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">课程简介</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input w-full resize-none"
              placeholder="简要描述课程内容…"
            />
          </div>

          <!-- 封面图 URL -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">封面图 URL</label>
            <input
              v-model="form.coverImage"
              type="url"
              class="input w-full"
              placeholder="https://..."
            />
          </div>

          <!-- 状态 -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">发布状态</label>
            <select v-model="form.status" class="input w-full">
              <option value="1">草稿（不对学生显示）</option>
              <option value="0">发布（学生可见）</option>
            </select>
          </div>

          <!-- 错误提示 -->
          <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>

          <!-- 按钮 -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="btn-outline py-2 px-5"
              @click="$emit('update:modelValue', false)"
            >取消</button>
            <button type="submit" class="btn-primary py-2 px-5" :disabled="saving">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { createTeacherCourse, updateTeacherCourse } from '@/api/teacher'

const props = defineProps({
  modelValue: Boolean,
  courseId: { type: Number, default: null },
  initialData: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const defaultForm = () => ({
  courseName: '',
  category: '',
  description: '',
  coverImage: '',
  status: '1',
})

const form = ref(defaultForm())
const saving = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (val) => {
  if (val) {
    errorMsg.value = ''
    if (props.courseId && props.initialData) {
      form.value = {
        courseName: props.initialData.courseName || '',
        category: props.initialData.category || '',
        description: props.initialData.description || '',
        coverImage: props.initialData.coverImage || '',
        status: props.initialData.status ?? '1',
      }
    } else {
      form.value = defaultForm()
    }
  }
})

async function handleSubmit() {
  if (!form.value.courseName.trim()) {
    errorMsg.value = '课程名称不能为空'
    return
  }
  try {
    saving.value = true
    errorMsg.value = ''
    if (props.courseId) {
      await updateTeacherCourse(props.courseId, form.value)
    } else {
      await createTeacherCourse(form.value)
    }
    emit('saved')
  } catch (err) {
    errorMsg.value = err?.response?.data?.msg || '保存失败，请重试'
  } finally {
    saving.value = false
  }
}
</script>
