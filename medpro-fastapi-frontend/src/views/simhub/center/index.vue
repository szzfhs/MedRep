<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">

      <!-- Tab 1: 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form ref="basicRef" :model="basicForm" :rules="basicRules" label-width="130px" v-loading="basicLoading">
          <el-divider content-position="left">展示配置</el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="中心名称" prop="centerName">
                <el-input v-model="basicForm.centerName" placeholder="如：虚拟仿真实验教学中心" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="顶部徽章文字" prop="heroBadge">
                <el-input v-model="basicForm.heroBadge" placeholder="如：国家级虚拟仿真实验教学示范中心" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="副标题宣传语" prop="centerSlogan">
                <el-input v-model="basicForm.centerSlogan" type="textarea" :rows="2" placeholder="请输入宣传语" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">统计数据</el-divider>
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="成立年份" prop="statFoundedYear">
                <el-input v-model="basicForm.statFoundedYear" placeholder="如：2018" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="实验项目数" prop="statExperiments">
                <el-input v-model="basicForm.statExperiments" placeholder="如：52" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="年服务学生" prop="statStudents">
                <el-input v-model="basicForm.statStudents" placeholder="如：1.2万+" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="实验课程数" prop="statCourses">
                <el-input v-model="basicForm.statCourses" placeholder="如：18" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">联系信息</el-divider>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="联系地址" prop="contactAddress">
                <el-input v-model="basicForm.contactAddress" placeholder="如：某市某区大学路XX号 医学院A栋3层实验中心" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="basicForm.contactPhone" placeholder="如：021-XXXX-XXXX（工作日 8:30-17:30）" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系邮箱" prop="contactEmail">
                <el-input v-model="basicForm.contactEmail" placeholder="如：simhub@medical.edu.cn" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">图片</el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Logo图片" prop="logoUrl">
                <image-upload v-model="basicForm.logoUrl" :limit="1" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Banner图片" prop="bannerUrl">
                <image-upload v-model="basicForm.bannerUrl" :limit="1" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-button type="primary" @click="saveBasic" :loading="basicSaving" v-hasPermi="['simhub:center:edit']">
              保存基本信息
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 2: 中心简介 -->
      <el-tab-pane label="中心简介" name="intro">
        <el-form ref="introRef" :model="introForm" label-width="130px" v-loading="basicLoading">
          <el-form-item label="简介正文" prop="description">
            <div class="w-full">
              <div class="mb8 text-secondary text-sm">支持多段落，使用换行分隔段落</div>
              <el-input
                v-model="introForm.description"
                type="textarea"
                :rows="8"
                placeholder="请输入中心简介正文，多段落之间用空行分隔"
              />
            </div>
          </el-form-item>

          <el-divider content-position="left">荣誉成就</el-divider>
          <div class="mb12">
            <div v-for="(item, idx) in achievementsForm" :key="idx" class="achievement-row mb8">
              <el-row :gutter="12" align="middle">
                <el-col :span="6">
                  <el-input v-model="item.label" placeholder="标题（如：国家级示范中心）" size="small" />
                </el-col>
                <el-col :span="5">
                  <el-input v-model="item.yearDesc" placeholder="说明（如：2022年获批）" size="small" />
                </el-col>
                <el-col :span="5">
                  <el-select v-model="item.iconName" placeholder="图标" size="small" style="width:100%">
                    <el-option v-for="icon in iconOptions" :key="icon.value" :label="icon.label" :value="icon.value" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-color-picker v-model="item.color" size="small" />
                  <span class="ml8 text-xs">{{ item.color }}</span>
                </el-col>
                <el-col :span="3">
                  <el-button type="danger" link @click="removeAchievement(idx)" size="small">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" link @click="addAchievement" size="small" v-hasPermi="['simhub:center:edit']">
              <el-icon><Plus /></el-icon> 添加荣誉成就
            </el-button>
          </div>

          <el-divider content-position="left">基本职能</el-divider>
          <div class="mb12">
            <div v-for="(fn, idx) in functionsForm" :key="idx" class="mb8">
              <el-row :gutter="12" align="middle">
                <el-col :span="20">
                  <el-input v-model="functionsForm[idx]" :placeholder="`职能 ${idx + 1}`" size="small" />
                </el-col>
                <el-col :span="4">
                  <el-button type="danger" link @click="removeFunction(idx)" size="small">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" link @click="addFunction" size="small" v-hasPermi="['simhub:center:edit']">
              <el-icon><Plus /></el-icon> 添加职能
            </el-button>
          </div>

          <el-form-item>
            <el-button type="primary" @click="saveIntro" :loading="introSaving" v-hasPermi="['simhub:center:edit']">
              保存简介内容
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 3: 组织架构 -->
      <el-tab-pane label="组织架构" name="org">
        <div class="mb12 flex-row-end">
          <el-button type="primary" @click="openOrgDialog(null)" v-hasPermi="['simhub:center:edit']">
            <el-icon><Plus /></el-icon> 新增成员
          </el-button>
        </div>
        <el-table :data="orgList" v-loading="orgLoading" border stripe>
          <el-table-column type="index" width="55" label="#" />
          <el-table-column prop="name" label="姓名及职称" />
          <el-table-column prop="titleText" label="职务名称" />
          <el-table-column prop="dept" label="职责描述" />
          <el-table-column label="颜色" width="100">
            <template #default="{ row }">
              <span class="inline-block w-5 h-5 rounded" :style="{ backgroundColor: row.color || '#0B5394' }" />
              <span class="ml8 text-xs">{{ row.color }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="80" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openOrgDialog(row)" v-hasPermi="['simhub:center:edit']">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteOrg(row)" v-hasPermi="['simhub:center:edit']">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 组织架构成员对话框 -->
        <el-dialog v-model="orgDialogVisible" :title="orgDialogTitle" width="500px" append-to-body>
          <el-form ref="orgFormRef" :model="orgForm" :rules="orgRules" label-width="110px">
            <el-form-item label="姓名及职称" prop="name">
              <el-input v-model="orgForm.name" placeholder="如：王建华 教授" />
            </el-form-item>
            <el-form-item label="职务名称" prop="titleText">
              <el-input v-model="orgForm.titleText" placeholder="如：实验教学中心主任" />
            </el-form-item>
            <el-form-item label="职责描述" prop="dept">
              <el-input v-model="orgForm.dept" placeholder="如：统筹管理" />
            </el-form-item>
            <el-form-item label="显示颜色" prop="color">
              <el-color-picker v-model="orgForm.color" />
              <span class="ml8">{{ orgForm.color }}</span>
            </el-form-item>
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="orgForm.sortOrder" :min="0" :max="999" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="orgDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitOrgForm" :loading="orgSaving">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- Tab 4: 核心团队 -->
      <el-tab-pane label="核心团队" name="team">
        <div class="mb12 flex-row-end">
          <el-button type="primary" @click="openTeamDialog(null)" v-hasPermi="['simhub:center:edit']">
            <el-icon><Plus /></el-icon> 新增成员
          </el-button>
        </div>
        <el-table :data="teamList" v-loading="teamLoading" border stripe>
          <el-table-column type="index" width="55" label="#" />
          <el-table-column label="头像" width="70">
            <template #default="{ row }">
              <el-avatar :size="40" :src="row.imageUrl" v-if="row.imageUrl">{{ row.name?.charAt(0) }}</el-avatar>
              <el-avatar :size="40" v-else>{{ row.name?.charAt(0) }}</el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="titleRole" label="职位职称" />
          <el-table-column prop="specialty" label="研究专长" />
          <el-table-column prop="bio" label="简介" show-overflow-tooltip />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === '0' ? 'success' : 'info'" size="small">
                {{ row.status === '0' ? '正常' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="80" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openTeamDialog(row)" v-hasPermi="['simhub:center:edit']">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteTeam(row)" v-hasPermi="['simhub:center:edit']">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 团队成员对话框 -->
        <el-dialog v-model="teamDialogVisible" :title="teamDialogTitle" width="560px" append-to-body>
          <el-form ref="teamFormRef" :model="teamForm" :rules="teamRules" label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="teamForm.name" placeholder="如：王建华" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职位职称" prop="titleRole">
                  <el-input v-model="teamForm.titleRole" placeholder="如：中心主任 · 教授" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="研究专长" prop="specialty">
              <el-input v-model="teamForm.specialty" placeholder="如：解剖学 · 数字医学教育" />
            </el-form-item>
            <el-form-item label="头像URL" prop="imageUrl">
              <el-input v-model="teamForm.imageUrl" placeholder="https://..." />
            </el-form-item>
            <el-form-item label="个人简介" prop="bio">
              <el-input v-model="teamForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="teamForm.status">
                    <el-radio value="0">正常</el-radio>
                    <el-radio value="1">停用</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序" prop="sortOrder">
                  <el-input-number v-model="teamForm.sortOrder" :min="0" :max="999" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="teamDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitTeamForm" :loading="teamSaving">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup name="SimhubCenter">
import { Delete, Plus } from '@element-plus/icons-vue'
import {
  getCenterInfo, updateCenterInfo,
  listOrgMembers, addOrgMember, updateOrgMember, deleteOrgMember,
  listTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember,
} from '@/api/simhub/center'

const { proxy } = getCurrentInstance()

const activeTab = ref('basic')

// ===== 基本信息 =====
const basicLoading = ref(false)
const basicSaving = ref(false)
const basicForm = ref({})
const basicRules = {
  centerName: [{ required: true, message: '中心名称不能为空', trigger: 'blur' }],
}

// ===== 简介内容 =====
const introSaving = ref(false)
const introForm = ref({ description: '' })
const achievementsForm = ref([])
const functionsForm = ref([])

const iconOptions = [
  { label: 'Award（奖杯）', value: 'Award' },
  { label: 'Building2（建筑）', value: 'Building2' },
  { label: 'BookOpen（书本）', value: 'BookOpen' },
  { label: 'Star（星星）', value: 'Star' },
  { label: 'Users（用户）', value: 'Users' },
  { label: 'FlaskConical（烧瓶）', value: 'FlaskConical' },
]

function addAchievement() {
  achievementsForm.value.push({ label: '', yearDesc: '', iconName: 'Award', color: '#0B5394' })
}
function removeAchievement(idx) {
  achievementsForm.value.splice(idx, 1)
}
function addFunction() {
  functionsForm.value.push('')
}
function removeFunction(idx) {
  functionsForm.value.splice(idx, 1)
}

// ===== 组织架构 =====
const orgLoading = ref(false)
const orgSaving = ref(false)
const orgList = ref([])
const orgDialogVisible = ref(false)
const orgDialogTitle = ref('新增组织架构成员')
const orgEditId = ref(null)
const orgFormRef = ref(null)
const orgForm = ref({ name: '', titleText: '', dept: '', color: '#0B5394', sortOrder: 0 })
const orgRules = {
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
}

// ===== 核心团队 =====
const teamLoading = ref(false)
const teamSaving = ref(false)
const teamList = ref([])
const teamDialogVisible = ref(false)
const teamDialogTitle = ref('新增团队成员')
const teamEditId = ref(null)
const teamFormRef = ref(null)
const teamForm = ref({ name: '', titleRole: '', specialty: '', bio: '', imageUrl: '', sortOrder: 0, status: '0' })
const teamRules = {
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
}

// ===== 数据加载 =====
async function loadCenterInfo() {
  basicLoading.value = true
  try {
    const res = await getCenterInfo()
    const data = res.data || {}
    // 基本信息
    basicForm.value = {
      centerName: data.centerName,
      heroBadge: data.heroBadge,
      centerSlogan: data.centerSlogan,
      statFoundedYear: data.statFoundedYear,
      statExperiments: data.statExperiments,
      statStudents: data.statStudents,
      statCourses: data.statCourses,
      contactAddress: data.contactAddress,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
    }
    // 简介内容
    introForm.value = { description: data.description || '' }
    // 荣誉成就
    try {
      achievementsForm.value = data.achievementsJson ? JSON.parse(data.achievementsJson) : []
    } catch {
      achievementsForm.value = []
    }
    // 基本职能
    try {
      functionsForm.value = data.functionsJson ? JSON.parse(data.functionsJson) : []
    } catch {
      functionsForm.value = []
    }
  } finally {
    basicLoading.value = false
  }
}

async function loadOrgMembers() {
  orgLoading.value = true
  try {
    const res = await listOrgMembers()
    orgList.value = res.data || []
  } finally {
    orgLoading.value = false
  }
}

async function loadTeamMembers() {
  teamLoading.value = true
  try {
    const res = await listTeamMembers()
    teamList.value = res.data || []
  } finally {
    teamLoading.value = false
  }
}

// ===== 保存操作 =====
function saveBasic() {
  proxy.$refs.basicRef?.validate(valid => {
    if (!valid) return
    basicSaving.value = true
    updateCenterInfo(basicForm.value)
      .then(() => proxy.$modal.msgSuccess('基本信息保存成功'))
      .finally(() => (basicSaving.value = false))
  })
}

function saveIntro() {
  introSaving.value = true
  const payload = {
    description: introForm.value.description,
    achievementsJson: JSON.stringify(achievementsForm.value),
    functionsJson: JSON.stringify(functionsForm.value.filter(f => f.trim())),
  }
  updateCenterInfo(payload)
    .then(() => proxy.$modal.msgSuccess('简介内容保存成功'))
    .finally(() => (introSaving.value = false))
}

// ===== 组织架构 CRUD =====
function openOrgDialog(row) {
  orgFormRef.value?.resetFields()
  if (row) {
    orgEditId.value = row.id
    orgDialogTitle.value = '编辑组织架构成员'
    orgForm.value = { name: row.name, titleText: row.titleText, dept: row.dept, color: row.color || '#0B5394', sortOrder: row.sortOrder || 0 }
  } else {
    orgEditId.value = null
    orgDialogTitle.value = '新增组织架构成员'
    orgForm.value = { name: '', titleText: '', dept: '', color: '#0B5394', sortOrder: 0 }
  }
  orgDialogVisible.value = true
}

function submitOrgForm() {
  orgFormRef.value?.validate(valid => {
    if (!valid) return
    orgSaving.value = true
    const action = orgEditId.value
      ? updateOrgMember(orgEditId.value, orgForm.value)
      : addOrgMember(orgForm.value)
    action
      .then(() => {
        proxy.$modal.msgSuccess(orgEditId.value ? '修改成功' : '新增成功')
        orgDialogVisible.value = false
        loadOrgMembers()
      })
      .finally(() => (orgSaving.value = false))
  })
}

function handleDeleteOrg(row) {
  proxy.$modal.confirm(`确认删除成员「${row.name}」？`).then(() => {
    deleteOrgMember(row.id).then(() => {
      proxy.$modal.msgSuccess('删除成功')
      loadOrgMembers()
    })
  })
}

// ===== 核心团队 CRUD =====
function openTeamDialog(row) {
  teamFormRef.value?.resetFields()
  if (row) {
    teamEditId.value = row.id
    teamDialogTitle.value = '编辑团队成员'
    teamForm.value = { name: row.name, titleRole: row.titleRole, specialty: row.specialty, bio: row.bio, imageUrl: row.imageUrl, sortOrder: row.sortOrder || 0, status: row.status || '0' }
  } else {
    teamEditId.value = null
    teamDialogTitle.value = '新增团队成员'
    teamForm.value = { name: '', titleRole: '', specialty: '', bio: '', imageUrl: '', sortOrder: 0, status: '0' }
  }
  teamDialogVisible.value = true
}

function submitTeamForm() {
  teamFormRef.value?.validate(valid => {
    if (!valid) return
    teamSaving.value = true
    const action = teamEditId.value
      ? updateTeamMember(teamEditId.value, teamForm.value)
      : addTeamMember(teamForm.value)
    action
      .then(() => {
        proxy.$modal.msgSuccess(teamEditId.value ? '修改成功' : '新增成功')
        teamDialogVisible.value = false
        loadTeamMembers()
      })
      .finally(() => (teamSaving.value = false))
  })
}

function handleDeleteTeam(row) {
  proxy.$modal.confirm(`确认删除成员「${row.name}」？`).then(() => {
    deleteTeamMember(row.id).then(() => {
      proxy.$modal.msgSuccess('删除成功')
      loadTeamMembers()
    })
  })
}

// 初始化
loadCenterInfo()
loadOrgMembers()
loadTeamMembers()
</script>

<style scoped>
.flex-row-end {
  display: flex;
  justify-content: flex-end;
}
.mb8 { margin-bottom: 8px; }
.mb12 { margin-bottom: 12px; }
.ml8 { margin-left: 8px; }
.text-secondary { color: #909399; }
.achievement-row { padding: 8px; background: #fafafa; border-radius: 6px; border: 1px solid #ebeef5; }
</style>

