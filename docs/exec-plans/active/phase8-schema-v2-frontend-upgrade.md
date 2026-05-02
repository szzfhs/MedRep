# Phase 8 执行计划 — 数据库 Schema v2 管理后台前端升级

**状态**：🚧 待执行（依赖 Phase 7 完成）  
**优先级**：P1  
**目标**：升级管理后台（`medpro-fastapi-frontend/`）的 SimHub 相关页面，适配 Schema v2 新增字段，并新增"实验系统管理"和"习题管理"两个功能模块  
**预估工作量**：4~5 天

---

## 背景

Phase 2 已完成管理后台 SimHub 基础模块（中心简介/新闻/规章/实验/课程/资源），共 6 个管理页面。  
本阶段在此基础上：
1. **更新现有6个页面**：适配新字段、枚举值变更
2. **新增2个管理页面**：实验系统管理、习题管理
3. **更新章节管理抽屉**：在课程章节内支持绑定习题

---

## 子任务清单

### 任务 8-1：API 层更新（`src/api/simhub/`）

- [ ] **8-1-1** 新建 `sim_system.js`：
  ```js
  // 实验系统管理 API
  export function listSimSystem(query)           // GET /simhub/sim-system/list
  export function getSimSystem(id)               // GET /simhub/sim-system/{id}
  export function addSimSystem(data)             // POST /simhub/sim-system
  export function updateSimSystem(data)          // PUT /simhub/sim-system
  export function delSimSystem(ids)              // DELETE /simhub/sim-system/{ids}
  export function getSimSystemImages(id)         // GET /simhub/sim-system/{id}/images
  export function saveSimSystemImages(id, data)  // POST /simhub/sim-system/{id}/images
  ```
- [ ] **8-1-2** 新建 `question.js`：
  ```js
  // 习题管理 API
  export function listQuestion(query)            // GET /simhub/question/list
  export function getQuestion(id)               // GET /simhub/question/{id}
  export function addQuestion(data)             // POST /simhub/question
  export function updateQuestion(data)          // PUT /simhub/question
  export function delQuestion(ids)              // DELETE /simhub/question/{ids}
  export function getSectionQuestions(sectionId)// GET /simhub/question/section/{sectionId}
  export function bindSectionQuestions(data)    // POST /simhub/question/section/bind
  export function unbindSectionQuestion(sectionId, questionId) // DELETE /simhub/question/section/{sectionId}/{questionId}
  ```
- [ ] **8-1-3** 更新 `experiment.js`：
  - 在查询参数和请求体中追加 `sim_system_id`、`exp_duration`、`exp_guide` 字段（透传，接口层无需额外改动）
  - 新增 `listSimSystemOptions()` — 获取实验系统下拉选项（调用 `/simhub/portal/sim-system/list`）
- [ ] **8-1-4** 更新 `course.js`：
  - 在请求体中追加 `course_category` 字段
  - 新增 `getSectionQuestions(sectionId)` 别名方法（或直接引用 `question.js`）
- [ ] **8-1-5** 更新 `resource.js`：
  - 在请求体中追加 `resource_content`、`file_format` 字段
  - `resource_type` 参数值更新为新枚举（courseware/lesson_plan/micro_video/ebook/extension）

**验收标准**：所有 API 函数调用控制台无 404/500 错误；开发工具 Network 面板中请求参数包含新字段。

---

### 任务 8-2：新增"实验系统管理"页面

> **路径**：`medpro-fastapi-frontend/src/views/simhub/sim-system/index.vue`

**页面布局**：列表 + 抽屉（Drawer）模式（因含图集，使用抽屉比对话框更宽敞）

- [ ] **8-2-1** 列表区域：
  - 搜索栏：系统名称（keyword）、系统分类（sys_category，下拉）、状态（status）
  - 表格列：系统名称、系统分类、支持硬件（hw_support，标签展示）、查看次数、状态、操作
  - 操作按钮：新增、修改、删除（批量）
  - 分页组件（`<Pagination>`）
- [ ] **8-2-2** 编辑抽屉（`el-drawer`，宽度 700px）：
  - 基本信息区：系统名称（必填）、系统分类（下拉）、状态
  - 封面图：`<ImageUpload>`
  - 推荐硬件配置：`el-input`（文本）
  - 支持硬件设备：`el-checkbox-group`（头盔/PC电脑/zSpace，值存逗号分隔字符串）
  - 系统详情：`<Editor>`（富文本）
  - 图集管理子区域：
    - 现有图集列表（缩略图 + 删除按钮）
    - 新增图片：`<ImageUpload>` 多图模式（或逐张添加）
    - 支持拖拽排序（`vuedraggable`）
