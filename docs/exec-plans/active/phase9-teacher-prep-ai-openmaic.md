# Phase 9 执行计划 — 教师备课管理、AI 智能体集成 & OpenMAIC 场景生成管道移植

**状态**：🔄 执行中（Sprint 3）  
**优先级**：P0（新核心功能）  
**目标**：
1. 补全课程章节–教学资源多对多关系设计，完善 Schema
2. 在教师工作台实现完整的"备课管理"五步向导（含 AI 辅助）
3. 颗粒化集成 OpenMAIC AI 能力至 MedPro 系统
4. 将 AI 生成内容持久化为可复用的教学资源（`vf_resource` 记录）
5. 移植 OpenMAIC 场景大纲生成管道至 MedPro 后端（Python）+ 门户前端（Vite）

> **决策记录**：`medpro-fastapi-portal-next` Next.js 迁移项目已删除，不再进行技术栈迁移。  
> 所有功能在现有 **Vite+React18** 门户 + **FastAPI** 后端基础上继续迭代。

**前置条件**：Phase 7（Schema v2 后端升级）已完成或同步执行  
**预估总工作量**：3~5 周

---

## 背景

### 问题一：资源与章节关系尚未完整暴露

后端数据库已存在三张多对多关联表：

| 关联表 | 说明 |
|---|---|
| `vf_section_resource` | 章节 ↔ 教学资源（课件/视频/电子书等）|
| `vf_section_experiment` | 章节 ↔ 虚拟实验 |
| `vf_section_question` | 章节 ↔ 习题 |

但当前门户前端 `CourseSection` 接口和教师端均未暴露这些关联数据，仅用 `has_resource/has_experiment/has_test` 三个布尔标志位代替，导致：
- 无法在前端展示某章节绑定了哪些具体资源
- 无法从教师端进行资源绑定操作
- 备课管理功能无法落地

### 问题二：VfCourseSection 缺失两个资源标志

`vf_course_section` 表当前缺少：
- `has_micro_video CHAR(1)` — 是否有微课视频
- `has_extension CHAR(1)` — 是否有拓展资源

这两列补充后，前端可快速判断章节资源完整性，无需每次 JOIN 关联表。

### 问题三：VfCourse 缺失两个核心字段

| 缺失字段 | 类型 | 说明 |
|---|---|---|
| `learning_outcomes` | TEXT | 学习收获（多条，支持 JSON 数组或换行文本）|
| `certificate_info` | VARCHAR(500) | 课程证书信息 |

### 问题四：备课管理与 AI 能力缺失

教师工作台（`TeacherWorkbench.tsx`）目前：
- 全部使用 Mock 数据，未对接真实 API
- 缺少"备课管理"Tab
- 缺少 AI 辅助生成能力

### 问题五：AI 生成内容无法持久化为资源

教师在步骤4 AI 编辑器中生成的内容（教案 MD / 幻灯片 HTML / 试题 JSON）仅存活于 React 状态，无法：
- 保存为 `vf_resource` 数据库记录
- 被其他章节复用
- 在资源中心管理和搜索
- 关联到章节（`vf_section_resource`）形成完整的课程资源体系

### 问题六：OpenMAIC 场景生成管道孤立于 MedPro 体系

OpenMAIC 拥有完整的三段式场景内容生成管道（轮廓大纲 → 场景内容 → 场景动作），但：
- 以 Next.js Route Handler 形式实现，无法在 FastAPI 后端复用
- 前端 `OutlinesEditor` 组件依赖 React 19 + Next.js 特性，无法直接移植
- 场景类型（slide/quiz/interactive/pbl）未与 MedPro 资源类型对齐

---

## 子任务清单

---

### 任务 9-1：数据库 Schema 补充（后端）

> **文件**：`module_simhub/entity/do/simhub_do.py` + 迁移 SQL

#### 9-1-1 VfCourse 新增字段

```python
# 在 VfCourse 类中追加
learning_outcomes = Column(Text, nullable=True,
    comment='学习收获（JSON数组或多行文本）')
certificate_info = Column(String(500), nullable=True, server_default="''",
    comment='课程证书信息')
```

对应 SQL：
```sql
ALTER TABLE vf_course
  ADD COLUMN learning_outcomes TEXT COMMENT '学习收获(JSON数组或换行文本)' AFTER description,
  ADD COLUMN certificate_info VARCHAR(500) DEFAULT '' COMMENT '课程证书信息' AFTER learning_outcomes;
```

