# Portal 迁移与前后端打通迭代计划

## 方案背景
采用 **方案 B**：用 MedUIdesignpro（React + Tailwind + shadcn/ui）替换原 medpro-fastapi-portal（Vue3），保留 medpro-fastapi-frontend 作为系统管理后台不变。

## 最终架构

```
medpro-fastapi-portal    → React 门户应用（MedUIdesignpro 迁移而来）
                            职责：首页、实验大厅、课程、资源、新闻、
                                  学生工作台、教师工作台、管理员后台（业务内容管理）
                            端口：5173（dev）

medpro-fastapi-frontend  → Vue3 + Element Plus 系统管理后台（保持不变）
                            职责：用户/角色/权限、监控、AI模型、代码生成等
                            端口：3000（dev）

medpro-fastapi-backend   → FastAPI 统一后端 API
                            端口：9099
```

---

## Phase 1 — 基础搭建与环境配置（当前阶段）
**目标**：将 MedUIdesignpro 迁移至 medpro-fastapi-portal，打通认证流程。

### 任务清单
- [x] 1.1 创建迭代计划文档
- [x] 1.2 清空 medpro-fastapi-portal 旧 Vue 代码
- [x] 1.3 将 MedUIdesignpro 代码复制到 medpro-fastapi-portal
- [x] 1.4 配置 vite.config.ts：添加 `/dev-api` → `http://127.0.0.1:9099` 代理
- [x] 1.5 创建 `src/lib/request.ts`：axios 实例 + 请求/响应拦截器（JWT token 注入、错误处理）
- [x] 1.6 创建 `src/stores/auth.tsx`：Auth Context（登录、登出、用户信息、token 管理）
- [x] 1.7 创建 `src/api/auth.ts`：登录/注册/获取用户信息 API 函数
- [x] 1.8 改造 `LoginPage.tsx`：替换 mock 登录为真实 API 调用
- [x] 1.9 注入 `AuthProvider` 到 main.tsx 根节点
- [x] 1.10 创建 `ProtectedRoute.tsx`：路由权限守卫（登录/角色二级检查）
- [x] 1.11 改造 `routes.tsx`：student/teacher/admin 路由加入守卫
- [x] 1.12 安装依赖（axios、react、react-dom、typescript types），构建验证通过（2711 modules）

### 涉及文件
```
medpro-fastapi-portal/
├── vite.config.ts          (新建/替换，添加代理)
├── package.json            (替换为 React 版)
├── tsconfig.json           (新建)
├── index.html              (替换)
├── src/
│   ├── lib/
│   │   └── request.ts      (新建 - axios 封装)
│   ├── api/
│   │   ├── auth.ts         (新建 - 认证 API)
│   │   └── captcha.ts      (新建 - 验证码 API)
│   ├── stores/
│   │   └── auth.tsx        (新建 - Auth Context)
│   ├── components/
│   │   └── ProtectedRoute.tsx (新建 - 路由守卫)
│   └── app/
│       ├── routes.tsx      (改造 - 加入守卫)
│       └── pages/
│           ├── LoginPage.tsx    (改造 - 真实 API)
│           └── RegisterPage.tsx (改造 - 真实 API)
```

### API 对接（后端）
```
POST /dev-api/login                → 登录（username, password, code, uuid）
POST /dev-api/register             → 注册
GET  /dev-api/getInfo              → 获取当前用户信息（需 token）
GET  /dev-api/captchaImage         → 获取验证码图片（base64）
POST /dev-api/logout               → 登出
```

---

## Phase 2 — 门户核心功能 API 对接
**目标**：实验、课程、资源、新闻等核心内容模块对接真实数据。

### 任务清单
- [x] 2.1 分析 medpro-fastapi-backend 现有 API（simhub 模块）
- [x] 2.2 创建 `src/api/experiment.ts`：实验列表/详情
- [x] 2.3 创建 `src/api/course.ts`：课程列表/详情
- [x] 2.4 创建 `src/api/resource.ts`：资源中心列表/下载（含分类接口）
- [x] 2.5 创建 `src/api/news.ts`：新闻资讯列表/详情
- [x] 2.6 创建 `src/api/stats.ts`：平台统计数据接口
- [x] 2.7 改造 ExperimentsPage.tsx：替换 mockData，接入真实实验列表 API
- [x] 2.8 改造 CoursesPage.tsx：替换 mockData，接入真实课程列表 API
- [x] 2.9 改造 NewsPage.tsx：替换 mockData，接入真实新闻 API
- [x] 2.10 改造 ResourceCenterPage.tsx：替换 mockData，接入资源列表 + 分类 API
- [x] 2.11 改造 HomePage.tsx：统计数据对接 `/simhub/portal/stats` 接口
- [x] 2.12 后端新增 `GET /simhub/portal/stats` 接口（聚合统计）
- [x] 2.13 修复 favicon.ico 404 → 创建 favicon.svg
- [x] 2.14 修复 images.unsplash.com 外网请求 → 替换为 /placeholder.svg

