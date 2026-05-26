<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="班级名称" prop="className">
        <el-input v-model="queryParams.className" placeholder="请输入班级名称" clearable style="width:180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="班级编号" prop="classCode">
        <el-input v-model="queryParams.classCode" placeholder="请输入班级编号" clearable style="width:150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属院系" prop="deptId">
        <el-tree-select
          v-model="queryParams.deptId"
          :data="deptOptions"
          :props="{ value: 'id', label: 'label', children: 'children' }"
          value-key="id"
          placeholder="请选择所属院系"
          clearable
          check-strictly
          style="width:180px"
        />
      </el-form-item>
      <el-form-item label="学年学期" prop="termId">
        <el-select v-model="queryParams.termId" placeholder="请选择学年学期" clearable style="width:180px">
          <el-option v-for="item in termOptions" :key="item.termId" :label="item.termName" :value="item.termId" />
        </el-select>
      </el-form-item>
      <el-form-item label="年级" prop="grade">
        <el-input v-model="queryParams.grade" placeholder="年级" clearable style="width:100px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:100px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['simhub:classAdmin:add']">新增班级</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['simhub:classAdmin:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['simhub:classAdmin:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Setting" @click="handleTermConfig" v-hasPermi="['simhub:classAdmin:edit']">学期配置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 班级列表 -->
    <el-table v-loading="loading" :data="classList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="班级ID" prop="classId" width="80" align="center" />
      <el-table-column label="班级名称" prop="className" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="班级编号" prop="classCode" width="120" align="center" />
      <el-table-column label="所属院系" prop="deptName" :show-overflow-tooltip="true" width="140" />
      <el-table-column label="学年学期" prop="termName" :show-overflow-tooltip="true" width="160" />
      <el-table-column label="年级" prop="grade" width="80" align="center" />
      <el-table-column label="专业" prop="major" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="学生人数" prop="studentCount" width="100" align="center">
        <template #default="{ row }">
          <el-link type="primary" @click="handleStudentManage(row)">{{ row.studentCount || 0 }} 人</el-link>
        </template>
      </el-table-column>
      <el-table-column label="班主任" prop="headTeacher" width="100" align="center" />
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ row.status === '0' ? '正常' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="110" align="center">
        <template #default="{ row }"><span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span></template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" icon="User" @click="handleStudentManage(row)" v-hasPermi="['simhub:classAdmin:list']">学生</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['simhub:classAdmin:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['simhub:classAdmin:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑班级抽屉 -->
    <el-drawer
      :title="drawerTitle"
      v-model="drawerOpen"
      direction="rtl"
      size="600px"
      destroy-on-close
    >
      <el-form ref="classFormRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="班级名称" prop="className">
              <el-input v-model="form.className" placeholder="请输入班级名称，如：临床医学2023级1班" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="班级编号" prop="classCode">
              <el-input v-model="form.classCode" placeholder="请输入班级编号，如：2023-01" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所属院系" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择所属院系"
                check-strictly
                @change="handleDeptChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="学年学期" prop="termId">
              <el-select v-model="form.termId" placeholder="请选择学年学期" style="width:100%" @change="handleTermChange">
                <el-option v-for="item in termOptions" :key="item.termId" :label="item.termName" :value="item.termId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-input v-model="form.grade" placeholder="如：2023" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input v-model="form.major" placeholder="如：临床医学" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班主任" prop="headTeacher">
              <el-input v-model="form.headTeacher" placeholder="请输入班主任姓名" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="headTeacherPhone">
              <el-input v-model="form.headTeacherPhone" placeholder="班主任电话" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="0">正常</el-radio>
                <el-radio value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
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

    <!-- 学生管理对话框 -->
    <el-dialog
      v-model="studentDialogOpen"
      :title="`班级学生管理 - ${currentClass.className}`"
      width="1200px"
      append-to-body
      destroy-on-close
    >
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="handleAddStudent" size="small">添加学生</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="success" plain icon="Plus" @click="handleBatchAddStudent" size="small">批量添加</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="Delete" :disabled="studentMultiple" @click="handleDeleteStudent" size="small">删除</el-button>
        </el-col>
      </el-row>

      <el-table :data="studentList" @selection-change="handleStudentSelectionChange" max-height="450">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="学号" prop="studentNo" width="120" align="center" />
        <el-table-column label="姓名" prop="studentName" width="100" />
        <el-table-column label="职务" prop="position" width="120" />
        <el-table-column label="加入日期" prop="joinDate" width="110" align="center">
          <template #default="{ row }">{{ parseTime(row.joinDate, '{y}-{m}-{d}') }}</template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="success">在读</el-tag>
            <el-tag v-else-if="row.status === '1'" type="warning">休学</el-tag>
            <el-tag v-else-if="row.status === '2'" type="danger">退学</el-tag>
            <el-tag v-else-if="row.status === '3'" type="info">毕业</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="120" />
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" icon="Delete" @click="handleDeleteStudent(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="studentTotal > 0"
        :total="studentTotal"
        v-model:page="studentQueryParams.pageNum"
        v-model:limit="studentQueryParams.pageSize"
        @pagination="getStudentList"
      />
    </el-dialog>

    <!-- 学年学期配置对话框 -->
    <el-dialog v-model="termDialogOpen" title="学年学期配置" width="1000px" append-to-body destroy-on-close>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="handleAddTerm" size="small">新增学期</el-button>
        </el-col>
      </el-row>
      <el-table :data="termList" max-height="400">
        <el-table-column label="学年学期" prop="termName" :show-overflow-tooltip="true" min-width="140" />
        <el-table-column label="学期编码" prop="termCode" width="100" align="center" />
        <el-table-column label="学年" prop="schoolYear" width="100" align="center" />
        <el-table-column label="学期" prop="semester" width="80" align="center">
          <template #default="{ row }">{{ row.semester === '1' ? '第一学期' : '第二学期' }}</template>
        </el-table-column>
        <el-table-column label="开始日期" prop="startDate" width="110" align="center">
          <template #default="{ row }">{{ parseTime(row.startDate, '{y}-{m}-{d}') }}</template>
        </el-table-column>
        <el-table-column label="结束日期" prop="endDate" width="110" align="center">
          <template #default="{ row }">{{ parseTime(row.endDate, '{y}-{m}-{d}') }}</template>
        </el-table-column>
        <el-table-column label="当前学期" prop="isCurrent" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isCurrent === '1'" type="success">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ row.status === '0' ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleEditTerm(row)">修改</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDeleteTerm(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 学年学期编辑对话框 -->
    <el-dialog v-model="termFormOpen" :title="termFormTitle" width="600px" append-to-body destroy-on-close>
      <el-form ref="termFormRef" :model="termForm" :rules="termRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="学年学期" prop="termName">
              <el-input v-model="termForm.termName" placeholder="如：2025-2026学年第1学期" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学期编码" prop="termCode">
              <el-input v-model="termForm.termCode" placeholder="如：202501" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学年" prop="schoolYear">
              <el-input v-model="termForm.schoolYear" placeholder="如：2025-2026" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学期" prop="semester">
              <el-select v-model="termForm.semester" placeholder="请选择" style="width:100%">
                <el-option label="第一学期" value="1" />
                <el-option label="第二学期" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前学期" prop="isCurrent">
              <el-radio-group v-model="termForm.isCurrent">
                <el-radio value="0">否</el-radio>
                <el-radio value="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="termForm.startDate" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="termForm.endDate" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="termForm.status">
                <el-radio value="0">正常</el-radio>
                <el-radio value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="termForm.sortOrder" :min="0" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="termForm.remark" type="textarea" :rows="2" placeholder="请输入备注" maxlength="500" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div style="text-align:right">
          <el-button type="primary" @click="submitTermForm">确 定</el-button>
          <el-button @click="termFormOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SimhubClassAdmin">
import { listClassAdmin, getClassAdmin, addClassAdmin, updateClassAdmin, delClassAdmin } from '@/api/simhub/class_admin'
import { listClassStudent, addClassStudent, batchAddClassStudent, delClassStudent } from '@/api/simhub/class_admin'
import { listTermConfig, getTermConfig, addTermConfig, updateTermConfig, delTermConfig, getTermConfigOptions } from '@/api/simhub/class_admin'
import { deptTreeSelect as deptTreeselect } from '@/api/system/user'

const { proxy } = getCurrentInstance()

const classList = ref([])
const drawerOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const drawerTitle = ref('')
const deptOptions = ref([])
const termOptions = ref([])

// 学生管理
const studentDialogOpen = ref(false)
const studentList = ref([])
const studentIds = ref([])
const studentMultiple = ref(true)
const studentTotal = ref(0)
const currentClass = ref({})
const studentQueryParams = reactive({ pageNum: 1, pageSize: 10, classId: null, studentName: '', studentNo: '', status: '' })

// 学期配置
const termDialogOpen = ref(false)
const termList = ref([])
const termFormOpen = ref(false)
const termFormTitle = ref('')
const termForm = ref({})
const termRules = {
  termName: [{ required: true, message: '学年学期名称不能为空', trigger: 'blur' }],
  termCode: [{ required: true, message: '学期编码不能为空', trigger: 'blur' }]
}

const data = reactive({
  form: {},
  queryParams: { pageNum: 1, pageSize: 10, className: '', classCode: '', deptId: null, termId: null, grade: '', status: '' },
  rules: {
    className: [{ required: true, message: '班级名称不能为空', trigger: 'blur' }],
    classCode: [{ required: true, message: '班级编号不能为空', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)

/** 查询班级列表 */
function getList() {
  loading.value = true
  listClassAdmin(queryParams.value).then(response => {
    classList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 获取院系树 */
function getDeptTree() {
  deptTreeselect().then(response => {
    deptOptions.value = response.data
  })
}

/** 获取学年学期选项 */
function getTermOptions() {
  getTermConfigOptions().then(response => {
    termOptions.value = response.data || []
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.classId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  drawerOpen.value = true
  drawerTitle.value = '新增行政班级'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const classId = row.classId || ids.value[0]
  getClassAdmin(classId).then(response => {
    form.value = response.data
    drawerOpen.value = true
    drawerTitle.value = '修改行政班级'
  })
}

/** 院系选择改变 */
function handleDeptChange(value) {
  const findNode = (tree, id) => {
    for (const node of tree) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }
  const dept = findNode(deptOptions.value, value)
  if (dept) {
    form.value.deptName = dept.label
  }
}

/** 学期选择改变 */
function handleTermChange(value) {
  const term = termOptions.value.find(t => t.termId === value)
  if (term) {
    form.value.termName = term.termName
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['classFormRef'].validate(valid => {
    if (valid) {
      if (form.value.classId) {
        updateClassAdmin(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          drawerOpen.value = false
          getList()
        })
      } else {
        addClassAdmin(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          drawerOpen.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const classIds = row.classId ? [row.classId] : ids.value
  proxy.$modal.confirm('是否确认删除选中的行政班级？').then(() => {
    return delClassAdmin(classIds.join(','))
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 表单重置 */
function reset() {
  form.value = {
    classId: null,
    className: '',
    classCode: '',
    deptId: null,
    deptName: '',
    termId: null,
    termName: '',
    major: '',
    grade: '',
    headTeacher: '',
    headTeacherPhone: '',
    sortOrder: 0,
    status: '0',
    remark: ''
  }
  proxy.resetForm('classFormRef')
}

/** 学生管理按钮 */
function handleStudentManage(row) {
  currentClass.value = row
  studentQueryParams.classId = row.classId
  studentQueryParams.pageNum = 1
  getStudentList()
  studentDialogOpen.value = true
}

/** 获取班级学生列表 */
function getStudentList() {
  listClassStudent(studentQueryParams).then(response => {
    studentList.value = response.rows || []
    studentTotal.value = response.total || 0
  })
}

/** 学生多选框选中数据 */
function handleStudentSelectionChange(selection) {
  studentIds.value = selection.map(item => item.id)
  studentMultiple.value = !selection.length
}

/** 添加学生 */
function handleAddStudent() {
  proxy.$modal.msgInfo('此功能需要配合用户选择组件实现，请自行完善')
}

/** 批量添加学生 */
function handleBatchAddStudent() {
  proxy.$modal.msgInfo('此功能需要配合用户选择组件实现，请自行完善')
}

/** 删除学生 */
function handleDeleteStudent(row) {
  const delIds = row.id ? [row.id] : studentIds.value
  proxy.$modal.confirm('是否确认移除选中的学生？').then(() => {
    return delClassStudent(delIds.join(','))
  }).then(() => {
    getStudentList()
    getList() // 刷新班级列表以更新学生人数
    proxy.$modal.msgSuccess('移除成功')
  }).catch(() => {})
}

/** 学期配置按钮 */
function handleTermConfig() {
  getTermList()
  termDialogOpen.value = true
}

/** 获取学期列表 */
function getTermList() {
  listTermConfig({ pageNum: 1, pageSize: 100 }).then(response => {
    termList.value = response.rows || []
  })
}

/** 新增学期 */
function handleAddTerm() {
  termForm.value = {
    termName: '',
    termCode: '',
    schoolYear: '',
    semester: '1',
    startDate: '',
    endDate: '',
    isCurrent: '0',
    sortOrder: 0,
    status: '0',
    remark: ''
  }
  termFormOpen.value = true
  termFormTitle.value = '新增学年学期'
}

/** 修改学期 */
function handleEditTerm(row) {
  getTermConfig(row.termId).then(response => {
    termForm.value = response.data
    termFormOpen.value = true
    termFormTitle.value = '修改学年学期'
  })
}

/** 提交学期表单 */
function submitTermForm() {
  proxy.$refs['termFormRef'].validate(valid => {
    if (valid) {
      if (termForm.value.termId) {
        updateTermConfig(termForm.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          termFormOpen.value = false
          getTermList()
          getTermOptions()
        })
      } else {
        addTermConfig(termForm.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          termFormOpen.value = false
          getTermList()
          getTermOptions()
        })
      }
    }
  })
}

/** 删除学期 */
function handleDeleteTerm(row) {
  proxy.$modal.confirm('是否确认删除该学年学期？').then(() => {
    return delTermConfig(row.termId)
  }).then(() => {
    getTermList()
    getTermOptions()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

onMounted(() => {
  getList()
  getDeptTree()
  getTermOptions()
})
</script>

<style scoped>
.mr4 {
  margin-right: 4px;
}
</style>
