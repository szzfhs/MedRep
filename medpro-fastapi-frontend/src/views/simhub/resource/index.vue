<template>
  <div class="app-container">
    <el-row :gutter="16">
      <!-- 左：分类树 -->
      <el-col :span="5">
        <el-card shadow="never">
          <template #header>
            <div class="flex-between">
              <span>资源分类</span>
              <el-button size="small" type="primary" icon="Plus" @click="handleAddCategory(null)" v-hasPermi="['simhub:resource:add']" />
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
                <el-button link type="primary" icon="Edit" size="small" @click.stop="handleEditCategory(data)" v-hasPermi="['simhub:resource:edit']" />
                <el-button link type="danger" icon="Delete" size="small" @click.stop="handleDeleteCategory(data)" v-hasPermi="['simhub:resource:remove']" />
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右：资源列表 -->
      <el-col :span="19">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
          <el-form-item label="资源名称" prop="resourceName">
            <el-input v-model="queryParams.resourceName" placeholder="请输入资源名称" clearable style="width:180px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="类型" prop="resourceType">
            <el-select v-model="queryParams.resourceType" placeholder="资源类型" clearable style="width:120px">
              <el-option v-for="d in dict.type.vf_resource_type" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:resource:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:resource:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:resource:remove']">删除</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" :data="resourceList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="resourceId" width="80" align="center" />
          <el-table-column label="资源名称" prop="resourceName" :show-overflow-tooltip="true" />
          <el-table-column label="类型" prop="resourceType" width="100" align="center">
            <template #default="{ row }">
              <dict-tag :options="dict.type.vf_resource_type" :value="row.resourceType" />
            </template>
          </el-table-column>
          <el-table-column label="文件大小" prop="fileSize" width="100" align="center">
            <template #default="{ row }"><span>{{ row.fileSize ? (row.fileSize / 1024).toFixed(1) + 'KB' : '-' }}</span></template>
          </el-table-column>
          <el-table-column label="浏览量" prop="viewCount" width="80" align="center" />
          <el-table-column label="下载量" prop="downloadCount" width="80" align="center" />
          <el-table-column label="允许下载" prop="allowDownload" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.allowDownload === '0' ? 'success' : 'info'" size="small">{{ row.allowDownload === '0' ? '是' : '否' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:resource:edit']">修改</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:resource:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 分类对话框 -->
    <el-dialog :title="categoryDialogTitle" v-model="categoryOpen" width="520px" append-to-body destroy-on-close>
      <el-form ref="categoryRef" :model="categoryForm" :rules="categoryRules" label-width="90px">
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryTree"
            :props="{ label: 'categoryName', value: 'categoryId', children: 'children' }"
            placeholder="顶级分类" clearable check-strictly style="width:100%"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitCategoryForm">确 定</el-button>
        <el-button @click="categoryOpen = false">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 资源对话框 -->
    <el-dialog :title="dialogTitle" v-model="open" width="720px" append-to-body destroy-on-close>
      <el-form ref="resourceRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="资源名称" prop="resourceName">
              <el-input v-model="form.resourceName" placeholder="请输入资源名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源类型" prop="resourceType">
              <el-select v-model="form.resourceType" placeholder="请选择" style="width:100%">
                <el-option v-for="d in dict.type.vf_resource_type" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="资源分类" prop="categoryId">
              <el-tree-select
                v-model="form.categoryId"
                :data="categoryTree"
                :props="{ label: 'categoryName', value: 'categoryId', children: 'children' }"
                placeholder="请选择分类" style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="允许下载">
              <el-switch v-model="form.allowDownload" active-value="0" inactive-value="1" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="文件URL" prop="fileUrl">
              <el-input v-model="form.fileUrl" placeholder="请输入或上传文件URL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件格式">
              <el-input v-model="form.fileFormat" placeholder="如: mp4、pdf、docx" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件大小(字节)">
              <el-input-number v-model="form.fileSize" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="正文内容">
              <editor v-model="form.resourceContent" :min-height="200" />
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