- [x] **9-1-1-a** 更新 `simhub_do.py` 中 `VfCourse` 类
- [x] **9-1-1-b** 更新 `module_simhub/entity/vo/` 中 CourseVo 响应体，增加 `learning_outcomes`、`certificate_info` 字段
- [x] **9-1-1-c** 更新 Portal 接口 `getCourseDetail`、课程列表详情接口，返回新字段

#### 9-1-2 VfCourseSection 新增资源标志字段

```python
# 在 VfCourseSection 类中追加
has_micro_video = Column(CHAR(1), nullable=True, server_default='0',
    comment='是否有微课视频(0=否,1=是)')
has_extension = Column(CHAR(1), nullable=True, server_default='0',
    comment='是否有拓展资源(0=否,1=是)')
```

对应 SQL：
```sql
ALTER TABLE vf_course_section
  ADD COLUMN has_micro_video CHAR(1) DEFAULT '0' COMMENT '是否有微课视频' AFTER has_test,
  ADD COLUMN has_extension CHAR(1) DEFAULT '0' COMMENT '是否有拓展资源' AFTER has_micro_video;
```

- [x] **9-1-2-a** 更新 `simhub_do.py` 中 `VfCourseSection` 类
- [x] **9-1-2-b** 更新章节 VO 响应体

#### 9-1-3 新增备课草稿表 `vf_lesson_prep`

```sql
CREATE TABLE vf_lesson_prep (
  prep_id       BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '备课ID',
  course_id     BIGINT DEFAULT NULL COMMENT '关联已有课程ID（NULL=全新课程草稿）',
  teacher_id    BIGINT NOT NULL COMMENT '教师用户ID',
  prep_name     VARCHAR(200) DEFAULT '' COMMENT '备课标题',
  current_step  TINYINT DEFAULT 1 COMMENT '当前编辑步骤(1=基本信息,2=大纲,3=资源配置,4=AI生成,5=发布)',
  basic_info_json    TEXT COMMENT '步骤1基本信息草稿（JSON）',
  outline_json       MEDIUMTEXT COMMENT '步骤2大纲草稿（JSON树）',
  resource_config_json MEDIUMTEXT COMMENT '步骤3资源配置草稿（JSON，key=section_id）',
  status        CHAR(1) DEFAULT '0' COMMENT '状态(0=草稿,1=待审核,2=已发布)',
  create_time   DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time   DATETIME ON UPDATE CURRENT_TIMESTAMP,
  tenant_id     BIGINT DEFAULT NULL COMMENT '租户ID',
  del_flag      CHAR(1) DEFAULT '0' COMMENT '删除标志'
);
```

- [x] **9-1-3-a** 新增 `VfLessonPrep` ORM 模型
- [x] **9-1-3-b** 新增 `LessonPrepDAO` + 基础 CRUD
- [x] **9-1-3-c** 新增 `LessonPrepService` + `LessonPrepController`（`/simhub/teacher/lesson-prep/`）

---

### 任务 9-2：章节–资源多对多关系 API 层完善（后端）

> 现有三张关联表已存在，但教师端 Controller 尚未暴露完整操作接口

#### 9-2-1 VfSectionResource 完整 CRUD 接口

```
GET    /simhub/teacher/section/{sectionId}/resources      — 获取章节绑定的所有资源（含资源详情）
POST   /simhub/teacher/section/{sectionId}/resources/bind  — 绑定资源到章节（批量）
DELETE /simhub/teacher/section/{sectionId}/resources/{resourceId} — 解绑资源
PUT    /simhub/teacher/section/{sectionId}/resources/sort  — 调整资源排序
```

响应体结构（每条资源绑定记录）：
```json
{
  "bindId": 1,
  "resourceId": 10,
  "resourceName": "心电图基础课件",
  "resourceType": "courseware",
  "fileFormat": "pptx",
  "fileUrl": "/profile/upload/...",
  "duration": 0,
  "sortOrder": 1
}
```

- [x] **9-2-1-a** 扩充 `course_dao.py`：增加 `get_section_resources`、`bind_resource`、`unbind_resource`、`sort_resources` 方法
- [x] **9-2-1-b** 扩充 `teacher_controller.py`：新增上述4个端点
- [x] **9-2-1-c** 同步更新绑定/解绑时自动刷新 `vf_course_section.has_resource`、`has_micro_video`、`has_extension` 标志位

#### 9-2-2 Portal 课程详情接口增强

```
GET /simhub/portal/course/{courseId}   — 已有，扩展：
    sections[].resources: []           — 每节携带已绑定资源列表（仅 status=0 的资源）
    sections[].experiments: []         — 已绑定实验列表
    sections[].questions_count: int    — 已绑定习题数量
```

