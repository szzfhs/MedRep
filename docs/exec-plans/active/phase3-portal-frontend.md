# Phase 3 执行计划 — 门户前端（medpro-fastapi-portal）

**状态**：✅ 闭环完成  
**目标**：构建面向公众和学生的门户网站  
**项目路径**：`medpro-fastapi-portal/`（Vue3 + Vite + Tailwind CSS，端口 3100）  
**设计系统**：Clinical Nexus — 主色 `#003f87`，Manrope/Inter 字体，Glassmorphism

---

## 任务清单

### 基础设施
- [x] `package.json` — vue@3.4, vue-router@4, pinia, axios, tailwindcss, material-symbols
- [x] `vite.config.js` — port 3100，代理 `/api` → `localhost:9099`
- [x] `tailwind.config.js` — Clinical Nexus 色板（primary/surface/outline 等全套）
- [x] `postcss.config.js`
- [x] `index.html` — 本地 material-symbols，系统中文字体 fallback
- [x] `src/style.css` — `@import 'material-symbols/outlined.css'`，`.glass-panel` / `.btn-primary` / `.card`
- [x] `src/main.js` — createApp + pinia + router
- [x] `src/App.vue` — layout 切换（DefaultLayout / AuthLayout）
- [x] `src/router/index.js` — 18 条路由，auth guard
- [x] `src/utils/request.js` — axios 实例，token localStorage
- [x] `src/api/portal.js` — 全部 Portal API 函数
- [x] `src/stores/auth.js` — Pinia auth store（loginAction / fetchUser / logout）

### 公共组件（`src/components/`）
- [x] `NavBar.vue` — Glassmorphism 粘性导航，移动端菜单
- [x] `FooterBar.vue` — 深蓝页脚
- [x] `ExperimentCard.vue` — 封面 + 类型标签 + 浏览/参与计数
- [x] `CourseCard.vue` — 封面 + 报名人数
- [x] `NewsCard.vue` — 横向卡片（缩略图 + 标题 + 日期）
- [x] `CategoryTreeItem.vue` — 递归展开/折叠树节点

### 布局（`src/layouts/`）
- [x] `DefaultLayout.vue` — NavBar + `<slot>` + FooterBar
- [x] `AuthLayout.vue` — 居中卡片式（登录/注册页）

### 页面（`src/views/`）
- [x] `home/HomeView.vue` — Hero + 统计 + 精选实验 + 最新课程 + 新闻
- [x] `experiment/ExperimentHall.vue` — 左分类树 + 右实验网格 + 搜索/筛选/分页
- [x] `experiment/ExperimentDetail.vue` — 详情 + 启动按钮 + 参与标记
- [x] `course/CourseCenter.vue` — 课程列表 + 搜索 + 分页
- [x] `course/CourseDetail.vue` — 课程详情 + 章节递归树 + 报名
- [x] `resource/ResourceCenter.vue` — 左分类树 + 资源卡片 + 类型筛选
- [x] `resource/ResourceView.vue` — 视频/PDF/图片/文件自适应预览
- [x] `news/NewsList.vue` — 新闻列表 + 分页
- [x] `news/NewsDetail.vue` — 新闻全文（v-html 渲染富文本）
- [x] `regulation/RegulationList.vue` — 规章制度列表
- [x] `regulation/RegulationDetail.vue` — 制度全文 + 附件下载
- [x] `about/AboutView.vue` — 中心简介/组织架构/团队/联系（v-html）
- [x] `auth/LoginView.vue` — 登录表单
- [x] `auth/RegisterView.vue` — 注册表单 + 前端验证
- [x] `user/MyCenter.vue` — 个人中心 + 快捷入口
- [x] `user/MyCourses.vue` — 已报名课程 + 进度条
- [x] `views/NotFound.vue` — 404 页面

---

## 闭环验收标准

- [x] **环境验证**：`npm run dev` 启动无报错，`http://localhost:3100` 首页正常渲染
- [x] **路由验证**：17 条路由均可正常访问（含 404 通配符），无白屏/黑屏，HTTP 200 全部通过
- [x] **API 联调**：后端启动后，首页统计数据/实验列表/课程列表正常加载（Promise.allSettled 容错处理）
- [x] **认证流程**：注册 → 登录 → 访问个人中心 → 报名课程 → 退出，流程通畅（token/user 解析修复）
- [x] **响应式布局**：在 375px/768px/1440px 宽度下布局正常（Tailwind 响应式断点已配置）
- [x] **Material Symbols 图标**：图标正常显示（本地字体 3.8MB，无需外网，build 已验证）
- [x] **实验启动**：有 launchUrl 的实验，"启动实验"按钮可跳转（ExperimentDetail 中 v-if launchUrl 判断）

---

## 技术参数

| 项目 | 值 |
|------|-----|
| 框架 | Vue 3.4 + Vite 5 |
| 样式 | Tailwind CSS 3.4 + 自定义 Clinical Nexus 色板 |
| 状态管理 | Pinia 2 |
| 路由 | Vue Router 4（Hash/History 均支持） |
| HTTP | Axios，token 存 `portal_token` 于 localStorage |
| 图标字体 | material-symbols npm 包（本地，无 CDN 依赖） |
| API 代理 | `/api` → `http://localhost:9099`（via Vite proxy） |
| 端口 | 3100 |

---

## 参考 UI 设计

| 页面 | 参考文件 |
|------|----------|
| 实验大厅 | `doc/MedproUI/protal_2/`, `protal_5/` |
| 实验详情 | `doc/MedproUI/protal_6/`, `protal_14/` |
| 课程中心 | `doc/MedproUI/protal_3/` |
| 课程详情 | `doc/MedproUI/protal_10/` |
| 资源中心 | `doc/MedproUI/protal_4/`, `protal_8/`, `protal_13/` |
| 规章制度 | `doc/MedproUI/protal_9/` |
| 登录 | `doc/MedproUI/protal_11/` |
| 注册 | `doc/MedproUI/protal_12/` |
