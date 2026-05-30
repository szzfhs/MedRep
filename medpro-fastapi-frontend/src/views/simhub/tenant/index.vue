<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="学校名称" prop="tenantName">
        <el-input v-model="queryParams.tenantName" placeholder="请输入学校名称" clearable style="width:180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="学校编码" prop="tenantCode">
        <el-input v-model="queryParams.tenantCode" placeholder="请输入学校编码" clearable style="width:140px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="租户状态" clearable style="width:110px">
          <el-option label="启用" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:tenant:add']">新增学校</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:tenant:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:tenant:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 租户列表 -->
    <el-table v-loading="loading" :data="tenantList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="tenantId" width="70" align="center" />
      <el-table-column label="学校编码" prop="tenantCode" width="110" align="center">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.tenantCode }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="学校名称" prop="tenantName" min-width="150" />
      <el-table-column label="子域名" prop="subdomain" width="120" align="center">
        <template #default="{ row }">
          <span v-if="row.subdomain">{{ row.subdomain }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="联系邮箱" prop="contactEmail" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="联系电话" prop="contactPhone" width="120" align="center" />
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="110" align="center">
        <template #default="{ row }"><span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span></template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="DataAnalysis" @click="handleStats(row)" v-hasPermi="['simhub:tenant:query']">统计</el-button>
          <el-button link type="warning" icon="Key" @click="handleGrant(row)" v-hasPermi="['simhub:tenant:grant']">授权</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:tenant:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:tenant:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="open" width="680px" append-to-body destroy-on-close>
      <el-form ref="tenantRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学校名称" prop="tenantName">
              <el-input v-model="form.tenantName" placeholder="如：杭州师范大学" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学校编码" prop="tenantCode">
              <el-input v-model="form.tenantCode" placeholder="如：hzsf（唯一标识）" :disabled="form.tenantId != null" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子域名" prop="subdomain">
              <el-input v-model="form.subdomain" placeholder="如：hzsf（用于门户访问）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="0">启用</el-radio>
                <el-radio value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="form.contactEmail" placeholder="联系邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="学校详细地址" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 统计抽屉 -->
    <el-drawer v-model="statsDrawer" title="学校统计数据" size="400px" :destroy-on-close="true">
      <div v-loading="statsLoading" class="stats-container">
        <div v-if="currentStats" class="stats-header">
          <el-tag type="success" size="large">{{ currentTenant.tenantName }}</el-tag>
          <span class="tenant-code">{{ currentTenant.tenantCode }}</span>
        </div>
        <el-row :gutter="16" class="stats-cards" v-if="currentStats">
          <el-col :span="12">
            <el-statistic title="注册用户" :value="currentStats.userCount" suffix="人">
              <template #prefix><el-icon color="#409EFF"><User /></el-icon></template>
            </el-statistic>
          </el-col>
          <el-col :span="12">
            <el-statistic title="课程总数" :value="currentStats.courseCount" suffix="门">
              <template #prefix><el-icon color="#67C23A"><Reading /></el-icon></template>
            </el-statistic>
          </el-col>
          <el-col :span="12" class="mt16">
            <el-statistic title="实验总数" :value="currentStats.experimentCount" suffix="个">
              <template #prefix><el-icon color="#E6A23C"><Operation /></el-icon></template>
            </el-statistic>
          </el-col>
          <el-col :span="12" class="mt16">
            <el-statistic title="授权内容" :value="currentStats.grantCount" suffix="项">
              <template #prefix><el-icon color="#F56C6C"><Key /></el-icon></template>
            </el-statistic>
          </el-col>
          <el-col :span="12" class="mt16">
            <el-statistic title="新闻动态" :value="currentStats.newsCount" suffix="条">
              <template #prefix><el-icon color="#909399"><Document /></el-icon></template>
            </el-statistic>
          </el-col>
          <el-col :span="12" class="mt16">
            <el-statistic title="资源数量" :value="currentStats.resourceCount" suffix="个">
              <template #prefix><el-icon color="#909399"><Files /></el-icon></template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>
    </el-drawer>

    <!-- 内容授权对话框 -->
    <el-dialog
      :title="`内容授权管理 — ${currentTenant.tenantName || ''}`"
      v-model="grantOpen"
      width="780px"
      append-to-body
      :destroy-on-close="true"
    >
      <div class="grant-toolbar mb8">
        <el-select v-model="grantFilter" placeholder="按类型筛选" clearable style="width:140px" @change="loadGrants">
          <el-option label="全部" value="" />
          <el-option label="课程" value="course" />
          <el-option label="实验" value="experiment" />
          <el-option label="资源" value="resource" />
          <el-option label="仿真系统" value="sim_system" />
        </el-select>
        <el-button type="primary" icon="Plus" class="ml8" @click="addGrantRow" v-hasPermi="['simhub:tenant:grant']">添加授权</el-button>
      </div>
      <el-table v-loading="grantLoading" :data="grantList" border size="small">
        <el-table-column label="内容类型" prop="contentType" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="contentTypeTag(row.contentType)" size="small">{{ contentTypeLabel(row.contentType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容ID" prop="contentId" width="90" align="center" />
        <el-table-column label="授权时间" prop="grantTime" width="110" align="center">
          <template #default="{ row }"><span>{{ parseTime(row.grantTime, '{y}-{m}-{d}') }}</span></template>
        </el-table-column>
        <el-table-column label="授权人" prop="grantedBy" width="100" align="center" />
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
              {{ row.status === '0' ? '有效' : '已撤销' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="80">
          <template #default="{ row }">
            <el-button v-if="row.status === '0'" link type="danger" icon="Delete"
              @click="handleRevoke(row)" v-hasPermi="['simhub:tenant:grant']">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加授权子表单 -->
      <el-divider v-if="showAddGrant" />
      <el-form v-if="showAddGrant" :model="newGrant" :inline="true" ref="grantFormRef">
        <el-form-item label="类型" prop="contentType" required>
          <el-select v-model="newGrant.contentType" style="width:120px" placeholder="内容类型">
            <el-option label="课程" value="course" />
            <el-option label="实验" value="experiment" />
            <el-option label="资源" value="resource" />
            <el-option label="仿真系统" value="sim_system" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容ID" prop="contentId" required>
          <el-input-number v-model="newGrant.contentId" :min="1" placeholder="ID" style="width:120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" :loading="grantSubmitting" @click="submitGrant">确认授权</el-button>
          <el-button size="small" @click="showAddGrant = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Reading, Operation, Key, Document, Files } from '@element-plus/icons-vue'
import { parseTime } from '@/utils/ruoyi'
import {
  listTenant, getTenant, addTenant, updateTenant, delTenant,
  getTenantStats, getTenantGrants, grantContent, revokeContent
} from '@/api/simhub/tenant'

// ── 列表 ──────────────────────────────────────────────
const loading = ref(false)
const showSearch = ref(true)
const tenantList = ref([])
const total = ref(0)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tenantName: '',
  tenantCode: '',
  status: ''
})

async function getList() {
  loading.value = true
  try {
    const res = await listTenant(queryParams)
    tenantList.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.tenantName = ''; queryParams.tenantCode = ''; queryParams.status = ''; handleQuery() }
function handleSelectionChange(selection) {
  ids.value = selection.map(s => s.tenantId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// ── CRUD ──────────────────────────────────────────────
const open = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const tenantRef = ref(null)
const form = reactive({
  tenantId: null, tenantCode: '', tenantName: '', subdomain: '',
  contactEmail: '', contactPhone: '', address: '', status: '0', remark: ''
})
const rules = {
  tenantName: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  tenantCode: [{ required: true, message: '请输入学校编码', trigger: 'blur' }],
  status: [{ required: true }]
}

function resetForm() {
  Object.assign(form, {
    tenantId: null, tenantCode: '', tenantName: '', subdomain: '',
    contactEmail: '', contactPhone: '', address: '', status: '0', remark: ''
  })
  tenantRef.value?.resetFields()
}

function cancel() { open.value = false; resetForm() }

function handleAdd() {
  resetForm()
  dialogTitle.value = '新增学校租户'
  open.value = true
}

async function handleUpdate(row) {
  const id = row?.tenantId || ids.value[0]
  const res = await getTenant(id)
  Object.assign(form, res.data)
  dialogTitle.value = '修改学校租户'
  open.value = true
}

async function submitForm() {
  await tenantRef.value.validate()
  submitLoading.value = true
  try {
    if (form.tenantId) {
      await updateTenant(form)
      ElMessage.success('修改成功')
    } else {
      await addTenant(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row) {
  const delIds = row?.tenantId ? [row.tenantId] : ids.value
  await ElMessageBox.confirm(`确认删除选中的 ${delIds.length} 个租户？删除后数据无法恢复！`, '警告', { type: 'warning' })
  await delTenant(delIds.join(','))
  ElMessage.success('删除成功')
  getList()
}

async function handleStatusChange(row) {
  const action = row.status === '0' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确认${action}【${row.tenantName}】？`, '提示', { type: 'warning' })
    await updateTenant({ tenantId: row.tenantId, status: row.status })
    ElMessage.success(`${action}成功`)
  } catch {
    row.status = row.status === '0' ? '1' : '0'
  }
}

// ── 统计抽屉 ──────────────────────────────────────────
const statsDrawer = ref(false)
const statsLoading = ref(false)
const currentStats = ref(null)
const currentTenant = ref({})

async function handleStats(row) {
  currentTenant.value = row
  currentStats.value = null
  statsDrawer.value = true
  statsLoading.value = true
  try {
    const res = await getTenantStats(row.tenantId)
    currentStats.value = res.data
  } finally {
    statsLoading.value = false
  }
}

// ── 授权管理 ──────────────────────────────────────────
const grantOpen = ref(false)
const grantLoading = ref(false)
const grantList = ref([])
const grantFilter = ref('')
const showAddGrant = ref(false)
const grantSubmitting = ref(false)
const newGrant = reactive({ contentType: 'course', contentId: null })
const grantFormRef = ref(null)

async function handleGrant(row) {
  currentTenant.value = row
  grantFilter.value = ''
  showAddGrant.value = false
  grantOpen.value = true
  await loadGrants()
}

async function loadGrants() {
  grantLoading.value = true
  try {
    const res = await getTenantGrants(currentTenant.value.tenantId, grantFilter.value || undefined)
    grantList.value = res.data || []
  } finally {
    grantLoading.value = false
  }
}

function addGrantRow() {
  newGrant.contentType = 'course'
  newGrant.contentId = null
  showAddGrant.value = true
}

async function submitGrant() {
  if (!newGrant.contentType || !newGrant.contentId) {
    ElMessage.warning('请选择内容类型并输入内容ID')
    return
  }
  grantSubmitting.value = true
  try {
    await grantContent(currentTenant.value.tenantId, {
      grants: [{ contentType: newGrant.contentType, contentId: newGrant.contentId }]
    })
    ElMessage.success('授权成功')
    showAddGrant.value = false
    await loadGrants()
  } finally {
    grantSubmitting.value = false
  }
}

async function handleRevoke(row) {
  await ElMessageBox.confirm(`确认撤销该 ${contentTypeLabel(row.contentType)} (ID: ${row.contentId}) 的授权？`, '提示', { type: 'warning' })
  await revokeContent(currentTenant.value.tenantId, row.contentType, row.contentId)
  ElMessage.success('撤销成功')
  await loadGrants()
}

// ── 工具函数 ──────────────────────────────────────────
const contentTypeMap = { course: '课程', experiment: '实验', resource: '资源', sim_system: '仿真系统' }
const contentTypeTagMap = { course: '', experiment: 'warning', resource: 'info', sim_system: 'danger' }
function contentTypeLabel(type) { return contentTypeMap[type] || type }
function contentTypeTag(type) { return contentTypeTagMap[type] || '' }

onMounted(getList)
</script>

<style scoped>
.stats-container { padding: 8px 0; }
.stats-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.tenant-code { color: #909399; font-size: 13px; }
.stats-cards { padding: 0 8px; }
.mt16 { margin-top: 16px; }
.grant-toolbar { display: flex; align-items: center; }
.ml8 { margin-left: 8px; }
.mb8 { margin-bottom: 8px; }
.text-muted { color: #c0c4cc; }
</style>
