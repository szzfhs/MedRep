<template>
  <div class="app-container sim-system-page">

    <!-- 页面标题装饰线 -->
    <div class="page-header-bar">
      <div class="title-accent" />
      <h2 class="page-title">实验系统管理</h2>
    </div>

    <!-- 搜索栏（白色卡片） -->
    <div class="search-card" v-show="showSearch">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="系统名称" prop="systemName">
          <el-input v-model="queryParams.systemName" placeholder="请输入系统名称" clearable style="width:200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="系统分类" prop="sysCategory">
          <el-select v-model="queryParams.sysCategory" placeholder="系统分类" clearable style="width:130px">
            <el-option v-for="d in dict.type.vf_sim_system_category" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:100px">
            <el-option label="启用" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-bar">
      <div class="toolbar-actions">
        <button class="btn-primary-action" @click="handleAdd" v-hasPermi="['simhub:simSystem:add']">
          <el-icon><Plus /></el-icon>
          <span>新增</span>
        </button>
        <button class="btn-secondary-action" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:simSystem:edit']">
          <el-icon><Edit /></el-icon>
          <span>修改</span>
        </button>
        <button class="btn-danger-action" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:simSystem:remove']">
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </button>
      </div>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </div>

    <!-- 表格容器（白色卡片） -->
    <div class="table-card">
      <el-table v-loading="loading" :data="simSystemList" @selection-change="handleSelectionChange" class="sys-table">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="ID" prop="simSystemId" width="70" align="center" />
        <el-table-column label="系统名称" prop="systemName" :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="系统分类" prop="sysCategory" width="120" align="center">
          <template #default="{ row }">
            <dict-tag :options="dict.type.vf_sim_system_category" :value="row.sysCategory" />
          </template>
        </el-table-column>
        <el-table-column label="支持硬件" prop="hwSupport" width="200" align="center">
          <template #default="{ row }">
            <span v-if="row.hwSupport" class="hw-tags">
              <span v-for="hw in row.hwSupport.split(',')" :key="hw" :class="['hw-tag', `hw-tag--${hw}`]">
                {{ hw === 'helmet' ? 'VR头盔' : hw === 'zspace' ? 'zSpace' : hw === 'pc' ? 'PC桌面' : hw }}
              </span>
            </span>
            <span v-else class="cell-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="查看次数" prop="viewCount" width="90" align="center" />
        <el-table-column label="状态" prop="status" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', row.status === '1' ? 'status-badge--on' : 'status-badge--off']">
              {{ row.status === '1' ? '启用' : '停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="110" align="center">
          <template #default="{ row }">
            <span class="cell-secondary">{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="110">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn action-btn--edit" title="修改" @click="handleUpdate(row)" v-hasPermi="['simhub:simSystem:edit']">
                <el-icon><Edit /></el-icon>
              </button>
              <button class="action-btn action-btn--del" title="删除" @click="handleDelete(row)" v-hasPermi="['simhub:simSystem:remove']">
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-pagination-bar">
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </div>
    </div>

    <!-- 新增/编辑抽屉 -->
    <el-drawer
      :title="drawerTitle"
      v-model="drawerOpen"
      direction="rtl"
      size="700px"
      destroy-on-close
    >
      <el-form ref="simSystemRef" :model="form" :rules="rules" label-width="110px" class="drawer-form">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="form.systemName" placeholder="请输入系统名称" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="系统分类" prop="sysCategory">
              <el-select v-model="form.sysCategory" placeholder="请选择" style="width:100%">
                <el-option v-for="d in dict.type.vf_sim_system_category" :key="d.value" :label="d.label" :value="d.value" />
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
          <el-col :span="16">
            <el-form-item label="封面图">
              <image-upload v-model="form.coverImage" :limit="1" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="推荐硬件配置">
              <el-input v-model="form.hwRecommend" type="textarea" :rows="2" placeholder="请输入推荐硬件配置信息" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="支持硬件设备">
              <div class="hw-selector">
                <button
                  v-for="opt in hwOptions" :key="opt.value" type="button"
                  :class="['hw-selector-btn', hwSupportArr.includes(opt.value) ? `hw-selector-btn--active hw-tag--${opt.value}` : 'hw-selector-btn--inactive']"
                  @click="toggleHw(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="系统详情">
              <editor v-model="form.systemDetail" :min-height="220" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="图集管理">
              <div class="image-gallery">
                <div v-for="(img, idx) in galleryImages" :key="idx" class="gallery-item">
                  <el-image :src="img && (img.startsWith('http') || img.startsWith('blob')) ? img : baseUrl + img" fit="cover" class="gallery-thumb" />
                  <el-button link type="danger" icon="Delete" size="small" @click="removeGalleryImage(idx)" />
                </div>
                <el-upload
                  action="#"
                  :show-file-list="false"
                  :http-request="uploadGalleryImage"
                  accept="image/*"
                  class="gallery-uploader"
                >
                  <el-icon class="gallery-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </div>
              <div class="mt8">
                <el-input v-model="galleryInputUrl" placeholder="或直接输入图片URL后回车添加" @keyup.enter="addGalleryImageByUrl" clearable>
                  <template #append><el-button @click="addGalleryImageByUrl">添加</el-button></template>
                </el-input>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <button class="btn-secondary-action" @click="drawerOpen = false">取 消</button>
          <button class="btn-primary-action" @click="submitForm">确 定</button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="SimhubSimSystem">
import { listSimSystem, getSimSystem, addSimSystem, updateSimSystem, delSimSystem } from '@/api/simhub/sim_system'
import request from '@/utils/request'

const baseUrl = import.meta.env.VITE_APP_BASE_API

const { proxy } = getCurrentInstance()
const { vf_sim_system_category } = proxy.useDict('vf_sim_system_category')

const dict = reactive({ type: { vf_sim_system_category } })

const simSystemList = ref([])
const drawerOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const drawerTitle = ref('')

// 支持硬件复选框（逗号分隔字符串↔数组互转）
const hwSupportArr = ref([])
// 图集URL列表
const galleryImages = ref([])
const galleryInputUrl = ref('')

const hwOptions = [
  { value: 'helmet', label: 'VR头盔' },
  { value: 'pc',     label: 'PC桌面' },
  { value: 'zspace', label: 'zSpace' },
]
function toggleHw(val) {
  const idx = hwSupportArr.value.indexOf(val)
  if (idx === -1) hwSupportArr.value.push(val)
  else hwSupportArr.value.splice(idx, 1)
}

const data = reactive({
  form: {},
  queryParams: { pageNum: 1, pageSize: 10, systemName: undefined, sysCategory: undefined, status: undefined },
  rules: {
    systemName: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }],
    sysCategory: [{ required: true, message: '系统分类不能为空', trigger: 'change' }]
  }
})
const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listSimSystem(queryParams.value).then(res => {
    simSystemList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

function reset() {
  form.value = {
    simSystemId: undefined, systemName: undefined, sysCategory: undefined,
    status: '1', hwRecommend: undefined, hwSupport: undefined,
    systemDetail: undefined, coverImage: undefined
  }
  hwSupportArr.value = []
  galleryImages.value = []
  galleryInputUrl.value = ''
  proxy.resetForm('simSystemRef')
}

function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(sel) { ids.value = sel.map(i => i.simSystemId); single.value = sel.length !== 1; multiple.value = !sel.length }
function handleAdd() { reset(); drawerTitle.value = '新增实验系统'; drawerOpen.value = true }

function handleUpdate(row) {
  reset()
  const simSystemId = row.simSystemId || ids.value[0]
  getSimSystem(simSystemId).then(res => {
    const d = res.data
    form.value = { ...d }
    hwSupportArr.value = d.hwSupport ? d.hwSupport.split(',').filter(Boolean) : []
    galleryImages.value = (d.images || []).map(img => (typeof img === 'string' ? img : img.imageUrl))
    drawerTitle.value = '修改实验系统'
    drawerOpen.value = true
  })
}

function addGalleryImageByUrl() {
  const url = galleryInputUrl.value?.trim()
  if (url && !galleryImages.value.includes(url)) {
    galleryImages.value.push(url)
  }
  galleryInputUrl.value = ''
}

function removeGalleryImage(idx) {
  galleryImages.value.splice(idx, 1)
}

async function uploadGalleryImage({ file }) {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await request({ url: '/common/upload', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
    if (res.code === 200 && res.fileName) {
      galleryImages.value.push(res.fileName)
    } else {
      proxy.$modal.msgError(res.msg || '上传失败')
    }
  } catch (e) {
    proxy.$modal.msgError('上传失败')
  }
}

function submitForm() {
  proxy.$refs.simSystemRef.validate(valid => {
    if (!valid) return
    const payload = {
      ...form.value,
      hwSupport: hwSupportArr.value.join(','),
      images: galleryImages.value
    }
    const api = form.value.simSystemId ? updateSimSystem : addSimSystem
    api(payload).then(() => {
      proxy.$modal.msgSuccess('操作成功')
      drawerOpen.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const simSystemIds = row.simSystemId || ids.value.join(',')
  proxy.$modal.confirm('确认删除选中的实验系统数据？').then(() => delSimSystem(simSystemIds))
    .then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }).catch(() => {})
}

getList()
</script>

<style scoped>
/* =========================================
   设计规范变量
   ========================================= */
.sim-system-page {
  --c-primary:       #0B5394;
  --c-primary-hover: #1565C0;
  --c-danger:        #E53935;
  --c-danger-hover:  #C62828;
  --c-secondary-bg:  #F0F4F8;
  --c-border:        #E2E8F0;
  --c-text-main:     #1A2332;
  --c-text-sub:      #475569;
  --c-text-muted:    #94A3B8;
  --c-card:          #FFFFFF;
  --c-input-bg:      #F8FAFC;
}

/* =========================================
   页面标题装饰线
   ========================================= */
.page-header-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.title-accent {
  width: 4px;
  height: 20px;
  border-radius: 9999px;
  background-color: var(--c-primary);
  flex-shrink: 0;
}
.page-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--c-text-main);
  margin: 0;
}

/* =========================================
   搜索栏卡片
   ========================================= */
.search-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 16px 20px 4px;
  margin-bottom: 12px;
}

/* =========================================
   工具栏
   ========================================= */
.toolbar-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* =========================================
   通用按钮
   ========================================= */
.btn-primary-action,
.btn-secondary-action,
.btn-danger-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color 0.2s, box-shadow 0.2s, opacity 0.2s;
  line-height: 1;
}
.btn-primary-action {
  background: var(--c-primary);
  color: #fff;
  box-shadow: 0 2px 6px rgba(11, 83, 148, 0.2);
}
.btn-primary-action:hover { background: var(--c-primary-hover); }
.btn-secondary-action {
  background: var(--c-card);
  color: var(--c-text-sub);
  border-color: var(--c-border);
}
.btn-secondary-action:hover { background: var(--c-secondary-bg); }
.btn-danger-action {
  background: var(--c-card);
  color: var(--c-danger);
  border-color: #fca5a5;
}
.btn-danger-action:hover { background: #fff5f5; }
.btn-primary-action:disabled,
.btn-secondary-action:disabled,
.btn-danger-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* =========================================
   表格卡片容器
   ========================================= */
.table-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
}

/* Element Plus 表格样式覆盖 */
.sim-system-page :deep(.sys-table .el-table__header-wrapper th) {
  background: var(--c-input-bg);
  color: var(--c-text-muted);
  font-size: 12px;
  font-weight: 500;
  border-bottom: 1px solid var(--c-border);
}
.sim-system-page :deep(.sys-table .el-table__row:hover > td) {
  background: #f8fafc !important;
}
.sim-system-page :deep(.sys-table .el-table__row > td) {
  border-bottom: 1px solid #f1f5f9;
  color: var(--c-text-sub);
  font-size: 13px;
}
.sim-system-page :deep(.sys-table) {
  border-radius: 0;
}
.sim-system-page :deep(.sys-table .el-table__inner-wrapper::before) {
  display: none;
}

.table-pagination-bar {
  border-top: 1px solid var(--c-border);
  background: var(--c-input-bg);
  padding: 4px 8px;
}

/* =========================================
   状态徽章
   ========================================= */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}
.status-badge--on  { background: #E8F5E9; color: #2E7D32; }
.status-badge--off { background: #FFF0F0; color: #E53935; }

/* =========================================
   硬件标签（列表）
   ========================================= */
.hw-tags { display: inline-flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.hw-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.6;
}
.hw-tag--helmet { background: #EDE9FE; color: #6D28D9; }   /* VR头盔 紫色系 */
.hw-tag--zspace { background: #D1FAE5; color: #065F46; }   /* zSpace 绿色系 */
.hw-tag--pc     { background: #FEF3C7; color: #92400E; }   /* PC 琥珀色系 */

/* =========================================
   操作按钮（表格行内）
   ========================================= */
.action-btns {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  font-size: 14px;
}
.action-btn--edit {
  color: #64748B;
  background: transparent;
}
.action-btn--edit:hover {
  color: var(--c-primary);
  background: #DBEAFE;
}
.action-btn--del {
  color: #64748B;
  background: transparent;
}
.action-btn--del:hover {
  color: var(--c-danger);
  background: #FFF0F0;
}

/* =========================================
   辅助文字
   ========================================= */
.cell-secondary { color: var(--c-text-muted); font-size: 12px; }
.cell-muted     { color: var(--c-text-muted); }

/* =========================================
   硬件多选按钮（Drawer 表单）
   ========================================= */
.hw-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hw-selector-btn {
  padding: 6px 14px;
  border-radius: 10px;
  border: 2px solid transparent;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.hw-selector-btn--inactive {
  background: var(--c-input-bg);
  color: var(--c-text-muted);
  border-color: var(--c-border);
}
.hw-selector-btn--inactive:hover { border-color: #CBD5E1; }
/* 激活态颜色复用 hw-tag 色彩，border 继承 currentColor */
.hw-selector-btn--active { border-color: currentColor; }

/* =========================================
   Drawer 底部按钮
   ========================================= */
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 4px 0;
}

/* =========================================
   图集样式
   ========================================= */
.image-gallery { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.gallery-item  { position: relative; display: inline-flex; flex-direction: column; align-items: center; gap: 2px; }
.gallery-thumb { width: 80px; height: 60px; border-radius: 8px; border: 1px solid var(--c-border); }
.gallery-uploader {
  width: 80px; height: 60px;
  border: 1px dashed #CBD5E1; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: border-color 0.15s;
}
.gallery-uploader:hover { border-color: var(--c-primary); }
.gallery-uploader-icon { font-size: 20px; color: #94A3B8; }
.drawer-form { padding-right: 16px; }
.mt8  { margin-top: 8px; }
</style>
