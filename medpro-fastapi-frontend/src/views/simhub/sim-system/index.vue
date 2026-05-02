<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:simSystem:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:simSystem:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:simSystem:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="simSystemList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="simSystemId" width="80" align="center" />
      <el-table-column label="系统名称" prop="systemName" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="系统分类" prop="sysCategory" width="110" align="center">
        <template #default="{ row }">
          <dict-tag :options="dict.type.vf_sim_system_category" :value="row.sysCategory" />
        </template>
      </el-table-column>
      <el-table-column label="支持硬件" prop="hwSupport" width="160" align="center">
        <template #default="{ row }">
          <span v-if="row.hwSupport">
            <el-tag v-for="hw in row.hwSupport.split(',')" :key="hw" size="small" class="mr4">
              {{ hw === 'helmet' ? '头盔' : hw === 'zspace' ? 'zSpace' : hw === 'pc' ? 'PC' : hw }}
            </el-tag>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="查看次数" prop="viewCount" width="90" align="center" />
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'danger'">{{ row.status === '1' ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="120" align="center">
        <template #default="{ row }"><span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span></template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="{ row }">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:simSystem:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:simSystem:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

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
              <el-checkbox-group v-model="hwSupportArr">
                <el-checkbox value="helmet">VR头盔</el-checkbox>
                <el-checkbox value="pc">PC桌面</el-checkbox>
                <el-checkbox value="zspace">zSpace</el-checkbox>
              </el-checkbox-group>
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
        <div style="text-align:right">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="drawerOpen = false">取 消</el-button>
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
.drawer-form { padding-right: 16px }
.mr4 { margin-right: 4px }
.mt8 { margin-top: 8px }
.image-gallery { display: flex; flex-wrap: wrap; gap: 8px; align-items: center }
.gallery-item { position: relative; display: inline-flex; flex-direction: column; align-items: center; gap: 2px }
.gallery-thumb { width: 80px; height: 60px; border-radius: 4px; border: 1px solid #eee }
.gallery-uploader {
  width: 80px; height: 60px; border: 1px dashed #d9d9d9; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.gallery-uploader:hover { border-color: #409eff }
.gallery-uploader-icon { font-size: 20px; color: #8c939d }
</style>