### 实际使用的后端 Portal 接口
- `GET /simhub/portal/experiment` — 实验列表（含分页）
- `GET /simhub/portal/experiment/{expId}` — 实验详情
- `GET /simhub/portal/experiment/categories` — 实验分类列表
- `GET /simhub/portal/course` — 课程列表
- `GET /simhub/portal/course/{courseId}` — 课程详情
- `GET /simhub/portal/resource` — 资源列表
- `GET /simhub/portal/resource/categories` — 资源分类
- `GET /simhub/portal/news` — 新闻列表
- `GET /simhub/portal/news/{newsId}` — 新闻详情
- `GET /simhub/portal/stats` — 平台统计数据（新增）

### 验收测试
- `curl http://127.0.0.1:9099/simhub/portal/stats` → `{"code":200,"data":{"experimentCount":1,"courseCount":1,"userCount":4,"totalDuration":0}}`
- `curl "http://127.0.0.1:9099/simhub/portal/news?pageNum=1&pageSize=5&status=1"` → `{"code":200,"rows":[...]}`
- `npx vite build` → `✓ built in 2.55s` 无编译错误

---

## Phase 3 — 工作台功能对接
**目标**：学生工作台、教师工作台与真实用户数据打通。

### 任务清单
- [ ] 3.1 创建 `src/api/student.ts`：学生已选课程、实验记录、学习进度
- [ ] 3.2 创建 `src/api/teacher.ts`：教师课程管理、学生管理、成绩录入
- [ ] 3.3 改造 StudentWorkbench.tsx：对接真实 API
- [ ] 3.4 改造 TeacherWorkbench.tsx：对接真实 API
- [ ] 3.5 实现课程报名/退课功能
- [ ] 3.6 实现实验成绩查询
- [ ] 3.7 实现用户个人信息修改（头像、密码等）
- [ ] 3.8 后端新增相应学生/教师 API 路由

---

## Phase 4 — 管理员功能整合与系统打通
**目标**：管理员 admin 页面对接后端，实现内容管理的完整 CRUD。

### 任务清单
- [ ] 4.1 创建 `src/api/admin/` 目录（用户、实验、课程、资源、新闻管理接口）
- [ ] 4.2 改造 AdminDashboard.tsx：对接系统统计 API
- [ ] 4.3 改造 UserManagementPage.tsx：对接后端用户管理 API
- [ ] 4.4 改造 ExperimentsManagePage.tsx：实验管理 CRUD
- [ ] 4.5 改造 CoursesManagePage.tsx：课程管理 CRUD
- [ ] 4.6 改造 ResourcesManagePage.tsx：资源上传/管理
- [ ] 4.7 改造 NewsManagePage.tsx：新闻发布/管理
- [ ] 4.8 改造 RegulationsManagePage.tsx：规章制度管理
- [ ] 4.9 改造 SettingsPage.tsx：系统配置管理
- [ ] 4.10 Admin 路由增加角色校验（需 admin 角色）
- [ ] 4.11 与 medpro-fastapi-frontend 的管理功能区分，避免重叠

---

## 技术约定

### 接口响应格式（统一）
```typescript
interface ApiResponse<T> {
  code: number;      // 200 = 成功
  msg: string;
  data: T;
}
```

### Token 管理
- 存储：`localStorage.setItem('token', token)`
- 请求头：`Authorization: Bearer <token>`
- 过期处理：响应拦截器捕获 401，清除 token 并跳转 `/login`

### 路由权限分级
| 路由 | 权限要求 |
|------|---------|
| `/` `/experiments` `/courses` `/news` ... | 公开 |
| `/student` | 需登录（任意角色）|
| `/teacher` | 需登录 + teacher 角色 |
| `/admin/*` | 需登录 + admin 角色 |

---

## 当前进度
- Phase 1：✅ **已完成**（2026-05-02）
- Phase 2：✅ **已完成**（2026-05-02）
- Phase 3：⏳ 待开始  
- Phase 4：⏳ 待开始