- [x] **9-2-2-a** `portal_controller.py` 中课程详情接口：JOIN `vf_section_resource` 填充资源列表（按 sort_order）
- [x] **9-2-2-b** 更新前端 `CourseSection` TypeScript 类型，新增 `resources?: ResourceItem[]`、`experiments?: ExperimentItem[]`、`questionsCount?: number`

---

### 任务 9-3：前端 API 层扩展（Portal）

> **文件**：`medpro-fastapi-portal/src/api/`

- [x] **9-3-1** 更新 `course.ts`：
  - `CourseSection` 新增字段：`hasMicroVideo`, `hasExtension`, `resources`, `experiments`, `questionsCount`
  - `Course` 新增字段：`learningOutcomes`, `certificateInfo`

- [x] **9-3-2** 新建 `src/api/lesson-prep.ts`：
  ```typescript
  // 备课草稿 CRUD
  export function getLessonPrepList(): Promise<LessonPrep[]>
  export function getLessonPrepDetail(prepId: number): Promise<LessonPrepDetail>
  export function saveLessonPrepStep(prepId: number, step: number, data: object): Promise<void>
  export function createLessonPrep(data: CreatePrepParams): Promise<{ prepId: number }>
  export function publishLessonPrep(prepId: number): Promise<void>
  export function deleteLessonPrep(prepId: number): Promise<void>

  // 章节资源绑定
  export function getSectionResources(sectionId: number): Promise<SectionResource[]>
  export function bindSectionResources(sectionId: number, resourceIds: number[]): Promise<void>
  export function unbindSectionResource(sectionId: number, resourceId: number): Promise<void>
  export function sortSectionResources(sectionId: number, order: number[]): Promise<void>
  ```

- [x] **9-3-3** 新建 `src/api/ai-generate.ts`：
  ```typescript
  // AI 辅助生成接口（对接 module_ai）
  export function aiGenerateCourseInfo(topic: string, signal?: AbortSignal): AsyncIterable<string>
  export function aiGenerateOutline(courseInfo: CourseBasicInfo, signal?: AbortSignal): AsyncIterable<OutlineNode[]>
  export function aiGenerateContent(section: SectionInfo, type: 'md'|'slide', signal?: AbortSignal): AsyncIterable<string>
  export function aiGenerateQuiz(section: SectionInfo, config: QuizConfig, signal?: AbortSignal): Promise<QuizQuestion[]>
  ```

---

### 任务 9-4：教师工作台 — 去 Mock + 接真实 API

> **文件**：`medpro-fastapi-portal/src/app/pages/TeacherWorkbench.tsx`

- [x] **9-4-1** 用 `getCourseList({ teacherId })` 替换 `MY_COURSES` Mock 数据
- [x] **9-4-2** 用 `getTeacherDashboard()` 替换 `STATS` 统计 Mock 数据
- [x] **9-4-3** 用 `getTeacherStudents()` 替换 `MY_STUDENTS` Mock 数据
- [x] **9-4-4** 在 `TABS` 中新增 `{ key: 'lesson-prep', label: '备课管理', icon: NotebookPen }` Tab

---

### 任务 9-5：备课管理五步向导组件

> **新文件**：`medpro-fastapi-portal/src/app/pages/teacher/`

#### 9-5-1 总入口 `LessonPrepManager.tsx`

- 左侧：备课列表（草稿状态卡片，显示课程名称/步骤进度/最后修改时间）
- 顶部：`新建备课` 按钮（新建草稿）
- 右侧：选中备课后展示五步向导

```
[ 草稿列表 ] | [ 步骤进度条: ①基本信息 → ②大纲 → ③资源配置 → ④AI辅助 → ⑤发布 ]
             |
             | [ 当前步骤内容 ]
```

- [x] **9-5-1-a** 实现备课草稿列表（调用 `getLessonPrepList`）
- [x] **9-5-1-b** 实现步骤进度条导航（Stepper 组件，支持跳转已完成步骤）
- [x] **9-5-1-c** 步骤状态自动保存（切换步骤前自动调用 `saveLessonPrepStep`）

#### 9-5-2 步骤 1：课程基本信息 `Step1BasicInfo.tsx`

表单字段：

| 字段 | 控件 | 必填 |
|---|---|---|
| 课程名称 | Input | ✅ |
| 主讲教师 | Input（默认当前用户）| ✅ |
| 所属院系 | Select（系统字典）| ✅ |
| 课程类别 | RadioGroup（理论/实验/理实一体化）| ✅ |
| 总章节数 | NumberInput | ✅ |
| 总学时 | NumberInput | ✅ |
| 开课时间 | DatePicker | ✅ |
| 课程简介 | Textarea（富文本）| — |
| 学习收获 | 动态列表（可增删条目）| — |
| 课程证书 | Input | — |
| 封面图 | 图片上传 | — |

