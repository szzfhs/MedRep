<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="queryParams.courseName" placeholder="请输入课程名称" clearable style="width:200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="课程分类" prop="courseCategory">
        <el-select v-model="queryParams.courseCategory" placeholder="课程分类" clearable style="width:130px">
          <el-option v-for="d in dict.type.vf_course_category" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:110px">
          <el-option label="新建" value="0" /><el-option label="已审核" value="1" /><el-option label="已发布" value="2" />
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
      <el-table-column label="课程分类" prop="courseCategory" width="110" align="center">
        <template #default="{ row }">
          <dict-tag :options="dict.type.vf_course_category" :value="row.courseCategory" />
        </template>
      </el-table-column>
      <el-table-column label="选课人数" prop="enrollCount" width="90" align="center" />
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '2' ? 'success' : row.status === '1' ? 'warning' : 'info'">{{ row.status === '2' ? '已发布' : row.status === '1' ? '已审核' : '新建' }}</el-tag>
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
    <el-dialog :title="dialogTitle" v-model="open" width="820px" append-to-body destroy-on-close>
      <el-form ref="courseRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="form.courseName" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程分类" prop="courseCategory">
              <el-select v-model="form.courseCategory" placeholder="请选择" style="width:100%">
                <el-option v-for="d in dict.type.vf_course_category" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="英文副标题">
              <el-input v-model="form.subtitle" placeholder="如：Virtual Human Anatomy Laboratory" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主讲教师">
              <el-input v-model="form.teacherName" placeholder="如：王明远 教授" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属院系">
              <el-input v-model="form.department" placeholder="如：基础医学院" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="总学时">
              <el-input-number v-model="form.totalHours" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程评分">
              <el-input-number v-model="form.rating" :min="0" :max="5" :precision="1" :step="0.1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="评价数">
              <el-input-number v-model="form.reviewCount" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开课时间">
              <el-date-picker v-model="form.publishDate" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width:100%">
                <el-option label="新建" value="0" />
                <el-option label="已审核" value="1" />
                <el-option label="已发布" value="2" />
              </el-select>
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
            <el-button link type="warning" size="small" @click="handleSectionQuestion(data)">习题</el-button>
            <el-button link type="info" size="small" @click="handleSectionResource(data)">资源</el-button>
            <el-button link type="success" size="small" @click="handleSectionExperiment(data)">实验</el-button>
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
          <el-form-item label="学时">
            <el-input-number v-model="sectionForm.hours" :min="0" style="width:100%" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="sectionForm.sortOrder" :min="0" style="width:100%" />
          </el-form-item>
          <el-form-item label="资源标识">
            <el-row :gutter="12">
              <el-col :span="8">
                <el-checkbox v-model="sectionForm.hasResource" true-value="1" false-value="0">有课件资源</el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox v-model="sectionForm.hasExperiment" true-value="1" false-value="0">有虚拟实验</el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox v-model="sectionForm.hasTest" true-value="1" false-value="0">有在线测试</el-checkbox>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button type="primary" @click="submitSectionForm">确 定</el-button>
          <el-button @click="sectionFormOpen = false">取 消</el-button>
        </template>
      </el-dialog>
    </el-dialog>

    <!-- 章节习题管理对话框 -->
    <el-dialog title="章节习题管理" v-model="sectionQuestionOpen" width="900px" append-to-body destroy-on-close>
      <el-row :gutter="16">
        <!-- 左：已绑定习题 -->
        <el-col :span="12">
          <div class="sq-panel-title">已绑定习题 <el-tag size="small" type="info">{{ boundQuestions.length }}</el-tag></div>
          <el-table :data="boundQuestions" size="small" max-height="400" v-loading="sqLoading">
            <el-table-column label="习题名称" prop="questionName" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="questionType" width="80" align="center">
              <template #default="{ row }">
                <dict-tag :options="dict.type.vf_question_type" :value="row.questionType" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="handleUnbindQuestion(row)">解绑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <!-- 右：习题库搜索 -->
        <el-col :span="12">
          <div class="sq-panel-title">习题库</div>
          <el-input v-model="sqSearchName" placeholder="搜索习题名称" clearable size="small" @keyup.enter="loadQuestionBank" style="margin-bottom:8px">
            <template #append><el-button icon="Search" @click="loadQuestionBank" /></template>
          </el-input>
          <el-table :data="questionBank" size="small" max-height="360" v-loading="sqBankLoading">
            <el-table-column label="习题名称" prop="questionName" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="questionType" width="80" align="center">
              <template #default="{ row }">
                <dict-tag :options="dict.type.vf_question_type" :value="row.questionType" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleBindQuestion(row)" :disabled="isBound(row.questionId)">绑定</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="sqBankTotal > 0"
            :total="sqBankTotal"
            v-model:page="sqBankQuery.pageNum"
            v-model:limit="sqBankQuery.pageSize"
            @pagination="loadQuestionBank"
            layout="prev, pager, next"
            small
          />
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="sectionQuestionOpen = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 章节资源管理对话框 -->
    <el-dialog title="章节资源管理" v-model="sectionResourceOpen" width="900px" append-to-body destroy-on-close>
      <el-row :gutter="16">
        <!-- 左：已绑定资源 -->
        <el-col :span="12">
          <div class="sq-panel-title">已绑定资源 <el-tag size="small" type="info">{{ boundResources.length }}</el-tag></div>
          <el-table :data="boundResources" size="small" max-height="400" v-loading="srLoading">
            <el-table-column label="资源名称" prop="resourceName" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="resourceType" width="90" align="center">
              <template #default="{ row }">
                <dict-tag :options="dict.type.vf_resource_type" :value="row.resourceType" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="handleUnbindResource(row)">解绑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <!-- 右：资源库搜索 -->
        <el-col :span="12">
          <div class="sq-panel-title">资源库</div>
          <el-input v-model="srSearchName" placeholder="搜索资源名称" clearable size="small" @keyup.enter="loadResourceBank" style="margin-bottom:8px">
            <template #append><el-button icon="Search" @click="loadResourceBank" /></template>
          </el-input>
          <el-table :data="resourceBank" size="small" max-height="360" v-loading="srBankLoading">
            <el-table-column label="资源名称" prop="resourceName" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="resourceType" width="90" align="center">
              <template #default="{ row }">
                <dict-tag :options="dict.type.vf_resource_type" :value="row.resourceType" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleBindResource(row)" :disabled="isResourceBound(row.resourceId)">绑定</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="srBankTotal > 0"
            :total="srBankTotal"
            v-model:page="srBankQuery.pageNum"
            v-model:limit="srBankQuery.pageSize"
            @pagination="loadResourceBank"
            layout="prev, pager, next"
            small
          />
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="sectionResourceOpen = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 章节实验管理对话框 -->
    <el-dialog title="章节实验管理" v-model="sectionExperimentOpen" width="900px" append-to-body destroy-on-close>
      <el-row :gutter="16">
        <!-- 左：已绑定实验 -->
        <el-col :span="12">
          <div class="sq-panel-title">已绑定实验 <el-tag size="small" type="info">{{ boundExperiments.length }}</el-tag></div>
          <el-table :data="boundExperiments" size="small" max-height="400" v-loading="seLoading">
            <el-table-column label="实验名称" prop="expName" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="expType" width="80" align="center" />
            <el-table-column label="操作" width="70" align="center">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="handleUnbindExperiment(row)">解绑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <!-- 右：实验库搜索 -->
        <el-col :span="12">
          <div class="sq-panel-title">实验库</div>
          <el-input v-model="seSearchName" placeholder="搜索实验名称" clearable size="small" @keyup.enter="loadExperimentBank" style="margin-bottom:8px">
            <template #append><el-button icon="Search" @click="loadExperimentBank" /></template>
          </el-input>
          <el-table :data="experimentBank" size="small" max-height="360" v-loading="seBankLoading">
            <el-table-column label="实验名称" prop="expName" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="expType" width="80" align="center" />
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleBindExperiment(row)" :disabled="isExperimentBound(row.expId)">绑定</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="seBankTotal > 0"
            :total="seBankTotal"
            v-model:page="seBankQuery.pageNum"
            v-model:limit="seBankQuery.pageSize"
            @pagination="loadExperimentBank"
            layout="prev, pager, next"
            small
          />
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="sectionExperimentOpen = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SimhubCourse">
import { listCourse, getCourse, addCourse, updateCourse, delCourse, addSection, updateSection, delSection, getSectionExperiments, bindSectionExperiment, unbindSectionExperiment, getSectionResources, bindSectionResource, unbindSectionResource } from '@/api/simhub/course'
import { getSectionQuestions, bindSectionQuestion, unbindSectionQuestion, listQuestion } from '@/api/simhub/question'
import { listExperiment } from '@/api/simhub/experiment'
import { listResource } from '@/api/simhub/resource'

