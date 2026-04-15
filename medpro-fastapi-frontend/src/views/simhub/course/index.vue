<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="queryParams.courseName" placeholder="请输入课程名称" clearable style="width:200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:100px">
          <el-option label="启用" value="1" /><el-option label="停用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:course:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:course:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:course:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="courseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="courseId" width="80" align="center" />
      <el-table-column label="课程名称" prop="courseName" :show-overflow-tooltip="true" />
      <el-table-column label="选课人数" prop="enrollCount" width="90" align="center" />
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'danger'">{{ row.status === '1' ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="120" align="center">
        <template #default="{ row }"><span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span></template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220">
        <template #default="{ row }">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:course:edit']">修改</el-button>
          <el-button link type="success" icon="List" @click="handleSection(row)" v-hasPermi="['simhub:course:edit']">章节</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:course:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 课程对话框 -->
    <el-dialog :title="dialogTitle" v-model="open" width="720px" append-to-body destroy-on-close>
      <el-form ref="courseRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="form.courseName" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="1">启用</el-radio><el-radio value="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="封面图">
              <image-upload v-model="form.coverImage" :limit="1" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="课程简介" prop="description">
              <editor v-model="form.description" :min-height="200" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 章节管理对话框 -->
    <el-dialog title="章节管理" v-model="sectionOpen" width="680px" append-to-body destroy-on-close>
      <div class="mb8" style="text-align:right">
        <el-button type="primary" icon="Plus" size="small" @click="handleAddSection">新增章节</el-button>
      </div>
      <el-tree
        :data="sectionTree"
        :props="{ label: 'title', children: 'children' }"
        node-key="sectionId"
        default-expand-all
      >
        <template #default="{ node, data }">
          <span>{{ node.label }}</span>
          <span style="margin-left:auto">
            <el-button link type="primary" size="small" @click="handleEditSection(data)">编辑</el-button>
            <el-button link type="success" size="small" @click="handleAddSection(data)">子节</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteSection(data)">删除</el-button>
          </span>
        </template>
      </el-tree>

      <el-dialog title="章节信息" v-model="sectionFormOpen" width="520px" append-to-body destroy-on-close>
        <el-form ref="sectionRef" :model="sectionForm" :rules="sectionRules" label-width="90px">
          <el-form-item label="节标题" prop="title">
            <el-input v-model="sectionForm.title" placeholder="请输入章节标题" />
          </el-form-item>
          <el-form-item label="上级章节">
            <el-tree-select
              v-model="sectionForm.parentId"
              :data="sectionTree"
              :props="{ label: 'title', value: 'sectionId', children: 'children' }"
              placeholder="顶级章节" clearable check-strictly style="width:100%"
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="sectionForm.sectionType" style="width:100%">
              <el-option label="章" value="chapter" /><el-option label="节" value="section" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="sectionForm.sortOrder" :min="0" style="width:100%" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button type="primary" @click="submitSectionForm">确 定</el-button>
          <el-button @click="sectionFormOpen = false">取 消</el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup name="SimhubCourse">
import { listCourse, getCourse, addCourse, updateCourse, delCourse, addSection, updateSection, delSection } from '@/api/simhub/course'

const { proxy } = getCurrentInstance()

const courseList = ref([])
const open = ref(false)
const sectionOpen = ref(false)
const sectionFormOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dialogTitle = ref('')
const sectionTree = ref([])
const currentCourseId = ref(null)

const data = reactive({
  form: {},
  queryParams: { pageNum: 1, pageSize: 10, courseName: undefined, status: undefined },
  rules: { courseName: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }] }
})
const { queryParams, form, rules } = toRefs(data)

const sectionForm = ref({ sectionId: undefined, courseId: undefined, title: undefined, parentId: undefined, sectionType: 'section', sortOrder: 0 })
const sectionRules = { title: [{ required: true, message: '章节标题不能为空', trigger: 'blur' }] }

function getList() {
  loading.value = true
  listCourse(queryParams.value).then(res => { courseList.value = res.rows; total.value = res.total; loading.value = false })
}

function reset() { form.value = { courseId: undefined, courseName: undefined, description: undefined, status: '1', sortOrder: 0 }; proxy.resetForm('courseRef') }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(sel) { ids.value = sel.map(i => i.courseId); single.value = sel.length !== 1; multiple.value = !sel.length }
function handleAdd() { reset(); dialogTitle.value = '新增课程'; open.value = true }

function handleUpdate(row) {
  reset()
  const courseId = row.courseId || ids.value[0]
  getCourse(courseId).then(res => { form.value = res.data?.course || res.data; dialogTitle.value = '修改课程'; open.value = true })
}

function submitForm() {
  proxy.$refs.courseRef.validate(valid => {
    if (!valid) return
    const api = form.value.courseId ? updateCourse : addCourse
    api(form.value).then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() })
  })
}

function handleDelete(row) {
  const courseIds = row.courseId || ids.value.join(',')
  proxy.$modal.confirm('确认删除选中的课程数据？').then(() => delCourse(courseIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }).catch(() => {})
}

function handleSection(row) {
  currentCourseId.value = row.courseId
  getCourse(row.courseId).then(res => { sectionTree.value = res.data?.sections || []; sectionOpen.value = true })
}

function handleAddSection(parent) {
  sectionForm.value = { sectionId: undefined, courseId: currentCourseId.value, title: undefined, parentId: parent?.sectionId, sectionType: 'section', sortOrder: 0 }
  sectionFormOpen.value = true
}

function handleEditSection(data) {
  sectionForm.value = { ...data, courseId: currentCourseId.value }
  sectionFormOpen.value = true
}

function handleDeleteSection(data) {
  proxy.$modal.confirm(`确认删除章节"${data.title}"？`).then(() => delSection(data.sectionId)).then(() => { proxy.$modal.msgSuccess('删除成功'); handleSection({ courseId: currentCourseId.value }) }).catch(() => {})
}

function submitSectionForm() {
  proxy.$refs.sectionRef.validate(valid => {
    if (!valid) return
    const api = sectionForm.value.sectionId ? updateSection : addSection
    api(sectionForm.value).then(() => { proxy.$modal.msgSuccess('操作成功'); sectionFormOpen.value = false; handleSection({ courseId: currentCourseId.value }) })
  })
}

getList()
</script>
