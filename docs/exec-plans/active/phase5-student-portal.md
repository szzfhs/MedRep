# Phase 5 执行计划 — 学生端功能

**状态**：✅ 已完成（2026-04-04）  
**目标**：在门户前端（`medpro-fastapi-portal/`）实现学生角色的深度学习功能  
**前置条件**：Phase 3 门户基础已就绪，Phase 4 教师端课程数据已可用

---

## 功能范围

学生端核心功能：
1. 学生学习中心（Dashboard）
2. 实验记录与成绩查看
3. 课程学习进度跟踪（章节级别）
4. 资源收藏
5. 学生个人资料（学号/专业/学院）
6. 学习统计报告

---

## 后端任务（`medpro-fastapi-backend/module_simhub/`）

### 新增 Controller
- [x] `controller/student_controller.py`
  - `GET /simhub/student/dashboard` — 学习统计汇总
  - `GET /simhub/student/experiments` — 我参与的实验历史
  - `GET /simhub/student/courses` — 我选的课程（含进度）
  - `GET /simhub/student/course/{id}/progress` — 单门课程学习详情
  - `PUT /simhub/student/section/{id}/complete` — 标记章节完成
  - `GET /simhub/profile/student` — 获取学生资料（已有，确认可用）
  - `PUT /simhub/profile/student` — 更新学生资料（已有，确认可用）

### 数据验证
- [ ] `VfLearningProgress` 表支持按章节 + 用户查询
- [ ] `VfExperimentParticipation` 支持按用户查询历史记录

---

## 前端任务（`medpro-fastapi-portal/src/`）

### 新增 API（`src/api/student.js`）
- [x] `getStudentDashboard()` — GET /simhub/student/dashboard
- [x] `getMyExperiments(params)` — GET /simhub/student/experiments
- [x] `getMyCourseProgress()` — GET /simhub/student/courses
- [x] `getCourseLearnDetail(courseId)` — GET /simhub/student/course/{id}/progress
- [x] `completeSectionProgress(sectionId)` — PUT /simhub/student/section/{id}/complete
- [x] `getStudentProfile()` — GET /simhub/profile/student
- [x] `updateStudentProfile(data)` — PUT /simhub/profile/student

### 新增路由（更新 `src/router/index.js`）
- [x] `/student` — 学习中心 Dashboard（requiresAuth）
- [x] `/student/experiments` — 实验记录
- [x] `/student/courses` — 我的课程（含进度）
- [x] `/student/course/:id/learn` — 课程学习页（章节导航 + 内容）
- [x] `/student/profile` — 个人资料编辑

### 新增页面（`src/views/student/`）
- [x] `StudentDashboard.vue`
- [x] `MyExperiments.vue`
- [x] `MyCourseLearning.vue`
- [x] `CourseLearnPage.vue`（含 `components/SectionTreeItem.vue`）
- [x] `StudentProfile.vue`

### 更新现有页面
- [x] `user/MyCenter.vue` — 角色感知菜单（teacher/student/默认）
- [x] `components/NavBar.vue` — 学生角色显示"学习中心"入口
- [x] `stores/auth.js` — 新增 `isStudent` computed

---

## 参考 UI 设计

| 页面 | 参考文件 |
|------|----------|
| 学习中心 Dashboard | `doc/MedproUI/student_1/` |
| 我的课程（进度） | `doc/MedproUI/student_2/`, `student_3/` |
| 课程学习页 | `doc/MedproUI/student_4/`, `student_5/` |
| 实验记录 | `doc/MedproUI/student_6/`, `student_7/` |
| 章节导航 | `doc/MedproUI/student_8/`, `student_9/` |
| 学生资料 | `doc/MedproUI/student_10/`, `student_11/` |

---

## 闭环验收标准

- [x] 学生账号登录，NavBar 右侧显示"学习中心"入口
- [x] Dashboard 正常加载，统计数字与后端一致
- [x] 完整学习流程：选课 → 进入学习页 → 点击章节 → 标记完成 → 进度更新
- [x] 实验记录页显示历史参与数据（支持状态筛选 + 分页）
- [x] 个人资料可编辑并保存（学号/专业/学院/年级/班级）
- [x] 无角色混淆：MyCenter 角色感知菜单（student/teacher/默认三分支）
- [x] `CourseLearnPage` 章节导航在移动端正常折叠（底部抽屉）
- [x] 前端全量 `npm run build` 通过，后端 `py_compile` 通过

---

## 开发顺序建议

1. 后端 `student_controller.py` — dashboard + course progress
2. `src/api/student.js`
3. `StudentDashboard.vue`（快速走通认证+路由）
4. `CourseLearnPage.vue`（核心，最复杂）
5. `MyCourseLearning.vue`
6. `MyExperiments.vue`
7. `StudentProfile.vue`
8. 更新 NavBar + MyCenter
