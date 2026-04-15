<template>
  <div class="app-container">
    <el-row :gutter="16">
      <!-- 左：分类树 -->
      <el-col :span="5">
        <el-card shadow="never">
          <template #header>
            <div class="flex-between">
              <span>实验分类</span>
              <el-button size="small" type="primary" icon="Plus" @click="handleAddCategory(null)" v-hasPermi="['simhub:experiment:add']" />
            </div>
          </template>
          <el-tree
            :data="categoryTree"
            :props="{ label: 'categoryName', children: 'children' }"
            node-key="categoryId"
            highlight-current
            @node-click="handleCategoryClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node-label">{{ node.label }}</span>
              <span class="tree-node-btns">
                <el-button link type="primary" icon="Edit" size="small" @click.stop="handleEditCategory(data)" v-hasPermi="['simhub:experiment:edit']" />
                <el-button link type="danger" icon="Delete" size="small" @click.stop="handleDeleteCategory(data)" v-hasPermi="['simhub:experiment:remove']" />
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右：实验列表 -->
      <el-col :span="19">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
          <el-form-item label="实验名称" prop="expName">
            <el-input v-model="queryParams.expName" placeholder="请输入实验名称" clearable style="width:180px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:experiment:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:experiment:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:experiment:remove']">删除</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" :data="experimentList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="expId" width="80" align="center" />
          <el-table-column label="实验名称" prop="expName" :show-overflow-tooltip="true" />
          <el-table-column label="类型" prop="expType" width="80" align="center" />
          <el-table-column label="浏览量" prop="viewCount" width="80" align="center" />
          <el-table-column label="参与次数" prop="participateCount" width="90" align="center" />
          <el-table-column label="状态" prop="status" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === '1' ? 'success' : 'danger'">{{ row.status === '1' ? '启用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:experiment:edit']">修改</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:experiment:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 分类对话框 -->
    <el-dialog :title="categoryDialogTitle" v-model="categoryOpen" width="560px" append-to-body destroy-on-close>
      <el-form ref="categoryRef" :model="categoryForm" :rules="categoryRules" label-width="90px">
        <el-form-item label="上级分类" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryTree"
            :props="{ label: 'categoryName', value: 'categoryId', children: 'children' }"
            placeholder="请选择上级分类（空为顶级）"
            clearable check-strictly style="width:100%"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitCategoryForm">确 定</el-button>
        <el-button @click="categoryOpen = false">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 实验对话框 -->
    <el-dialog :title="dialogTitle" v-model="open" width="800px" append-to-body destroy-on-close>
      <el-form ref="experimentRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="实验名称" prop="expName">
              <el-input v-model="form.expName" placeholder="请输入实验名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验分类" prop="categoryId">
              <el-tree-select
                v-model="form.categoryId"
                :data="categoryTree"
                :props="{ label: 'categoryName', value: 'categoryId', children: 'children' }"
                placeholder="请选择分类" style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验类型" prop="expType">
              <el-select v-model="form.expType" placeholder="请选择" style="width:100%">
                <el-option label="Web仿真" value="web" /><el-option label="客户端" value="exe" /><el-option label="视频" value="video" />
              </el-select>
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
            <el-form-item label="启动URL" prop="launchUrl">
              <el-input v-model="form.launchUrl" placeholder="请输入实验启动URL" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="封面图">
              <image-upload v-model="form.coverImage" :limit="1" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="简介" prop="description">
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
  </div>
</template>

<script setup name="SimhubExperiment">
import {
  listExperimentCategoryTree, addExperimentCategory, updateExperimentCategory, delExperimentCategory,
  listExperiment, getExperiment, addExperiment, updateExperiment, delExperiment
} from '@/api/simhub/experiment'

const { proxy } = getCurrentInstance()

// ——— 分类树 ———
const categoryTree = ref([])

async function loadCategoryTree() {
  const res = await listExperimentCategoryTree()
  categoryTree.value = res.data || []
}

const categoryOpen = ref(false)
const categoryDialogTitle = ref('')
const categoryForm = ref({})
const categoryRules = { categoryName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }] }

function handleAddCategory(parent) {
  categoryForm.value = { categoryId: undefined, categoryName: undefined, parentId: parent?.categoryId, sortOrder: 0 }
  categoryDialogTitle.value = '新增实验分类'; categoryOpen.value = true
}

function handleEditCategory(data) {
  categoryForm.value = { ...data }
  categoryDialogTitle.value = '编辑实验分类'; categoryOpen.value = true
}

function submitCategoryForm() {
  proxy.$refs.categoryRef.validate(valid => {
    if (!valid) return
    const api = categoryForm.value.categoryId ? updateExperimentCategory : addExperimentCategory
    api(categoryForm.value).then(() => { proxy.$modal.msgSuccess('操作成功'); categoryOpen.value = false; loadCategoryTree() })
  })
}

function handleDeleteCategory(data) {
  proxy.$modal.confirm(`确认删除分类"${data.categoryName}"？`).then(() => delExperimentCategory(data.categoryId))
    .then(() => { proxy.$modal.msgSuccess('删除成功'); loadCategoryTree() }).catch(() => {})
}

// ——— 实验列表 ———
const experimentList = ref([])
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
  queryParams: { pageNum: 1, pageSize: 10, expName: undefined, categoryId: undefined, status: undefined },
  rules: { expName: [{ required: true, message: '实验名称不能为空', trigger: 'blur' }] }
})
const { queryParams, form, rules } = toRefs(data)

function handleCategoryClick(data) {
  queryParams.value.categoryId = data.categoryId
  queryParams.value.pageNum = 1
  getList()
}

function getList() {
  loading.value = true
  listExperiment(queryParams.value).then(res => { experimentList.value = res.rows; total.value = res.total; loading.value = false })
}

function reset() { form.value = { expId: undefined, expName: undefined, categoryId: undefined, expType: 'web', launchUrl: undefined, description: undefined, status: '1', sortOrder: 0 }; proxy.resetForm('experimentRef') }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); queryParams.value.categoryId = undefined; handleQuery() }
function handleSelectionChange(sel) { ids.value = sel.map(i => i.expId); single.value = sel.length !== 1; multiple.value = !sel.length }
function handleAdd() { reset(); dialogTitle.value = '新增实验'; open.value = true }

function handleUpdate(row) {
  reset()
  const expId = row.expId || ids.value[0]
  getExperiment(expId).then(res => { form.value = res.data; dialogTitle.value = '修改实验'; open.value = true })
}

function submitForm() {
  proxy.$refs.experimentRef.validate(valid => {
    if (!valid) return
    const api = form.value.expId ? updateExperiment : addExperiment
    api(form.value).then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() })
  })
}

function handleDelete(row) {
  const expIds = row.expId || ids.value.join(',')
  proxy.$modal.confirm('确认删除选中的实验数据？').then(() => delExperiment(expIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }).catch(() => {})
}

loadCategoryTree()
getList()
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between }
.tree-node-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.tree-node-btns { flex-shrink: 0; margin-left: 4px }
</style>