<script setup name="SimhubResource">
import {
  listResourceCategoryTree, addResourceCategory, updateResourceCategory, delResourceCategory,
  listResource, getResource, addResource, updateResource, delResource
} from '@/api/simhub/resource'

const { proxy } = getCurrentInstance()
const { vf_resource_type } = proxy.useDict('vf_resource_type')
const dict = reactive({ type: { vf_resource_type } })

// ——— 分类树 ———
const categoryTree = ref([])
async function loadCategoryTree() {
  const res = await listResourceCategoryTree()
  categoryTree.value = res.data || []
}

const categoryOpen = ref(false)
const categoryDialogTitle = ref('')
const categoryForm = ref({})
const categoryRules = { categoryName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }] }

function handleAddCategory() {
  categoryForm.value = { categoryId: undefined, categoryName: undefined, parentId: undefined, sortOrder: 0 }
  categoryDialogTitle.value = '新增资源分类'; categoryOpen.value = true
}
function handleEditCategory(data) {
  categoryForm.value = { ...data }; categoryDialogTitle.value = '编辑资源分类'; categoryOpen.value = true
}
function submitCategoryForm() {
  proxy.$refs.categoryRef.validate(valid => {
    if (!valid) return
    const api = categoryForm.value.categoryId ? updateResourceCategory : addResourceCategory
    api(categoryForm.value).then(() => { proxy.$modal.msgSuccess('操作成功'); categoryOpen.value = false; loadCategoryTree() })
  })
}
function handleDeleteCategory(data) {
  proxy.$modal.confirm(`确认删除分类"${data.categoryName}"？`).then(() => delResourceCategory(data.categoryId))
    .then(() => { proxy.$modal.msgSuccess('删除成功'); loadCategoryTree() }).catch(() => {})
}

// ——— 资源列表 ———
const resourceList = ref([])
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
  queryParams: { pageNum: 1, pageSize: 10, resourceName: undefined, resourceType: undefined, categoryId: undefined },
  rules: {
    resourceName: [{ required: true, message: '资源名称不能为空', trigger: 'blur' }],
    resourceType: [{ required: true, message: '资源类型不能为空', trigger: 'change' }],
    fileUrl: [{ required: true, message: '文件URL不能为空', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)

function handleCategoryClick(data) { queryParams.value.categoryId = data.categoryId; queryParams.value.pageNum = 1; getList() }

function getList() {
  loading.value = true
  listResource(queryParams.value).then(res => { resourceList.value = res.rows; total.value = res.total; loading.value = false })
}

function reset() { form.value = { resourceId: undefined, resourceName: undefined, resourceType: undefined, fileUrl: undefined, categoryId: undefined, allowDownload: '0', fileSize: 0, fileFormat: undefined, resourceContent: undefined }; proxy.resetForm('resourceRef') }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); queryParams.value.categoryId = undefined; handleQuery() }
function handleSelectionChange(sel) { ids.value = sel.map(i => i.resourceId); single.value = sel.length !== 1; multiple.value = !sel.length }
function handleAdd() { reset(); dialogTitle.value = '新增资源'; open.value = true }

function handleUpdate(row) {
  reset()
  const resourceId = row.resourceId || ids.value[0]
  getResource(resourceId).then(res => { form.value = res.data; dialogTitle.value = '修改资源'; open.value = true })
}

function submitForm() {
  proxy.$refs.resourceRef.validate(valid => {
    if (!valid) return
    const api = form.value.resourceId ? updateResource : addResource
    api(form.value).then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() })
  })
}

function handleDelete(row) {
  const resourceIds = row.resourceId || ids.value.join(',')
  proxy.$modal.confirm('确认删除选中的资源数据？').then(() => delResource(resourceIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }).catch(() => {})
}

loadCategoryTree()
getList()
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between }
.tree-node-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.tree-node-btns { flex-shrink: 0; margin-left: 4px }
</style>