- [ ] **8-2-3** 新增/修改逻辑：
  - 保存时分两步：先保存系统主体，再调用 `saveSimSystemImages` 保存图集
  - 编辑时加载：`getSimSystem(id)` 返回主体 + 图集
- [ ] **8-2-4** 删除逻辑：表格多选 → 批量软删除，二次确认弹窗
- [ ] **8-2-5** 状态切换：行内 `el-switch` 快速切换 status（调用修改接口）

**验收标准**：可完整走通新增（含上传封面图和图集）→ 列表展示 → 修改 → 删除流程。

---

### 任务 8-3：更新"实验管理"页面

> **文件**：`medpro-fastapi-frontend/src/views/simhub/experiment/index.vue`

- [ ] **8-3-1** 实验表单新增字段：
  - **关联实验系统**：`el-select`，选项来自 `listSimSystemOptions()`（系统名称下拉），清空可选
  - **实验时长**：`el-input-number`（单位：分钟，最小0，步长5）
  - **实验指导书**：`<Editor>`（Quill 富文本，高度 400px），支持图文混排
- [ ] **8-3-2** 表格列更新：
  - 新增"关联系统"列（显示 system_name，需 select 映射或后端直接返回名称）
  - 新增"实验时长"列（数值 + "分钟"单位）
- [ ] **8-3-3** 搜索栏新增：按关联系统筛选（`sim_system_id` 下拉）
- [ ] **8-3-4** 状态枚举更新：调整为 0=正常 / 1=停用（统一风格，去掉"发布/下线"歧义描述）

**验收标准**：实验编辑对话框/抽屉中可见三个新字段；保存后列表刷新，"关联系统"列正常显示。

---

### 任务 8-4：更新"课程管理"页面

> **文件**：`medpro-fastapi-frontend/src/views/simhub/course/index.vue`

- [ ] **8-4-1** 课程表单新增字段：
  - **课程分类**：`el-radio-group` 或 `el-select`，使用字典 `vf_course_category`（理论课/实验课/理实一体化课）
- [ ] **8-4-2** 课程状态显示更新：
  - 原状态枚举 0=发布/1=草稿 → 新枚举 0=新建/1=已审核/2=已发布
  - 表格状态列使用 `<DictTag dictType="vf_course_status">`
  - 搜索栏状态下拉选项同步更新
- [ ] **8-4-3** 表格列新增：
  - "课程分类"列（使用 `<DictTag dictType="vf_course_category">`）
- [ ] **8-4-4** 章节管理抽屉扩展（章节习题绑定，参见任务 8-6）

**验收标准**：新建课程时可选择课程分类；课程列表中状态标签显示为"新建/已审核/已发布"；DictTag 组件正确映射。

---

### 任务 8-5：更新"资源管理"页面

> **文件**：`medpro-fastapi-frontend/src/views/simhub/resource/index.vue`

- [ ] **8-5-1** 资源表单新增字段：
  - **文件格式类型**：`el-input` 或 `el-select`（pdf/mp4/docx/pptx/epub/其他）
  - **资源内容描述**：`el-input`（type="textarea"，rows=4，用于摘要/简介描述）
- [ ] **8-5-2** 资源类型枚举更新：
  - 原枚举 pdf/video/audio/image/doc → 新枚举 courseware/lesson_plan/micro_video/ebook/extension
  - 使用字典 `vf_resource_type` 驱动（`<DictTag>` + `el-select` 选项）
  - **⚠️ 注意**：此处涉及枚举值迁移，需与后端数据迁移脚本（Phase 7 任务7-1-3）同步执行
- [ ] **8-5-3** 表格列更新：
  - 资源类型列改用 `<DictTag dictType="vf_resource_type">`
  - 新增"文件格式"列
- [ ] **8-5-4** 搜索栏更新：资源类型下拉选项同步为新枚举值

**验收标准**：新增资源时可填写文件格式和内容描述；资源类型下拉显示中文标签（课件/教案/微课视频/电子书/拓展资源）。

---

### 任务 8-6：章节管理抽屉新增"习题绑定"功能

