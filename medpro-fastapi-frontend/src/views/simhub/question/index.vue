<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="习题名称" prop="questionName">
        <el-input v-model="queryParams.questionName" placeholder="请输入习题名称" clearable style="width:200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="习题类型" prop="questionType">
        <el-select v-model="queryParams.questionType" placeholder="习题类型" clearable style="width:120px">
          <el-option v-for="d in dict.type.vf_question_type" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="难度" prop="difficulty">
        <el-select v-model="queryParams.difficulty" placeholder="难度" clearable style="width:100px">
          <el-option label="简单" value="easy" /><el-option label="中等" value="medium" /><el-option label="困难" value="hard" />
        </el-select>
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:question:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:question:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:question:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="questionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="questionId" width="80" align="center" />
      <el-table-column label="习题名称" prop="questionName" :show-overflow-tooltip="true" min-width="180" />
      <el-table-column label="习题类型" prop="questionType" width="100" align="center">
        <template #default="{ row }">
          <dict-tag :options="dict.type.vf_question_type" :value="row.questionType" />
        </template>
      </el-table-column>
      <el-table-column label="难度" prop="difficulty" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.difficulty === 'hard' ? 'danger' : row.difficulty === 'medium' ? 'warning' : 'success'" size="small">
            {{ row.difficulty === 'hard' ? '困难' : row.difficulty === 'medium' ? '中等' : '简单' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'danger'" size="small">{{ row.status === '1' ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createBy" width="100" align="center" />
      <el-table-column label="创建时间" prop="createTime" width="120" align="center">
        <template #default="{ row }"><span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span></template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="{ row }">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:question:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:question:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="open" width="760px" append-to-body destroy-on-close>
      <el-form ref="questionRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="习题名称" prop="questionName">
              <el-input v-model="form.questionName" placeholder="请输入习题名称" maxlength="200" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="习题类型" prop="questionType">
              <el-select v-model="form.questionType" placeholder="请选择" style="width:100%" @change="onTypeChange">
                <el-option v-for="d in dict.type.vf_question_type" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="请选择" style="width:100%">
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="1">启用</el-radio>
                <el-radio value="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分值" prop="score">
              <el-input-number v-model="form.score" :min="0" :max="100" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="题干" prop="questionContent">
              <editor v-model="form.questionContent" :min-height="160" />
            </el-form-item>
          </el-col>

          <!-- 选项区（单选/多选题展示） -->
          <template v-if="form.questionType === 'single_choice' || form.questionType === 'multiple_choice'">
            <el-col :span="24">
              <el-form-item label="选项">
                <div v-for="(opt, idx) in optionList" :key="idx" class="option-row">
                  <el-tag style="min-width:28px; text-align:center; margin-right:6px">{{ String.fromCharCode(65 + idx) }}</el-tag>
                  <el-input v-model="opt.content" placeholder="请输入选项内容" style="flex:1" />
                  <el-button link type="danger" icon="Delete" @click="removeOption(idx)" style="margin-left:6px" />
                </div>
                <el-button size="small" icon="Plus" @click="addOption" style="margin-top:6px">添加选项</el-button>
              </el-form-item>
            </el-col>
          </template>

          <!-- 答案区 -->
          <el-col :span="24">
            <el-form-item label="正确答案" prop="correctAnswer">
              <!-- 单选题：radio 选择 -->
              <el-radio-group v-if="form.questionType === 'single_choice'" v-model="form.correctAnswer">
                <el-radio v-for="(opt, idx) in optionList" :key="idx" :value="String.fromCharCode(65 + idx)">
                  {{ String.fromCharCode(65 + idx) }}. {{ opt.content }}
                </el-radio>
              </el-radio-group>
              <!-- 多选题：checkbox 选择 -->
              <el-checkbox-group v-else-if="form.questionType === 'multiple_choice'" v-model="multiAnswerArr">
                <el-checkbox v-for="(opt, idx) in optionList" :key="idx" :value="String.fromCharCode(65 + idx)">
                  {{ String.fromCharCode(65 + idx) }}. {{ opt.content }}
                </el-checkbox>
              </el-checkbox-group>
              <!-- 判断题 -->
              <el-radio-group v-else-if="form.questionType === 'true_false'" v-model="form.correctAnswer">
                <el-radio value="T">正确</el-radio>
                <el-radio value="F">错误</el-radio>
              </el-radio-group>
              <!-- 填空/简答题 -->
              <el-input
                v-else
                v-model="form.correctAnswer"
                type="textarea"
                :rows="3"
                placeholder="请输入参考答案"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="答案解析">
              <el-input v-model="form.answerExplanation" type="textarea" :rows="3" placeholder="请输入答案解析说明" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SimhubQuestion">
import { listQuestion, getQuestion, addQuestion, updateQuestion, delQuestion } from '@/api/simhub/question'

const { proxy } = getCurrentInstance()
const { vf_question_type } = proxy.useDict('vf_question_type')
const dict = reactive({ type: { vf_question_type } })

const questionList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dialogTitle = ref('')

// 选项列表（单选/多选题用）
const optionList = ref([])
// 多选答案数组（多选题用）
const multiAnswerArr = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1, pageSize: 10,
    questionName: undefined, questionType: undefined, difficulty: undefined, status: undefined
  },
  rules: {
    questionName: [{ required: true, message: '习题名称不能为空', trigger: 'blur' }],
    questionType: [{ required: true, message: '习题类型不能为空', trigger: 'change' }],
    questionContent: [{ required: true, message: '题干不能为空', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)

// 类型变化时重置选项和答案
function onTypeChange() {
  optionList.value = []
  multiAnswerArr.value = []
  form.value.correctAnswer = undefined
  form.value.options = undefined
}

function addOption() {
  optionList.value.push({ content: '' })
}

function removeOption(idx) {
  optionList.value.splice(idx, 1)
}

function getList() {
  loading.value = true
  listQuestion(queryParams.value).then(res => {
    questionList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

function reset() {
  form.value = {
    questionId: undefined, questionName: undefined, questionType: undefined,
    difficulty: 'easy', status: '1', score: 1,
    questionContent: undefined, options: undefined,
    correctAnswer: undefined, answerExplanation: undefined
  }
  optionList.value = []
  multiAnswerArr.value = []
  proxy.resetForm('questionRef')
}

function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(sel) { ids.value = sel.map(i => i.questionId); single.value = sel.length !== 1; multiple.value = !sel.length }
function handleAdd() { reset(); dialogTitle.value = '新增习题'; open.value = true }

function handleUpdate(row) {
  reset()
  const questionId = row.questionId || ids.value[0]
  getQuestion(questionId).then(res => {
    const d = res.data
    form.value = { ...d }
    // 解析选项（options 存储为 JSON 字符串或数组）
    if (d.options) {
      try {
        const parsed = typeof d.options === 'string' ? JSON.parse(d.options) : d.options
        optionList.value = Array.isArray(parsed)
          ? parsed.map(o => (typeof o === 'string' ? { content: o } : o))
          : []
      } catch {
        optionList.value = []
      }
    }
    // 多选题答案转数组
    if (d.questionType === 'multiple_choice' && d.correctAnswer) {
      multiAnswerArr.value = d.correctAnswer.split(',').filter(Boolean)
    }
    dialogTitle.value = '修改习题'
    open.value = true
  })
}

function submitForm() {
  proxy.$refs.questionRef.validate(valid => {
    if (!valid) return
    const payload = { ...form.value }
    // 选项序列化
    if (optionList.value.length > 0) {
      payload.options = JSON.stringify(optionList.value.map(o => o.content))
    }
    // 多选答案合并
    if (form.value.questionType === 'multiple_choice') {
      payload.correctAnswer = multiAnswerArr.value.sort().join(',')
    }
    const api = form.value.questionId ? updateQuestion : addQuestion
    api(payload).then(() => {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const questionIds = row.questionId || ids.value.join(',')
  proxy.$modal.confirm('确认删除选中的习题数据？').then(() => delQuestion(questionIds))
    .then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }).catch(() => {})
}

getList()
</script>

<style scoped>
.option-row { display: flex; align-items: center; margin-bottom: 6px }
</style>