- [x] **9-5-2-a** 实现基本信息表单（字段完整）
- [x] **9-5-2-b** 顶部放置 `🤖 AI 一键生成` 按钮，点击展开 `AICourseInfoPanel`
- [x] **9-5-2-c** AI Panel：输入主题/关键词 → 调用 `aiGenerateCourseInfo` → 流式输出填充表单

#### 9-5-3 步骤 2：课程大纲规划 `Step2Outline.tsx`

- 树形章节编辑器（Accordion + DnD）：
  - 支持增删"章"（chapter）与"节"（section）
  - 每节可编辑：标题、学时、简介
  - 支持拖拽调整顺序
- 顶部放置 `🤖 AI 生成大纲` 按钮

```
+ 第一章  心脏解剖基础        [4学时]  [+添加节] [↑] [↓] [🗑]
  └─ 第1节  心脏的大体解剖    [2学时]  [编辑] [🗑]
  └─ 第2节  心脏瓣膜结构      [2学时]  [编辑] [🗑]
+ 第二章  心脏电生理           [6学时]  [+添加节] [↑] [↓] [🗑]
  └─ 第1节  心肌细胞电位      [3学时]  ...
```

- [x] **9-5-3-a** 实现树形大纲编辑器
- [x] **9-5-3-b** 实现拖拽排序（使用 `@dnd-kit/core` 或 `motion` drag）
- [x] **9-5-3-c** `AIOulinePanel`：流式生成大纲（SSE），实时渲染树节点
- [x] **9-5-3-d** 大纲 JSON 持久化到备课草稿（`outline_json` 字段）

#### 9-5-4 步骤 3：教学资源配置 `Step3Resources.tsx`

左侧章节导航 + 右侧资源配置面板：

```
[ 章节树导航 ]  |  [ 选中节：第1节 心脏的大体解剖 ]
第一章 ▼         |  ┌─────────────────────────────────────────┐
  第1节 ●       |  │ 本节学时：[ 2 ] 学时                     │
  第2节          |  │                                           │
第二章 ▼         |  │ 微课视频  [+ 上传] [📁 选择已有]         │
  第1节          |  │ 课    件  [+ 上传] [📁 选择已有] [🤖生成]│
  第2节          |  │ 虚拟实验  [🔗 关联实验] [🤖生成 MD]      │
                 |  │ 在线测试  [🔗 选题库]  [🤖批量生成]      │
                 |  │ 拓展资源  [+ 上传] [🔗 链接]             │
                 |  └─────────────────────────────────────────┘
```

- [x] **9-5-4-a** 实现左侧章节导航（基于步骤2大纲数据）
- [x] **9-5-4-b** 每类资源可调用 `bindSectionResources` / `unbindSectionResource`
- [x] **9-5-4-c** 已绑定资源以卡片列表展示，支持排序和删除
- [x] **9-5-4-d** 资源选择器弹窗：从资源库（`/simhub/portal/resource`）按类型筛选选择
- [x] **9-5-4-e** 绑定/解绑时自动刷新章节 `has_*` 标志位显示

#### 9-5-5 步骤 4：AI 大模型辅助编辑 `Step4AIEditor.tsx`

六个 AI 工具 Tab 页：

| Tab | 说明 |
|---|---|
| 课件生成智能体 | 输入章节主题 → 生成 HTML 幻灯片骨架（参考 OpenMAIC scene 格式）|
| MD 教学内容生成器 | 输入主题关键词 → 流式生成 Markdown 正文 + Monaco 编辑器预览 |
| 实验 MD 资源生成器 | 输入实验步骤描述 → 生成可交互 MD 实验文档 |
| 通用 AI 大模型编辑器 | 多轮对话 + 文档上传（PDF/TXT）+ 输出任意格式 |
| 试题生成智能体 | 输入章节主题/难度/题数 → 批量生成题目 JSON，可一键导入题库 |
| 大纲优化智能体 | 对已有大纲进行 AI 检查和建议优化 |

- [x] **9-5-5-a** 实现 AI Tab 页框架（6个面板）
- [x] **9-5-5-b** MD 生成器：流式输出 + Monaco/CodeMirror 编辑器（双栏：编辑|预览）
- [x] **9-5-5-c** 课件生成器：调用后端生成 HTML slides，iframe 预览
- [x] **9-5-5-d** 试题生成器：表单配置（题型/数量/难度）→ 批量导入 `VfQuestion`
- [x] **9-5-5-e** 通用编辑器：多轮对话框 + 内容保存到资源草稿
- [x] **9-5-5-f** 所有 AI 编辑器均显示流式输出进度（Spinner/进度条）