> **文件**：`medpro-fastapi-frontend/src/views/simhub/course/index.vue`（章节管理区域）

章节管理抽屉（或子对话框）中，在每个章节节点旁新增"习题"操作入口。

- [ ] **8-6-1** 章节节点操作扩展：
  - 在章节树每行新增"习题"按钮（`el-button` type=text，图标 `QuestionFilled`）
  - 点击后打开"章节习题管理"子对话框
- [ ] **8-6-2** 章节习题管理子对话框（`el-dialog`，width=800px）：
  - 标题：`[章节名称] — 习题管理`
  - 左侧：已绑定习题列表（题型标签 + 习题名称 + 解绑按钮）
  - 右侧：习题选择区
    - 搜索栏（keyword、question_type 筛选）
    - 习题列表（分页，每行显示习题名称、类型、难度、操作"绑定"按钮）
- [ ] **8-6-3** 绑定逻辑：
  - 点击"绑定"：调用 `bindSectionQuestions({ section_id, course_id, question_ids: [id] })`
  - 点击"解绑"：调用 `unbindSectionQuestion(sectionId, questionId)`
  - 操作成功后刷新已绑定列表
- [ ] **8-6-4** 已绑定习题列表展示优化：
  - 按 sort_order 排序，支持拖拽调整顺序（可选，`vuedraggable`）

**验收标准**：在课程章节管理中，点击"习题"按钮可打开子对话框；可从习题库中选择并绑定到章节；已绑定习题可解绑。

---

### 任务 8-7：新增"习题管理"页面

> **路径**：`medpro-fastapi-frontend/src/views/simhub/question/index.vue`

**页面布局**：列表 + 对话框（Dialog）模式

- [ ] **8-7-1** 列表区域：
  - 搜索栏：习题名称（keyword）、习题类型（question_type，使用字典 `vf_question_type`）、难度（difficulty）、状态（status）
  - 表格列：习题名称、习题类型（`<DictTag>`）、难度（1=易/2=中/3=难，标签展示）、状态、创建人、创建时间、操作
  - 操作按钮：新增、修改、删除（批量）、预览
  - 分页组件（`<Pagination>`）
- [ ] **8-7-2** 编辑对话框（`el-dialog`，width=760px）：
  - **基本信息**：习题名称、习题类型（`el-select`，使用字典）、难度（`el-select`）、状态
  - **题干内容**：`<Editor>`（富文本，支持图片）
  - **选项配置**（条件渲染，仅单选/多选题显示）：
    - 动态选项列表：A/B/C/D...，每项可填写内容（`el-input`）
    - 支持"添加选项"/"删除选项"操作（最少2项，最多8项）
    - 数据结构：`[{"key":"A","content":"..."},...]`，保存为 JSON 字符串
  - **正确答案**：
    - 单选题：`el-radio-group`（选项key）
    - 多选题：`el-checkbox-group`（多个选项key，逗号分隔存储）
    - 填空题/问答题：`el-input`（文本）
  - **答案释义**：`<Editor>` 或 `el-textarea`
- [ ] **8-7-3** 习题预览对话框：
  - 只读模式展示题干、选项（如有）、答案
  - 题干富文本使用 `v-html` 渲染
- [ ] **8-7-4** 删除逻辑：勾选多行 → 批量软删除，二次确认弹窗

**验收标准**：可完整走通新增（各种题型分别测试一次）→ 列表展示 → 修改 → 预览 → 删除流程；题型切换时选项区域和答案区域正确显示/隐藏。

---

### 任务 8-8：路由与菜单注册

- [ ] **8-8-1** 在系统菜单管理中（或数据库中通过 Phase 7 任务 7-7 的 SQL）注册以下菜单：
  - **实验系统管理**：父菜单 SimHub，路由 `/simhub/sim-system`，组件 `simhub/sim-system/index`，权限字符串 `simhub:simSystem:list`
  - **习题管理**：父菜单 SimHub，路由 `/simhub/question`，组件 `simhub/question/index`，权限字符串 `simhub:question:list`
- [ ] **8-8-2** 在前端 `src/router/` 中补充静态路由（若项目使用静态路由定义）：
  - 确认 `simhub/sim-system/index.vue` 和 `simhub/question/index.vue` 组件路径匹配