const { proxy } = getCurrentInstance()
const { vf_course_category, vf_question_type, vf_resource_type } = proxy.useDict('vf_course_category', 'vf_question_type', 'vf_resource_type')
const dict = reactive({ type: { vf_course_category, vf_question_type, vf_resource_type } })

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

// 章节习题管理状态
const sectionQuestionOpen = ref(false)
const sectionResourceOpen = ref(false)
const sectionExperimentOpen = ref(false)
const currentSectionId = ref(null)
const boundQuestions = ref([])
const questionBank = ref([])
const sqLoading = ref(false)
const sqBankLoading = ref(false)
const sqBankTotal = ref(0)
const sqSearchName = ref('')
const sqBankQuery = ref({ pageNum: 1, pageSize: 10, questionName: undefined, status: '1' })

// 章节资源管理状态
const boundResources = ref([])
const resourceBank = ref([])
const srLoading = ref(false)
const srBankLoading = ref(false)
const srBankTotal = ref(0)
const srSearchName = ref('')
const srBankQuery = ref({ pageNum: 1, pageSize: 10, resourceName: undefined })

// 章节实验管理状态
const boundExperiments = ref([])
const experimentBank = ref([])
const seLoading = ref(false)
const seBankLoading = ref(false)
const seBankTotal = ref(0)
const seSearchName = ref('')
const seBankQuery = ref({ pageNum: 1, pageSize: 10, expName: undefined })