#### 9-5-6 步骤 5：发布审核 `Step5Publish.tsx`

- 课程完整性检查（显示各步骤完成情况 CheckList）
- 选择发布目标（草稿/提交审核/直接发布）
- 一键发布：调用 `publishLessonPrep(prepId)` → 后端将备课草稿转换为正式 VfCourse + VfCourseSection + VfSectionResource 数据

- [x] **9-5-6-a** 完整性检查面板
- [x] **9-5-6-b** 发布逻辑（后端需对应 `/simhub/teacher/lesson-prep/{id}/publish` 接口）

---

### 任务 9-6：后端 AI 生成接口（module_ai 扩展）

> **新文件**：`medpro-fastapi-backend/module_ai/`

- [x] **9-6-1** `controller/lesson_prep_ai_controller.py`：
  ```
  POST /ai/lesson-prep/generate-course-info   — AI 生成课程基本信息（SSE 流式）
  POST /ai/lesson-prep/generate-outline       — AI 生成课程大纲（SSE 流式，JSON tree）
  POST /ai/lesson-prep/generate-md-content    — AI 生成章节 MD 教学内容（SSE 流式）
  POST /ai/lesson-prep/generate-quiz          — AI 批量生成试题（同步 JSON）
  POST /ai/lesson-prep/generate-slide-html    — AI 生成课件 HTML（同步或 SSE）
  ```

- [x] **9-6-2** `service/lesson_prep_ai_service.py`：
  - 复用 `module_ai` 中的 `AiModels` 配置（已有 API Key 管理）
  - 使用 LangChain / OpenAI SDK 实现提示词工程
  - Prompt 模板存放于 `config/prompts/lesson_prep/`

- [x] **9-6-3** 课程信息生成 Prompt 模板：
  ```
  你是一位医学教育课程设计专家。请根据课程主题「{topic}」，
  生成结构化的课程基本信息，输出 JSON 格式：
  { "courseName": "", "description": "", "learningOutcomes": [],
    "certificateInfo": "", "totalSections": 10, "totalHours": 20,
    "courseCategory": "2" }
  ```

- [x] **9-6-4** 大纲生成 Prompt 模板（参考 OpenMAIC `outline-generator.ts` 逻辑）：
  ```
  基于课程「{courseName}」，生成包含 {totalSections} 章的课程大纲树，
  JSON 格式：[{ "title": "第一章...", "hours": N, "children": [{...}] }]
  ```

- [x] **9-6-5** 试题生成 Prompt 模板（参考 VfQuestion 结构）：
  ```
  为章节「{sectionTitle}」生成 {count} 道{questionType}题，
  难度{difficulty}，JSON 数组格式符合 VfQuestion 结构...
  ```

---

## ~~任务 9-7：门户前端技术栈迁移（Next.js 重构）~~ ❌ 已取消

> **决策**：`medpro-fastapi-portal-next` 项目已删除，技术栈迁移计划终止。  
> 后续所有功能继续在现有 **Vite+React18** 门户中迭代。

---

## 任务 9-8：LLM 生成内容持久化为教学资源（后端）

> **文件**：`medpro-fastapi-backend/module_ai/controller/lesson_prep_ai_controller.py` +  
> `medpro-fastapi-backend/module_ai/service/lesson_prep_ai_service.py`

**需求背景**：Step4AIEditor 中生成的内容（教案 MD / 幻灯片 HTML / 试题 JSON）目前仅存活于 React 状态，需持久化为 `vf_resource` 记录，以便跨章节复用和资源中心管理。

**接口设计**：

```
POST /ai/lesson-prep/save-resource
```

请求体：
```json
{
  "resourceName": "心脏解剖基础教案",
  "content": "# 教学目标\n...",
  "contentType": "md",            // "md" | "html" | "quiz_json"
  "resourceType": "lesson_plan",  // lesson_plan | courseware | extension
  "sectionId": 42                 // 可选，自动绑定到章节
}
```

响应体：
```json
{
  "code": 200,
  "data": {
    "resourceId": 1001,
    "fileUrl": "/profile/ai-gen/uuid.md"
  }
}
```

**实现逻辑**：
1. 根据 `contentType` 确定文件扩展名（`md` / `html` / `json`）
2. 生成 UUID 文件名，写入 `{UploadConfig.UPLOAD_PATH}/ai-gen/{uuid}.{ext}`
3. 调用 `ResourceDao.add_resource()` 创建 `vf_resource` 记录
4. 若传入 `sectionId`，在 `vf_section_resource` 中自动绑定，并刷新章节 `has_resource` 标志