- [ ] **8-8-3** 左侧菜单图标选择：
  - 实验系统管理：`Monitor` 或 `Cpu`（Element Plus 图标）
  - 习题管理：`EditPen` 或 `List`

**验收标准**：登录管理后台，左侧 SimHub 菜单组下可见"实验系统管理"和"习题管理"两个新菜单项，点击可正常跳转。

---

### 任务 8-9：字典与数据配置

- [ ] **8-9-1** 在管理后台字典管理中确认以下字典类型已存在（由 Phase 7 任务 7-7 的 SQL 初始化，此处做验收）：
  - `vf_course_category`：1=理论课 / 2=实验课 / 3=理实一体化课
  - `vf_course_status`：0=新建 / 1=已审核 / 2=已发布
  - `vf_resource_type`：courseware=课件 / lesson_plan=教案 / micro_video=微课视频 / ebook=电子书 / extension=拓展资源
  - `vf_question_type`：single=单选题 / multiple=多选题 / fill=填空题 / essay=问答题
  - `vf_hw_support`：helmet=头盔 / pc=PC电脑 / zspace=zSpace
- [ ] **8-9-2** 在前端代码中使用 `DictTag` 组件渲染上述字典类型标签，避免硬编码枚举值

**验收标准**：各页面中使用字典渲染的标签（如课程分类、资源类型、习题类型）显示为中文名称而非枚举 key。

---

## 页面设计汇总

| 任务 | 页面 | 布局模式 | 关键组件 | 状态 |
|---|---|---|---|---|
| 8-2 | 实验系统管理 | 列表 + 抽屉 | ImageUpload/Editor/Draggable/图集管理 | 🆕 新增 |
| 8-3 | 实验管理 | 左树右表 + 对话框 | 新增SimSystem选择/InputNumber/Editor | ✏️ 更新 |
| 8-4 | 课程管理 | 列表 + 对话框/抽屉 | RadioGroup/DictTag | ✏️ 更新 |
| 8-5 | 资源管理 | 左树右表 + 对话框 | 新增字段/DictTag枚举更新 | ✏️ 更新 |
| 8-6 | 章节习题绑定 | 章节抽屉内子对话框 | 习题列表/绑定操作 | 🆕 新增功能 |
| 8-7 | 习题管理 | 列表 + 对话框 | Editor/动态选项/条件渲染 | 🆕 新增 |

---

## 执行顺序

```
8-1（API层）→ 8-9（字典确认）→ 8-8（路由注册）
→ 8-2（实验系统页）
→ 8-3（实验管理更新，依赖8-2的系统选项）
→ 8-4（课程管理更新）
→ 8-5（资源管理更新）
→ 8-7（习题管理页）
→ 8-6（章节习题绑定，依赖8-7）
```

## 风险与注意事项

| 风险点 | 影响 | 缓解措施 |
|---|---|---|
| `vf_course.status` 枚举值与旧代码逻辑冲突 | 状态标签错误显示 | 全量替换为字典渲染，消除硬编码 |
| `resource_type` 枚举变更 | 已有数据列表显示异常 | 需与 Phase 7 数据迁移同步，前端验证迁移后数据 |
| 实验系统图集管理 UX 复杂性 | 开发工时超出预估 | 先实现单张封面图，图集功能可作为 P2 延后 |
| 习题题型切换时的表单联动 | 代码逻辑复杂，容易出现状态残留 | 使用 `watch(questionType, reset)` 清空相关字段 |
| 章节习题绑定入口在树形结构内 | UI 空间受限，难以布局 | 考虑将习题操作放在右键菜单或操作列 icon-button |

## 闭环验收标准

- [ ] 管理后台可正常访问 SimHub 菜单下全部 8 个子页面
- [ ] 实验系统管理：可创建含图集的实验系统记录，图集缩略图正常展示
- [ ] 实验管理：编辑实验时可选择关联系统、填写时长和指导书
- [ ] 课程管理：可选择课程分类，状态显示"新建/已审核/已发布"
- [ ] 资源管理：资源类型标签显示中文（课件/教案/微课视频/电子书/拓展资源）
- [ ] 习题管理：可分别创建4种题型，选项动态增减，答案表单联动正确
- [ ] 章节管理：可在章节内绑定/解绑习题，已绑定习题列表正常展示
- [ ] 所有页面在 Chrome DevTools Network 中无 JS 报错和接口 4xx/5xx 错误
