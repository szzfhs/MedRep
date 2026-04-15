<template>
  <div class="app-container">
    <el-card shadow="never" class="mb16">
      <template #header>
        <span class="card-header-title">个人档案</span>
      </template>

      <!-- 学生档案 -->
      <el-form
        v-if="profileType === 'student'"
        ref="profileRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="loading"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input :value="form.nickName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input :value="form.phonenumber" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="form.studentNo" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-input v-model="form.grade" placeholder="请输入年级" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input v-model="form.major" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="className">
              <el-input v-model="form.className" placeholder="请输入班级" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学院" prop="college">
              <el-input v-model="form.college" placeholder="请输入学院" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入学年份" prop="enrollYear">
              <el-input-number v-model="form.enrollYear" :min="1990" :max="2100" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="saving" v-hasPermi="['simhub:profile:edit']">
            保存
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 教师档案 -->
      <el-form
        v-else-if="profileType === 'teacher'"
        ref="profileRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="loading"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input :value="form.nickName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input :value="form.phonenumber" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="teacherNo">
              <el-input v-model="form.teacherNo" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称" prop="title">
              <el-input v-model="form.title" placeholder="请输入职称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学院" prop="college">
              <el-input v-model="form.college" placeholder="请输入学院" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系部/教研室" prop="department">
              <el-input v-model="form.department" placeholder="请输入系部或教研室" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头像URL" prop="avatarUrl">
              <el-input v-model="form.avatarUrl" placeholder="请输入头像图片URL" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="个人简介" prop="introduction">
              <el-input v-model="form.introduction" type="textarea" :rows="4" placeholder="请输入个人简介" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="saving" v-hasPermi="['simhub:profile:edit']">
            保存
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 无档案提示 -->
      <el-empty v-else description="当前角色无个人档案，请联系管理员" />
    </el-card>
  </div>
</template>

<script setup name="SimhubProfile">
import { getStudentProfile, saveStudentProfile, getTeacherProfile, saveTeacherProfile } from '@/api/simhub/profile'
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()

const loading = ref(false)
const saving = ref(false)
const form = ref({})

// 根据角色判断档案类型
const profileType = computed(() => {
  const roles = userStore.roles || []
  if (roles.includes('student')) return 'student'
  if (roles.includes('teacher')) return 'teacher'
  // 默认按教师处理（simhub_admin 也可查看教师档案）
  return 'teacher'
})

const rules = {}

async function fetchData() {
  loading.value = true
  try {
    const fn = profileType.value === 'student' ? getStudentProfile : getTeacherProfile
    const res = await fn()
    form.value = res.data || {}
  } finally {
    loading.value = false
  }
}

function submitForm() {
  proxy.$refs.profileRef.validate(valid => {
    if (!valid) return
    saving.value = true
    const fn = profileType.value === 'student' ? saveStudentProfile : saveTeacherProfile
    fn(form.value)
      .then(() => proxy.$modal.msgSuccess('保存成功'))
      .finally(() => (saving.value = false))
  })
}

fetchData()
</script>