- [ ] **9-8-1** 在 `lesson_prep_ai_service.py` 新增 `save_ai_generated_resource()` 静态方法
- [ ] **9-8-2** 在 `lesson_prep_ai_controller.py` 新增 `POST /save-resource` 端点
- [ ] **9-8-3** 新增 `SaveResourceRequest` Pydantic 模型（`content_type`, `resource_name`, `content`, `resource_type`, `section_id?`）
- [ ] **9-8-4** 写文件时创建 `ai-gen/` 子目录（`os.makedirs(..., exist_ok=True)`）

---

## 任务 9-9：Step4AIEditor"保存为资源"功能（前端）

> **文件**：`medpro-fastapi-portal/src/app/pages/teacher/prep/Step4AIEditor.tsx` +  
> `medpro-fastapi-portal/src/api/ai-generate.ts`

**需求背景**：在每个 AI Tab 面板的生成内容区域，添加"保存为资源"按钮，调用 9-8 的新端点将生成内容持久化。

**交互设计**：
- 生成完成后，内容区右上角出现 `[ 保存为资源 ]` 按钮（`Loader2` 转圈中 → `CheckCircle2` 保存成功）
- 弹出小型表单：资源名称（默认 = 章节标题 + 内容类型）、是否绑定到当前章节（默认勾选）
- 成功后 toast：`"已保存为资源并绑定到章节"`

**新增 API 函数**：
```typescript
// ai-generate.ts
export async function saveAiResource(params: {
  resourceName: string;
  content: string;
  contentType: 'md' | 'html' | 'quiz_json';
  resourceType: string;
  sectionId?: number;
}): Promise<{ resourceId: number; fileUrl: string }>
```

**新增状态**（Step4AIEditor.tsx）：
```typescript
const [savedResources, setSavedResources] = useState<Record<string, number>>({}); // key = sectionId_tab
const [saving, setSaving] = useState<Record<string, boolean>>({});
```

- [ ] **9-9-1** 在 `ai-generate.ts` 新增 `saveAiResource()` 函数
- [ ] **9-9-2** 为每个 Tab 面板（md / exp / slide）添加"保存为资源"按钮组件
- [ ] **9-9-3** 试题 Tab（quiz）添加"保存为试题资源"按钮（JSON 序列化后保存）
- [ ] **9-9-4** 实现保存成功状态反馈（CheckCircle 图标 + toast）

---

## 任务 9-10：OpenMAIC 场景大纲生成管道移植（后端 Python）

> **文件**：`medpro-fastapi-backend/module_ai/controller/lesson_prep_ai_controller.py` +  
> `medpro-fastapi-backend/module_ai/service/lesson_prep_ai_service.py`

**需求背景**：将 OpenMAIC 的三段式场景生成管道（`scene-outlines-stream` → `scene-content` → `scene-actions`）以 Python 方式重新实现，集成到 MedPro 的 AI 接口体系中。

**场景类型定义（Python 模型）**：
```python
class SceneOutline(BaseModel):
    id: str
    type: Literal['slide', 'quiz', 'interactive', 'pbl']
    title: str
    description: str
    key_points: list[str]
    teaching_objective: str | None = None
    order: int
```

**新增接口**：

### 9-10-1：场景大纲流式生成
```
POST /ai/lesson-prep/generate-scene-outlines
```
- Input: `{ sectionTitle: str, courseName: str, sceneCount: int = 6 }`
- SSE 流式输出，每个 outline 对象逐个流出：
  ```
  data: {"type":"outline","data":{"id":"s1","type":"slide","title":"...","order":1},"index":0}
  data: {"type":"done","total":6}
  ```
- 系统提示词：场景设计专家角色 + JSON 格式约束 + 医学教育场景类型说明

### 9-10-2：场景内容生成
```
POST /ai/lesson-prep/generate-scene-content
```
- Input: `{ outline: SceneOutline, allOutlines: list[SceneOutline], sectionTitle: str }`
- 根据 `outline.type` 分支：
  - `slide`: 生成幻灯片布局 JSON（title, subtitle, bullets, layout_type）
  - `quiz`: 生成测验题目数组（与 generate-quiz 复用逻辑）
  - `interactive`: 生成交互步骤 JSON
  - `pbl`: 生成 PBL 案例描述 JSON
- 非流式，返回结构化 JSON

- [ ] **9-10-1** 新增 `SceneOutline` Pydantic 模型（`module_ai/entity/vo/scene_vo.py`）
- [ ] **9-10-2** 在 `lesson_prep_ai_service.py` 实现 `generate_scene_outlines()` SSE 方法
- [ ] **9-10-3** 在 `lesson_prep_ai_service.py` 实现 `generate_scene_content()` 同步方法
- [ ] **9-10-4** 在 `lesson_prep_ai_controller.py` 新增对应两个端点（SSE + JSON）
- [ ] **9-10-5** 场景大纲的提示词：涵盖 slide/quiz/interactive/pbl 四种类型的设计指导

