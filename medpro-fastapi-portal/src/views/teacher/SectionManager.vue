<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- 面包屑 -->
    <div class="flex items-center gap-2 text-sm text-slate-400 mb-6">
      <router-link to="/teacher" class="hover:text-primary">工作台</router-link>
      <span>/</span>
      <router-link to="/teacher/courses" class="hover:text-primary">我的课程</router-link>
      <span>/</span>
      <span class="text-on-surface font-medium">章节管理</span>
    </div>

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold font-headline text-on-surface">章节管理</h1>
        <p v-if="courseName" class="text-slate-400 text-sm mt-0.5">{{ courseName }}</p>
      </div>
      <button class="btn-primary flex items-center gap-1" @click="openAddSection(0)">
        <span class="material-symbols-outlined text-sm">add</span>新增章节
      </button>
    </div>

    <!-- 章节树 -->
    <div class="card p-4">
      <div v-if="loading" class="py-12 text-center text-slate-400 text-sm">加载中…</div>
      <div v-else-if="sections.length === 0" class="py-12 text-center text-slate-400 text-sm">
        暂无章节，点击"新增章节"开始添加
      </div>
      <ul v-else class="space-y-2">
        <SectionNode
          v-for="sec in sections"
          :key="sec.sectionId"
          :section="sec"
          :depth="0"
          @edit="openEditSection"
          @delete="deleteSection"
          @add-child="openAddSection"
        />
      </ul>
    </div>

    <!-- 新增/编辑章节弹窗 -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      @click.self="showForm = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold font-headline text-on-surface">
            {{ formData.sectionId ? '编辑章节' : '新增章节' }}
          </h3>
          <button @click="showForm = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="submitSection" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">章节标题 <span class="text-red-500">*</span></label>
            <input v-model="formData.title" type="text" class="input w-full" placeholder="章节标题" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">类型</label>
            <select v-model="formData.sectionType" class="input w-full">
              <option value="chapter">章（chapter）</option>
              <option value="section">节（section）</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">描述</label>
            <textarea v-model="formData.description" rows="2" class="input w-full resize-none" placeholder="可选描述…" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">排序号</label>
            <input v-model.number="formData.sortOrder" type="number" class="input w-32" min="0" />
          </div>
          <p v-if="formError" class="text-red-500 text-sm">{{ formError }}</p>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="btn-outline py-2 px-4" @click="showForm = false">取消</button>
            <button type="submit" class="btn-primary py-2 px-4" :disabled="saving">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认 -->
    <div
      v-if="deletingSection"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      @click.self="deletingSection = null"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 class="font-bold text-on-surface mb-2">确认删除</h3>
        <p class="text-sm text-slate-500 mb-5">删除章节「{{ deletingSection.title }}」？</p>
        <div class="flex justify-end gap-3">
          <button class="btn-outline py-2 px-4" @click="deletingSection = null">取消</button>
          <button class="bg-red-500 text-white rounded-xl py-2 px-4 text-sm font-semibold hover:bg-red-600" @click="confirmDeleteSection">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCourseSections, createSection, updateSection, deleteSection as apiDeleteSection } from '@/api/teacher'
import { getCourseDetail } from '@/api/portal'

// 递归章节节点组件（内联定义）
import { defineComponent, h } from 'vue'

const SectionNode = defineComponent({
  name: 'SectionNode',
  props: { section: Object, depth: Number },
  emits: ['edit', 'delete', 'add-child'],
  setup(props, { emit }) {
    return () => h('li', { class: 'border border-gray-100 rounded-xl overflow-hidden' }, [
      h('div', {
        class: `flex items-center justify-between px-4 py-3 ${props.depth > 0 ? 'bg-gray-50' : 'bg-white'}`,
        style: { paddingLeft: `${16 + props.depth * 20}px` }
      }, [
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'material-symbols-outlined text-slate-300 text-base' },
            props.section.sectionType === 'chapter' ? 'folder' : 'article'),
          h('span', { class: 'text-sm font-medium text-on-surface' }, props.section.title),
          h('span', { class: 'text-xs text-slate-400 ml-1' }, `排序: ${props.section.sortOrder ?? 0}`),
        ]),
        h('div', { class: 'flex items-center gap-2' }, [
          h('button', {
            class: 'text-xs text-primary hover:underline',
            onClick: () => emit('add-child', props.section.sectionId)
          }, '+ 子节'),
          h('button', {
            class: 'text-xs text-primary hover:underline',
            onClick: () => emit('edit', props.section)
          }, '编辑'),
          h('button', {
            class: 'text-xs text-red-400 hover:underline',
            onClick: () => emit('delete', props.section)
          }, '删除'),
        ]),
      ]),
      props.section.children?.length
        ? h('ul', { class: 'pl-4 border-t border-gray-50 space-y-1 pb-1 pt-1' },
            props.section.children.map(child =>
              h(SectionNode, {
                key: child.sectionId,
                section: child,
                depth: props.depth + 1,
                onEdit: (s) => emit('edit', s),
                onDelete: (s) => emit('delete', s),
                onAddChild: (id) => emit('add-child', id),
              })
            )
          )
        : null,
    ])
  }
})

const route = useRoute()
const courseId = Number(route.params.id)
const courseName = ref('')
const sections = ref([])
const loading = ref(true)

const showForm = ref(false)
const saving = ref(false)
const formError = ref('')
const formData = ref({ sectionId: null, title: '', sectionType: 'section', description: '', sortOrder: 0, parentId: 0 })

const deletingSection = ref(null)

async function loadSections() {
  try {
    loading.value = true
    const res = await getCourseSections(courseId)
    sections.value = res.data || []
  } catch {
    sections.value = []
  } finally {
    loading.value = false
  }
}

function openAddSection(parentId = 0) {
  formData.value = { sectionId: null, title: '', sectionType: 'section', description: '', sortOrder: 0, parentId, courseId }
  formError.value = ''
  showForm.value = true
}

function openEditSection(section) {
  formData.value = {
    sectionId: section.sectionId,
    courseId: section.courseId || courseId,
    parentId: section.parentId ?? 0,
    title: section.title,
    sectionType: section.sectionType || 'section',
    description: section.description || '',
    sortOrder: section.sortOrder ?? 0,
  }
  formError.value = ''
  showForm.value = true
}

async function submitSection() {
  if (!formData.value.title.trim()) { formError.value = '标题不能为空'; return }
  try {
    saving.value = true; formError.value = ''
    if (formData.value.sectionId) {
      await updateSection(formData.value.sectionId, formData.value)
    } else {
      await createSection({ ...formData.value, courseId })
    }
    showForm.value = false
    await loadSections()
  } catch (err) {
    formError.value = err?.response?.data?.msg || '保存失败'
  } finally {
    saving.value = false
  }
}

function deleteSection(section) {
  deletingSection.value = section
}

async function confirmDeleteSection() {
  if (!deletingSection.value) return
  try {
    await apiDeleteSection(deletingSection.value.sectionId)
    deletingSection.value = null
    await loadSections()
  } catch {
    // ignore
  }
}

onMounted(async () => {
  try {
    const res = await getCourseDetail(courseId)
    courseName.value = res.data?.course?.courseName || ''
  } catch { /* ignore */ }
  await loadSections()
})
</script>
