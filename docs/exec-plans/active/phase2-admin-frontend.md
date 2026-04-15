# Phase 2 执行计划 — 管理后台前端 SimHub 扩展

**状态**：✅ 主体完成，待闭环  
**目标**：在现有管理后台（`medpro-fastapi-frontend/`，Vue3 + Element Plus）中增加 SimHub 相关管理页面  
**路径**：`medpro-fastapi-frontend/src/`

---

## 任务清单

### API 层（`src/api/simhub/`）
- [x] `center.js` — getCenterInfo, updateCenterInfo
- [x] `news.js` — listNews, getNews, addNews, updateNews, delNews
- [x] `regulation.js` — listRegulation, getRegulation, addRegulation, updateRegulation, delRegulation
- [x] `experiment.js` — 实验分类树 CRUD + 实验 CRUD
- [x] `course.js` — 课程 CRUD + 章节 CRUD
- [x] `resource.js` — 资源分类树 CRUD + 资源 CRUD

### 页面层（`src/views/simhub/`）
- [x] `center/index.vue` — 单条富文本编辑（ImageUpload + Quill Editor）
- [x] `news/index.vue` — 列表 + 新增/编辑对话框（Editor + 图片上传 + 状态切换）
- [x] `regulation/index.vue` — 列表 + CRUD 对话框（Editor + 日期选择 + 附件URL）
- [x] `experiment/index.vue` — 左侧分类树 + 右侧实验列表（嵌套对话框）
- [x] `course/index.vue` — 课程列表 + 章节管理树形对话框
- [x] `resource/index.vue` — 左侧资源分类树 + 右侧资源列表

### 路由注册（需要手动添加到菜单配置）
- [x] **闭环验收**：在管理后台 `系统管理 > 菜单管理` 中注册 SimHub 菜单项
  - 一级菜单：SimHub 平台管理（图标 `Promotion`，路径 `/simhub`）
  - 子菜单：中心简介、新闻管理、规章制度、实验管理、课程管理、资源管理
- [x] **闭环验收**：为 `simhub_admin` 角色分配以上菜单权限
- [x] **闭环验收**：页面功能冒烟测试（增删改查至少走通一遍）

---

## 页面设计说明

| 页面 | 布局模式 | 关键组件 |
|------|----------|----------|
| 中心简介 | 单表单 | `<Editor>` 富文本，`<ImageUpload>` 封面图 |
| 新闻管理 | 列表 + 对话框 | `<Editor>` 正文，状态切换（启用/禁用） |
| 规章制度 | 列表 + 对话框 | `<Editor>` 正文，日期选择，附件URL |
| 实验管理 | 左树右表 | 分类树（el-tree），实验卡片列表 |
| 课程管理 | 列表 + 抽屉 | 课程表，章节树形管理抽屉 |
| 资源管理 | 左树右表 | 资源分类树，资源列表（含类型标签） |

---

## 参考 UI 设计

- `doc/MedproUI/teacher_*/` — 教师端操作流程参考
- 管理后台整体风格沿用现有 Element Plus 组件库

---

## 闭环验收标准

1. 登录管理后台，左侧菜单可见 "SimHub 平台管理" 组
2. 每个子页面可以正常打开，列表可加载（即使数据为空）
3. 新增弹窗可以打开，富文本编辑器正常工作
4. 保存操作调用后端 API 返回 200
5. 删除操作有二次确认，调用成功后列表刷新