const data = reactive({
  form: {},
  queryParams: { pageNum: 1, pageSize: 10, courseName: undefined, courseCategory: undefined, status: undefined },
  rules: { courseName: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }] }
})
const { queryParams, form, rules } = toRefs(data)

const sectionForm = ref({ sectionId: undefined, courseId: undefined, title: undefined, parentId: undefined, sectionType: 'section', sortOrder: 0, hours: 0, hasResource: '0', hasExperiment: '0', hasTest: '0' })
const sectionRules = { title: [{ required: true, message: '章节标题不能为空', trigger: 'blur' }] }

function getList() {
  loading.value = true
  listCourse(queryParams.value).then(res => { courseList.value = res.rows; total.value = res.total; loading.value = false })
}

function reset() { form.value = { courseId: undefined, courseName: undefined, subtitle: undefined, teacherName: undefined, department: undefined, courseCategory: undefined, description: undefined, totalHours: 0, rating: undefined, reviewCount: 0, publishDate: undefined, status: '0', sortOrder: 0 }; proxy.resetForm('courseRef') }
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
  sectionForm.value = { sectionId: undefined, courseId: currentCourseId.value, title: undefined, parentId: parent?.sectionId, sectionType: 'section', sortOrder: 0, hours: 0, hasResource: '0', hasExperiment: '0', hasTest: '0' }
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

// ——— 章节习题绑定 ———
function handleSectionQuestion(sectionData) {
  currentSectionId.value = sectionData.sectionId
  sectionQuestionOpen.value = true
  sqSearchName.value = ''
  sqBankQuery.value = { pageNum: 1, pageSize: 10, questionName: undefined, status: '1' }
  loadBoundQuestions()
  loadQuestionBank()
}

function loadBoundQuestions() {
  sqLoading.value = true
  getSectionQuestions(currentSectionId.value).then(res => {
    boundQuestions.value = res.data || []
    sqLoading.value = false
  }).catch(() => { sqLoading.value = false })
}

function loadQuestionBank() {
  sqBankLoading.value = true
  sqBankQuery.value.questionName = sqSearchName.value || undefined
  listQuestion(sqBankQuery.value).then(res => {
    questionBank.value = res.rows || []
    sqBankTotal.value = res.total || 0
    sqBankLoading.value = false
  }).catch(() => { sqBankLoading.value = false })
}