---

## 任务 9-11：OutlinesEditor 组件移植（前端 Vite/React 18）

> **源文件**：`OpenMAIC/components/generation/outlines-editor.tsx`  
> **目标文件**：`medpro-fastapi-portal/src/components/lesson/OutlinesEditor.tsx`

**移植要点**：
- 移除 `useI18n` hook → 硬编码中文字符串
- 移除 Next.js 特有 API（无需处理，该组件主要依赖 React + Radix + motion）
- React 19 特性检查：检查 `use()` hook 等新 API，回退为 React 18 兼容写法
- 依赖检查：`motion`（已安装）、`nanoid`（需确认）、`@radix-ui/react-checkbox`（已安装）

**集成点**：
- `Step4AIEditor.tsx`：新增"场景大纲"Tab，调用 `/ai/lesson-prep/generate-scene-outlines` SSE 接口，实时渲染 OutlinesEditor
- `Step2Outline.tsx`：可选集成，在基础大纲编辑器旁提供"AI 场景规划"入口

**SceneOutline 对应前端类型**：
```typescript
export type SceneType = 'slide' | 'quiz' | 'interactive' | 'pbl';
export interface SceneOutline {
  id: string;
  type: SceneType;
  title: string;
  description: string;
  keyPoints: string[];
  teachingObjective?: string;
  order: number;
}
```

- [ ] **9-11-1** 检查并安装 `nanoid` 依赖（`pnpm add nanoid`）
- [ ] **9-11-2** 移植 `OutlinesEditor` 组件至 `src/components/lesson/OutlinesEditor.tsx`
- [ ] **9-11-3** 新增 `src/api/ai-generate.ts` 中 `streamSceneOutlines()` 和 `generateSceneContent()` 函数
- [ ] **9-11-4** 在 `Step4AIEditor.tsx` 新增"场景大纲"Tab 并集成 OutlinesEditor + SSE 流

---

## 执行顺序与依赖关系

```
✅ 9-1（DB Schema）
  ├─→ ✅ 9-2（后端 API 多对多关系）
  │     └─→ ✅ 9-3（前端 API 层）
  │           ├─→ ✅ 9-4（TeacherWorkbench 去 Mock）
  │           └─→ ✅ 9-5（备课向导组件 Step1~5）
  │                                      │
  └─→ ✅ 9-6（module_ai 生成接口）────────┘
                   ↓
           9-8（save-resource 后端）─→ 9-9（Step4AIEditor 保存按钮）
                   ↓
           9-10（OpenMAIC 场景管道 Python 移植）─→ 9-11（OutlinesEditor 组件移植）
```

**Sprint 进度**：
- **Sprint 1（已完成）**：9-1 → 9-2 → 9-3 → 9-4 → 9-5（步骤1~3）
- **Sprint 2（已完成）**：9-5（步骤4~5）+ 9-6（AI 接口 7个端点）
- **Sprint 3（进行中）**：9-8 + 9-9（LLM 资源持久化）+ 9-10 + 9-11（OpenMAIC 管道移植）

---

## 页面与组件汇总

| 组件/页面 | 路径 | 类型 | 状态 |
|---|---|---|---|
| TeacherWorkbench（去Mock）| `pages/TeacherWorkbench.tsx` | 改造 | ✅ |
| LessonPrepManager | `pages/teacher/LessonPrepManager.tsx` | 新增 | ✅ |
| Step1BasicInfo | `pages/teacher/prep/Step1BasicInfo.tsx` | 新增 | ✅ |
| Step2Outline | `pages/teacher/prep/Step2Outline.tsx` | 新增 | ✅ |
| Step3Resources | `pages/teacher/prep/Step3Resources.tsx` | 新增 | ✅ |
| Step4AIEditor | `pages/teacher/prep/Step4AIEditor.tsx` | 新增 | ✅（内容生成）🔄（持久化 9-9）|
| Step5Publish | `pages/teacher/prep/Step5Publish.tsx` | 新增 | ✅ |
| OutlinesEditor | `components/lesson/OutlinesEditor.tsx` | 移植 | 🔲（9-11）|
| CourseDetailPage（资源展示）| `pages/CourseDetailPage.tsx` | 扩展 | ✅ |
| CourseLearningPage（资源列表）| `pages/CourseLearningPage.tsx` | 扩展 | ✅ |

---

