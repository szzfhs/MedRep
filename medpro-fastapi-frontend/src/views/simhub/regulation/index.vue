<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width:200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-input v-model="queryParams.category" placeholder="请输入分类" clearable style="width:140px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:regulation:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:regulation:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:regulation:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="regulationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="regId" width="80" align="center" />
      <el-table-column label="标题" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="分类" prop="category" width="120" align="center" />
      <el-table-column label="发布日期" prop="publishDate" width="120" align="center">
        <template #default="{ row }"><span>{{ parseTime(row.publishDate, '{y}-{m}-{d}') }}</span></template>
      </el-table-column>
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'info'">{{ row.status === '1' ? '已发布' : '草稿' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:regulation:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:regulation:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="dialogTitle" v-model="open" width="900px" append-to-body destroy-on-close>
      <el-form ref="regRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="category">
              <el-input v-model="form.category" placeholder="请输入分类" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发布日期" prop="publishDate">
              <el-date-picker v-model="form.publishDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="0">草稿</el-radio>
                <el-radio value="1">发布</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="附件URL" prop="attachmentUrl">
              <el-input v-model="form.attachmentUrl" placeholder="请输入附件URL" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容" prop="content">
              <editor v-model="form.content" :min-height="240" />
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

<script setup name="SimhubRegulation">
import { listRegulation, getRegulation, addRegulation, updateRegulation, delRegulation } from '@/api/simhub/regulation'

const { proxy } = getCurrentInstance()
const regulationList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dialogTitle = ref('')

const data = reactive({
  form: {},
  queryParams: { pageNum: 1, pageSize: 10, title: undefined, category: undefined },
  rules: { title: [{ required: true, message: '标题不能为空', trigger: 'blur' }] }
})
const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listRegulation(queryParams.value).then(res => { regulationList.value = res.rows; total.value = res.total; loading.value = false })
}

function reset() { form.value = { regId: undefined, title: undefined, content: undefined, category: undefined, sortOrder: 0, status: '0' }; proxy.resetForm('regRef') }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(sel) { ids.value = sel.map(i => i.regId); single.value = sel.length !== 1; multiple.value = !sel.length }
function handleAdd() { reset(); dialogTitle.value = '新增规章制度'; open.value = true }

function handleUpdate(row) {
  reset()
  const regId = row.regId || ids.value[0]
  getRegulation(regId).then(res => { form.value = res.data; dialogTitle.value = '修改规章制度'; open.value = true })
}

function submitForm() {
  proxy.$refs.regRef.validate(valid => {
    if (!valid) return
    const api = form.value.regId ? updateRegulation : addRegulation
    api(form.value).then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() })
  })
}

function handleDelete(row) {
  const regIds = row.regId || ids.value.join(',')
  proxy.$modal.confirm('确认删除选中的规章制度数据？').then(() => delRegulation(regIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }).catch(() => {})
}

getList()
</script>
