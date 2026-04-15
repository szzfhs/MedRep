# Phase 4 执行计划 — 教师端功能

**状态**：✅ 已完成（2026-04-04）  
**目标**：在门户前端（`medpro-fastapi-portal/`）和管理后端中实现教师角色的专属功能  
**前置条件**：Phase 1 后端已完成，Phase 3 门户基础设施已就绪

---

## 功能范围

教师端核心功能：
1. 教师工作台（Dashboard）
2. 我的课程管理（课程 + 章节 CRUD）
3. 学生选课情况查看
4. 实验参与数据统计
5. 教师个人资料维护

---

## 后端任务（`medpro-fastapi-backend/module_simhub/`）

### 新增 Controller
- [x] `controller/teacher_controller.py`
  - `GET /simhub/teacher/dashboard` — 工作台数据汇总（课程数/学生数/实验数）
  - `GET /simhub/teacher/courses` — 我创建的课程列表（分页 + 筛选）
  - `POST /simhub/teacher/course` — 新建课程
  - `PUT /simhub/teacher/course/{id}` — 编辑课程
  - `DELETE /simhub/teacher/course/{id}` — 删除课程（软删除）
  - `GET /simhub/teacher/course/{id}/sections` — 获取课程章节树
  - `POST /simhub/teacher/section` — 新建章节
  - `PUT /simhub/teacher/section/{id}` — 编辑章节
  - `DELETE /simhub/teacher/section/{id}` — 删除章节
  - `GET /simhub/teacher/course/{id}/students` — 选课学生列表
  - `GET /simhub/teacher/stats` — 教师教学统计（参与量/完成率等）

### 权限控制
- [x] 所有路由添加 `UserInterfaceAuthDependency('simhub:teacher:*')`
- [x] 教师资源所有权检查（只能操作 teacher_id = 自身 user_id 的课程）

---

## 前端任务（`medpro-fastapi-portal/src/`）

### 新增 API（`src/api/teacher.js`）
- [x] `getTeacherDashboard()` — GET /simhub/teacher/dashboard
- [x] `getTeacherCourses(params)` — GET /simhub/teacher/courses
- [x] `createTeacherCourse(data)` — POST /simhub/teacher/course
- [x] `updateTeacherCourse(id, data)` — PUT /simhub/teacher/course/{id}
- [x] `deleteTeacherCourse(id)` — DELETE /simhub/teacher/course/{id}
- [x] `getCourseStudents(courseId, params)` — GET /simhub/teacher/course/{id}/students
- [x] `createSection(data)` — POST /simhub/teacher/section
- [x] `updateSection(id, data)` — PUT /simhub/teacher/section/{id}
- [x] `deleteSection(id)` — DELETE /simhub/teacher/section/{id}

### 新增路由（更新 `src/router/index.js`）
- [x] `/teacher` — 教师工作台（requiresAuth + requiresRole: 'teacher'）
- [x] `/teacher/courses` — 我的课程管理
- [x] `/teacher/course/:id/sections` — 章节管理
- [x] `/teacher/course/:id/students` — 学生列表

### 新增页面（`src/views/teacher/`）
- [x] `TeacherDashboard.vue` — 工作台（统计卡片 + 快捷操作 + 最近课程）
- [x] `MyCourseList.vue` — 课程列表（搜索/分页/CRUD操作列）
- [x] `CourseFormDialog.vue` — 课程表单弹窗（新建/编辑复用）
- [x] `SectionManager.vue` — 章节树管理（递归展示 + 增删改）
- [x] `CourseStudents.vue` — 学生列表（搜索 + CSV 导出）

### auth store 更新（`src/stores/auth.js`）
- [x] 存储 `roles` 到 localStorage，新增 `isTeacher` computed 属性

### 教师入口（更新 `src/components/NavBar.vue`）
- [x] 登录且角色为 teacher，顶部导航显示"教师工作台"高亮入口

---

## 参考 UI 设计

| 页面 | 参考文件 |
|------|----------|
| 教师工作台 | `doc/MedproUI/teacher_2/` |
| 课程管理列表 | `doc/MedproUI/teacher_3/`, `teacher_4/` |
| 章节管理 | `doc/MedproUI/teacher_5/`, `teacher_6/` |
| 学生管理 | `doc/MedproUI/teacher_7/`, `teacher_8/` |
| 数据统计 | `doc/MedproUI/teacher_9/`, `teacher_10/` |
| 教师个人资料 | `doc/MedproUI/teacher_11/`, `teacher_12/` |
| 课程表单 | `doc/MedproUI/teacher_13/` |

---

## 闭环验收标准

- [x] 教师账号登录后，NavBar 显示"教师工作台"入口
- [x] Dashboard 正常加载统计数据
- [x] 可完整执行：新建课程 → 添加章节 → 发布 → 学生在门户可见
- [x] 查看选课学生列表，数据与后端一致
- [x] 非教师角色访问 `/teacher/*` 自动重定向至首页
- [x] 所有教师端 API 返回 200，无权限异常
- [x] 前端构建无错误（npm run build ✅）
- [x] 后端 ruff lint 检查通过（All checks passed ✅）

---

## 开发顺序建议

1. 先完成后端 `teacher_controller.py` 并测试接口
2. 创建 `src/api/teacher.js`
3. 实现 `TeacherDashboard.vue`（最简单，先走通认证+路由）
4. 实现 `MyCourseList.vue` + `CourseForm.vue`
5. 实现 `SectionManager.vue`
6. 实现 `CourseStudents.vue`
7. 更新 NavBar，联调闭环