## 风险与注意事项

| 风险点 | 影响 | 缓解措施 |
|---|---|---|
| AI 接口 Key 未配置 | AI 生成功能报错 | 从 `AiModels` 表读取配置，UI 显示配置引导 |
| 大纲 JSON 结构版本迭代 | 草稿无法反序列化 | 加版本字段 `version: 1`，做向前兼容解析 |
| 流式 SSE 在 Nginx 下被缓冲 | AI 输出延迟显示 | 后端设置 `X-Accel-Buffering: no`，配置 Nginx `proxy_buffering off` |
| 章节资源绑定并发修改 | 排序错乱 | 乐观锁或数据库事务保证 sort_order 原子更新 |
| OpenMAIC 组件依赖 React 19 特性 | 移植后编译报错 | 检查并降级使用 `use` hook 等 React 19 API，必要时回退到 React 18 兼容写法 |
| AI 生成文件积累磁盘占用 | 存储空间耗尽 | `ai-gen/` 子目录，可定期清理未关联文件 |

---

## 数据库 Schema 变更汇总

```sql
-- 1. vf_course 新增字段
ALTER TABLE vf_course
  ADD COLUMN learning_outcomes TEXT COMMENT '学习收获' AFTER description,
  ADD COLUMN certificate_info VARCHAR(500) DEFAULT '' COMMENT '课程证书信息' AFTER learning_outcomes;

-- 2. vf_course_section 新增字段
ALTER TABLE vf_course_section
  ADD COLUMN has_micro_video CHAR(1) DEFAULT '0' COMMENT '是否有微课视频' AFTER has_test,
  ADD COLUMN has_extension CHAR(1) DEFAULT '0' COMMENT '是否有拓展资源' AFTER has_micro_video;

-- 3. 新增备课草稿表
CREATE TABLE vf_lesson_prep (
  prep_id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id            BIGINT DEFAULT NULL,
  teacher_id           BIGINT NOT NULL,
  prep_name            VARCHAR(200) DEFAULT '',
  current_step         TINYINT DEFAULT 1,
  basic_info_json      TEXT,
  outline_json         MEDIUMTEXT,
  resource_config_json MEDIUMTEXT,
  status               CHAR(1) DEFAULT '0',
  create_time          DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time          DATETIME ON UPDATE CURRENT_TIMESTAMP,
  tenant_id            BIGINT DEFAULT NULL,
  del_flag             CHAR(1) DEFAULT '0',
  INDEX idx_teacher (teacher_id),
  INDEX idx_course (course_id)
) COMMENT='备课草稿表';
```

**⚠️ 无需新增资源关联表**：`vf_section_resource`、`vf_section_experiment`、`vf_section_question` 三张关联表已存在，本阶段工作是在应用层完整暴露其 CRUD API 并在前端实现操作 UI。

---

## 闭环验收标准

### Sprint 1 验收
- [ ] `vf_course` 新字段在课程详情接口中正常返回
- [ ] `vf_course_section` 详情含已绑定资源列表（`resources[]`）
- [ ] 备课草稿表 CRUD 接口工作正常（增/查/存步骤/删）
- [ ] TeacherWorkbench 去 Mock，课程/学生数据来自真实 API
- [ ] 备课管理 Tab 可见，步骤1-3 表单可正常填写并保存草稿

### Sprint 2 验收（已完成）
- [x] AI 课程信息生成：输入主题，流式输出并填充表单字段
- [x] AI 大纲生成：流式生成章节树，可实时编辑
- [x] AI MD 内容生成：选定章节后流式生成教学内容，Monaco 编辑器可编辑
- [x] 试题批量生成：配置参数后生成，可选择性导入题库
- [x] 备课发布：草稿可发布为正式课程（`vf_course` 记录创建）

### Sprint 3（进行中）验收
- [ ] AI 生成内容（教案/幻灯片/试题）可一键保存为 `vf_resource` 记录（`POST /ai/lesson-prep/save-resource`）
- [ ] 保存时可选择自动绑定到当前章节（`vf_section_resource` 关联创建）
- [ ] Step4AIEditor 每个内容 Tab 显示"保存为资源"按钮，操作成功有 toast 反馈
- [ ] 场景大纲生成接口工作正常（SSE 流式逐个输出 SceneOutline 对象）
- [ ] 场景内容生成接口工作正常（同步 JSON，根据类型分支生成 slide/quiz/interactive/pbl）
- [ ] `OutlinesEditor` 组件（从 OpenMAIC 移植）在 Step4AIEditor 场景大纲 Tab 中正常渲染
- [ ] OutlinesEditor 支持 SSE 流式输入（大纲边生成边显示）
