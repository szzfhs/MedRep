# Phase 6 执行计划 — 集成测试 & 上线部署

**状态**：⏳ 待开始（依赖 Phase 1-5 全部闭环）  
**目标**：完整端到端测试、性能优化、Docker 部署、生产环境上线  
**前置条件**：所有功能模块开发完成，本地联调通过

---

## 阶段一：集成测试（后端 API 测试）

### 基于现有测试框架（`medpro-fastapi-test/`）
- [ ] 补充 `system/test_simhub_portal.py` — 门户公开接口测试
  - GET /simhub/portal/center
  - GET /simhub/portal/news（分页、搜索）
  - GET /simhub/portal/experiment（分类筛选）
  - GET /simhub/portal/course
  - GET /simhub/portal/resource
- [ ] 补充 `system/test_simhub_auth.py` — 需认证接口测试
  - 登录获取 token
  - POST /simhub/portal/experiment/{id}/participate
  - POST /simhub/course/enroll/{id}
  - GET /simhub/student/courses
  - PUT /simhub/student/section/{id}/complete
- [ ] 补充 `system/test_simhub_teacher.py` — 教师端接口测试
  - 使用 teacher 角色 token
  - 课程 CRUD 全流程
  - 章节 CRUD 全流程
  - 查看学生列表
- [ ] 补充 `system/test_simhub_admin.py` — 管理员端接口测试
  - 实验 CRUD
  - 新闻 CRUD
  - 资源 CRUD

### 测试执行
- [ ] 所有测试用例通过率 ≥ 90%
- [ ] 关键流程（报名/参与/进度/登录）100% 通过

---

## 阶段二：前端 E2E 测试（可选，Playwright）

- [ ] 安装 Playwright：`npm install @playwright/test -D`
- [ ] `tests/e2e/portal_flow.spec.js`
  - 首页加载 → 实验列表 → 实验详情
  - 注册新用户 → 登录 → 个人中心
  - 课程报名 → 进入学习 → 标记章节完成
- [ ] `tests/e2e/teacher_flow.spec.js`
  - 教师登录 → 新建课程 → 添加章节 → 发布

---

## 阶段三：性能优化

### 后端
- [ ] 对高频查询接口添加 Redis 缓存（5分钟 TTL）
  - GET /simhub/portal/center（很少变动，缓存1小时）
  - GET /simhub/portal/experiment（热门列表，缓存5分钟）
  - GET /simhub/portal/course（首页列表，缓存5分钟）
- [ ] `vf_experiment.view_count` 计数器改为异步队列（避免写锁竞争）
- [ ] 数据库索引审查（`vf_news.status+create_time`，`vf_experiment.category_id+status`）

### 前端
- [ ] 门户首页 Lighthouse Performance ≥ 80
- [ ] `vite build` 构建大小检查（bundle analyzer）
- [ ] 图片懒加载（`loading="lazy"` + 自定义 intersection observer）
- [ ] 路由组件懒加载验证（已实现，确认 chunk 正确分割）

---

## 阶段四：Docker 部署配置

### 门户前端（新增）
- [ ] 为 `medpro-fastapi-portal/` 新建 `Dockerfile`
  ```dockerfile
  FROM node:20-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 3100
  ```
- [ ] 新建 `medpro-fastapi-portal/nginx.conf`（SPA history 模式支持，反代到后端）
- [ ] 更新 `docker-compose.my.yml`：新增 `portal` service

### 数据库初始化
- [ ] 编写 `sql/simhub_init.sql`
  - SimHub 菜单项（sys_menu 表，parent_id 指向系统管理）
  - SimHub 权限字符串（`simhub:*` 系列）
  - 演示数据（若干条新闻/实验/课程，用于截图展示）
- [ ] 在 `module_simhub` 的 `__init__.py` 中触发 `Base.metadata.create_all` 确认表创建

### 环境变量
- [ ] 门户前端 `.env.production`
  ```
  VITE_API_URL=https://your-domain.com/api
  ```
- [ ] 后端 `.env` 确认 CORS 允许门户域名

---

## 阶段五：文档整理

- [ ] 更新 `README.md`（主项目）— 添加 SimHub 模块说明和快速启动命令
- [ ] 更新 `medpro-fastapi-portal/README.md` — 门户项目使用说明
- [ ] 生成 API 文档（FastAPI 自带 `/docs` SwaggerUI，确认可访问）
- [ ] `docs/ARCHITECTURE.md` — 更新模块架构图（含 module_simhub）
- [ ] 将各 phase 执行计划移入 `docs/exec-plans/completed/`

---

## 闭环验收标准

### 功能完整性
- [ ] 所有角色（游客/学生/教师/管理员）功能闭环验证
- [ ] 跨角色操作隔离验证（学生不能改别人数据，教师不能管理别人课程）

### 部署验证
- [ ] `docker-compose up` 一键启动，三个服务（后端/管理前端/门户）均正常
- [ ] 门户访问 `http://localhost:3100` 正常，SPA 路由刷新不 404
- [ ] 管理后台访问，SimHub 菜单全部可见可用
- [ ] Swagger 文档 `/docs` 可访问，SimHub 路由全部列出

### 性能指标
- [ ] 后端 API P95 响应 < 300ms（本地 DB）
- [ ] 门户首页 FCP < 2s（无外网请求）

---

## 上线检查清单

```
上线前核查：
[ ] 所有密钥/密码已从代码中移除，改为环境变量
[ ] Debug 模式已关闭（FastAPI reload=False）
[ ] 静态文件已压缩（vite build production）
[ ] 数据库备份策略已配置
[ ] 日志级别生产环境设为 WARNING 以上
[ ] CORS 白名单仅包含已知域名
[ ] Rate limiting 已配置（防止接口滥用）
```