function isBound(questionId) {
  return boundQuestions.value.some(q => q.questionId === questionId)
}

function handleBindQuestion(row) {
  bindSectionQuestion({
    sectionId: currentSectionId.value,
    courseId: currentCourseId.value,
    questionId: row.questionId
  }).then(() => {
    proxy.$modal.msgSuccess('绑定成功')
    loadBoundQuestions()
  })
}

function handleUnbindQuestion(row) {
  proxy.$modal.confirm(`确认从章节解绑习题"${row.questionName}"？`).then(() =>
    unbindSectionQuestion(currentSectionId.value, row.questionId)
  ).then(() => {
    proxy.$modal.msgSuccess('解绑成功')
    loadBoundQuestions()
  }).catch(() => {})
}

// ——— 章节资源绑定 ———
function handleSectionResource(sectionData) {
  currentSectionId.value = sectionData.sectionId
  sectionResourceOpen.value = true
  srSearchName.value = ''
  srBankQuery.value = { pageNum: 1, pageSize: 10, resourceName: undefined }
  loadBoundResources()
  loadResourceBank()
}

function loadBoundResources() {
  srLoading.value = true
  getSectionResources(currentSectionId.value).then(res => {
    boundResources.value = res.data || []
    srLoading.value = false
  }).catch(() => { srLoading.value = false })
}

function loadResourceBank() {
  srBankLoading.value = true
  srBankQuery.value.resourceName = srSearchName.value || undefined
  listResource(srBankQuery.value).then(res => {
    resourceBank.value = res.rows || []
    srBankTotal.value = res.total || 0
    srBankLoading.value = false
  }).catch(() => { srBankLoading.value = false })
}

function isResourceBound(resourceId) {
  return boundResources.value.some(r => r.resourceId === resourceId)
}

function handleBindResource(row) {
  bindSectionResource({
    sectionId: currentSectionId.value,
    courseId: currentCourseId.value,
    resourceId: row.resourceId
  }).then(() => {
    proxy.$modal.msgSuccess('绑定成功')
    loadBoundResources()
  })
}

function handleUnbindResource(row) {
  proxy.$modal.confirm(`确认从章节解绑资源"${row.resourceName}"？`).then(() =>
    unbindSectionResource(currentSectionId.value, row.resourceId)
  ).then(() => {
    proxy.$modal.msgSuccess('解绑成功')
    loadBoundResources()
  }).catch(() => {})
}

// ——— 章节实验绑定 ———
function handleSectionExperiment(sectionData) {
  currentSectionId.value = sectionData.sectionId
  sectionExperimentOpen.value = true
  seSearchName.value = ''
  seBankQuery.value = { pageNum: 1, pageSize: 10, expName: undefined }
  loadBoundExperiments()
  loadExperimentBank()
}

function loadBoundExperiments() {
  seLoading.value = true
  getSectionExperiments(currentSectionId.value).then(res => {
    boundExperiments.value = res.data || []
    seLoading.value = false
  }).catch(() => { seLoading.value = false })
}

function loadExperimentBank() {
  seBankLoading.value = true
  seBankQuery.value.expName = seSearchName.value || undefined
  listExperiment(seBankQuery.value).then(res => {
    experimentBank.value = res.rows || []
    seBankTotal.value = res.total || 0
    seBankLoading.value = false
  }).catch(() => { seBankLoading.value = false })
}

function isExperimentBound(expId) {
  return boundExperiments.value.some(e => e.expId === expId)
}

function handleBindExperiment(row) {
  bindSectionExperiment({
    sectionId: currentSectionId.value,
    courseId: currentCourseId.value,
    expId: row.expId
  }).then(() => {
    proxy.$modal.msgSuccess('绑定成功')
    loadBoundExperiments()
  })
}

function handleUnbindExperiment(row) {
  proxy.$modal.confirm(`确认从章节解绑实验"${row.expName}"？`).then(() =>
    unbindSectionExperiment(currentSectionId.value, row.expId)
  ).then(() => {
    proxy.$modal.msgSuccess('解绑成功')
    loadBoundExperiments()
  }).catch(() => {})
}

getList()
</script>

<style scoped>
.sq-panel-title { font-weight: 600; margin-bottom: 8px; color: #303133 }
</style>
