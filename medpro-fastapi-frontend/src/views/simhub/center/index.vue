<template>
  <div class="app-container">
    <el-card shadow="never" class="mb16">
      <template #header>
        <span class="card-header-title">中心简介管理</span>
      </template>
      <el-form ref="centerRef" :model="form" :rules="rules" label-width="120px" v-loading="loading">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="中心名称" prop="centerName">
              <el-input v-model="form.centerName" placeholder="请输入中心名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宣传语" prop="centerSlogan">
              <el-input v-model="form.centerSlogan" placeholder="请输入宣传语" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Logo图片" prop="logoUrl">
              <image-upload v-model="form.logoUrl" :limit="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Banner图片" prop="bannerUrl">
              <image-upload v-model="form.bannerUrl" :limit="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactInfo">
              <el-input v-model="form.contactInfo" type="textarea" :rows="3" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="详细介绍" prop="description">
              <editor v-model="form.description" :min-height="200" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="组织架构" prop="orgStructure">
              <editor v-model="form.orgStructure" :min-height="200" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="团队介绍" prop="teamIntro">
              <editor v-model="form.teamIntro" :min-height="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="saving" v-hasPermi="['simhub:center:edit']">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="SimhubCenter">
import { getCenterInfo, updateCenterInfo } from '@/api/simhub/center'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const saving = ref(false)
const form = ref({})

const rules = {
  centerName: [{ required: true, message: '中心名称不能为空', trigger: 'blur' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getCenterInfo()
    form.value = res.data || {}
  } finally {
    loading.value = false
  }
}

function submitForm() {
  proxy.$refs.centerRef.validate(valid => {
    if (!valid) return
    saving.value = true
    updateCenterInfo(form.value)
      .then(() => proxy.$modal.msgSuccess('保存成功'))
      .finally(() => (saving.value = false))
  })
}

fetchData()
</script>
