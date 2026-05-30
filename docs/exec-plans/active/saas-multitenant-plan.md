# MedPro SAAS 多租户架构改造计划

**创建时间**: 2026-05-30  
**状态**: 规划中  
**优先级**: 高  

---

## 一、现状分析（As-Is）

### 1.1 系统组成

| 子系统 | 技术栈 | 角色 | 当前问题 |
|--------|--------|------|----------|
| `medpro-fastapi-frontend` | Vue3 + Element Plus | 平台超级管理员后台 | `views/simhub/` 无租户隔离，所有学校数据混在一起 |
| `medpro-fastapi-portal` | React + TailwindCSS | 学校门户 + 校级管理 | `pages/admin/` 全为静态 Mock 数据，未接入 API |
| `medpro-fastapi-backend` | FastAPI + SQLAlchemy | 统一后端 | `vf_*` 所有表无 `tenant_id`，无租户概念 |

### 1.2 数据模型缺陷

- **所有 `vf_*` 表均无学校标识字段**：`vf_course`、`vf_experiment`、`vf_news`、`vf_resource`、`vf_center_info` 等。
- **无租户表**：缺少 `vf_tenant`（学校/机构）主表。
- **用户无学校绑定**：`sys_user` 无 `tenant_id`，无法区分用户所属学校。
- **角色体系不完整**：`simhub_admin` 角色存在，但无对应的数据范围限制逻辑。
- **`vf_center_info` 单条记录**：仅能存储一所学校的配置，不支持多校。

### 1.3 Portal 门户缺陷

- 所有门户 API（`/simhub/portal/*`）无租户参数，返回全局数据。
- 无子域名解析逻辑（无法区分 `pkmu.simhub.com` vs `smu.simhub.com`）。
- 登录后无机构上下文，无法确定加载哪个学校的页面。

---

## 二、目标架构（To-Be）

### 2.1 三层角色体系

```
┌─────────────────────────────────────────────────────────────────┐
│  平台层 (Platform Level)                                         │
│  账户: admin（唯一超级管理员账户，仅此一个）                     │
│  入口: medpro-fastapi-frontend                                   │
│  范围: 管理所有学校租户、平台级课程/实验/资源、系统配置          │
│  特权: 可查看所有学校数据（跨租户视图）                          │
│  说明: admin 是平台唯一超管，tenant_id = NULL                    │
└─────────────────────────────────────────────────────────────────┘
         │ 创建学校管理员账户 + 分配内容
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  学校层 (Tenant Level)                                           │
│  角色: simhub_admin（校级管理员角色，可有多个账户）              │
│  账户举例:                                                       │
│    hzsf_simhub_admin → 杭州师范大学管理员（tenant_id=1）         │
│    pkmu_simhub_admin → 北京医学院管理员（tenant_id=2）           │
│    smu_simhub_admin  → 南方医科大学管理员（tenant_id=3）         │
│  入口: medpro-fastapi-portal/src/app/pages/admin                 │
│  范围: 仅本校数据（由登录账户绑定的 tenant_id 自动决定）         │
│  能力: 管理本校用户/课程/实验/新闻/资源，启用平台分配内容        │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  门户层 (Portal Level)                                           │
│  用户: 学生/教师（各属于某所学校）                               │
│  入口: medpro-fastapi-portal（首页/课程/实验等）                 │
│  租户解析: ① 子域名解析 → ② 登录账户绑定学校                   │
└─────────────────────────────────────────────────────────────────┘
```

> **关键说明**：`simhub_admin` 是**角色名称**，不是账户名称。每所学校由超级管理员 `admin` 创建一个（或多个）拥有该角色的账户，并绑定对应的 `tenant_id`。账户名可按学校命名惯例自定义（如 `hzsf_simhub_admin`）。

### 2.2 数据所有权模型

```
平台内容 (source_type='platform', tenant_id=NULL)
    │
    ├── 分配给学校 (vf_tenant_resource_grant)
    │       └── 学校可见/可用，但无法修改原始内容
    │
    └── 学校自建内容 (source_type='tenant', tenant_id=xxx)
            ├── 学校自己可见和管理
            └── 超级管理员也可查看（跨租户只读视图）
```

---

## 三、数据模型变更（核心）

### 3.1 新增租户主表

```sql
-- vf_tenant：学校/机构租户表
CREATE TABLE vf_tenant (
    tenant_id     BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '租户ID',
    tenant_code   VARCHAR(50)  NOT NULL UNIQUE COMMENT '租户编码（如：pkmu）',
    tenant_name   VARCHAR(200) NOT NULL COMMENT '机构名称（如：北京医学院）',
    subdomain     VARCHAR(100) NULL     COMMENT '子域名前缀（如：pkmu）',
    logo_url      VARCHAR(200) NULL     COMMENT 'Logo URL',
    theme_config  TEXT         NULL     COMMENT '主题配置JSON',
    contact_email VARCHAR(100) NULL     COMMENT '联系邮箱',
    status        CHAR(1)      DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
    create_time   DATETIME     DEFAULT NOW(),
    update_time   DATETIME     ON UPDATE NOW()
) COMMENT '学校/机构租户表';
```

### 3.2 用户-租户绑定

```sql
-- sys_user 新增字段（ALTER 或通过扩展表）
ALTER TABLE sys_user 
    ADD COLUMN tenant_id BIGINT NULL COMMENT '所属租户ID（NULL=平台用户）';

-- 可选：单独绑定表（避免改 sys_user 影响现有代码）
CREATE TABLE vf_user_tenant (
    user_id   BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    PRIMARY KEY (user_id),
    INDEX idx_tenant (tenant_id)
) COMMENT '用户-租户绑定表';
```

**推荐方案**：直接在 `sys_user` 加 `tenant_id` 字段（最简单），各角色区别如下：

| 角色 | 账户示例 | tenant_id | 说明 |
|------|----------|-----------|------|
| `admin` | `admin` | `NULL` | **唯一**超管，平台级，不属于任何学校 |
| `simhub_admin` | `hzsf_simhub_admin` | `1`（杭州师范大学） | 校级管理员，每所学校一个（或多个）账户 |
| `simhub_admin` | `pkmu_simhub_admin` | `2`（北京医学院） | 同角色不同账户，数据互相隔离 |
| `teacher` | 各校教师账户 | `{学校ID}` | 绑定所在学校 |
| `student` | 各校学生账户 | `{学校ID}` | 绑定所在学校 |

**账户创建流程**：超级管理员 `admin` 在 `medpro-fastapi-frontend` 中：
1. 先在学校管理页创建 `vf_tenant` 记录（如：杭州师范大学，tenant_id=1）；
2. 再在用户管理页创建用户（如 `hzsf_simhub_admin`），分配 `simhub_admin` 角色，设置 `tenant_id=1`；
3. 该用户即可用账户登录 Portal 后台，后端自动按 `tenant_id=1` 隔离所有数据。

### 3.3 vf_* 业务表增加租户字段

以下表需添加 `tenant_id` 和 `source_type` 字段：

| 表名 | 变更 |
|------|------|
| `vf_center_info` | 改为多行（每学校一行），添加 `tenant_id` |
| `vf_news` | 添加 `tenant_id`, `source_type` |
| `vf_regulation` | 添加 `tenant_id`, `source_type` |
| `vf_experiment` | 添加 `tenant_id`, `source_type` |
| `vf_experiment_category` | 添加 `tenant_id` |
| `vf_course` | 添加 `tenant_id`, `source_type` |
| `vf_resource` | 添加 `tenant_id`, `source_type` |
| `vf_resource_category` | 添加 `tenant_id` |
| `vf_sim_system` | 添加 `tenant_id`, `source_type` |
| `vf_org_member` | 添加 `tenant_id` |
| `vf_team_member` | 添加 `tenant_id` |

```sql
-- source_type: 'platform'=平台创建，'tenant'=学校创建
-- tenant_id: NULL=平台级内容，非NULL=归属某学校
```

### 3.4 平台内容分配表

```sql
-- 平台将内容授权给学校使用
CREATE TABLE vf_tenant_content_grant (
    grant_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id     BIGINT    NOT NULL COMMENT '被授权学校ID',
    content_type  VARCHAR(20) NOT NULL COMMENT '内容类型(course/experiment/resource/sim_system)',
    content_id    BIGINT    NOT NULL COMMENT '内容ID',
    granted_by    VARCHAR(64) NULL  COMMENT '授权操作者',
    grant_time    DATETIME   DEFAULT NOW(),
    UNIQUE KEY uq_grant (tenant_id, content_type, content_id)
) COMMENT '平台内容授权给学校表';
```

---

## 四、后端改造方案

### 4.1 租户上下文中间件

在每次请求中自动解析当前用户的 `tenant_id`，注入到请求上下文：

```python
# middlewares/tenant_context.py
class TenantContextMiddleware:
    """从 JWT token 中提取 tenant_id，注入 request.state.tenant_id"""
    # admin (tenant_id=NULL) → 平台级，可看所有数据（通过 school_id 参数筛选）
    # simhub_admin (tenant_id=X) → 强制所有查询加 WHERE tenant_id = X
```

### 4.2 服务层改造原则

- **平台视图**（`admin` 角色）：不过滤 `tenant_id`，但可传入 `school_id` 筛选；
- **学校视图**（`simhub_admin` 角色）：所有查询自动追加 `WHERE tenant_id = {current_tenant_id}`；
- **门户视图**（公开/学生/教师）：通过租户解析确定 `tenant_id`，过滤对应学校数据。

### 4.3 新增 API 端点

```
# 租户管理（仅 admin）
GET/POST/PUT/DELETE /simhub/tenant           租户 CRUD
GET /simhub/tenant/{id}/stats                学校统计数据

# 内容授权（仅 admin）  
POST   /simhub/tenant/{id}/grant             分配内容给学校
DELETE /simhub/tenant/{id}/grant/{type}/{cid} 撤销授权
GET    /simhub/tenant/{id}/grants            查看已授权内容

# 门户租户解析
GET /simhub/portal/resolve-tenant?domain=xxx  通过子域名解析租户
GET /simhub/portal/tenant-info               获取当前租户信息（登录后）

# 校级管理员专用（simhub_admin，自动 tenant 隔离）
GET /simhub/school/dashboard                 学校数据概览
GET /simhub/school/users                     本校用户列表
```

### 4.4 现有接口改造

所有 `module_simhub` 服务层方法：
- 增加 `tenant_id: Optional[int]` 参数
- 当 `tenant_id` 有值时，添加 `WHERE tenant_id = :tenant_id`
- 平台内容授权查询：`WHERE (source_type='platform' AND grant exists) OR (tenant_id = :tenant_id)`

---

## 五、前端改造方案

### 5.1 medpro-fastapi-frontend（超级管理员台）

**改造目标**：`views/simhub/` 下所有页面增加学校筛选。

**改造内容**：
1. 在 `views/simhub/` 目录新增 `TenantManagement/`（学校管理页面）；
2. 所有 simhub 子模块页面（course/experiment/news/resource等）顶部增加「学校选择器」下拉框：
   - 默认「全部学校」→ 显示所有数据（包括平台级）；
   - 选中某学校 → 按 `school_id` 筛选该校数据；
3. 新增「内容授权」功能页：将平台内容分配给指定学校；
4. 数据来源标识：列表中增加「来源」列区分 `平台` / `学校自建`。

**改造量评估**：中等，主要是在现有列表页加一个全局 School Selector 组件和修改 API 调用传参。

### 5.2 medpro-fastapi-portal/pages/admin（校级管理台）

**改造目标**：将所有静态页面接入真实 API，并自动以登录用户的 `tenant_id` 隔离数据。

**涉及页面（10个）**：
- `AdminDashboard.tsx` → 对接 `/simhub/school/dashboard`
- `UserManagementPage.tsx` → 对接 `/simhub/school/users`（CRUD）
- `CoursesManagePage.tsx` → 对接 `/simhub/course/list?tenant_scope=mine`
- `ExperimentsManagePage.tsx` → 对接 `/simhub/experiment/list?tenant_scope=mine`
- `ResourcesManagePage.tsx` → 对接 `/simhub/resource/list?tenant_scope=mine`
- `NewsManagePage.tsx` → 对接 `/simhub/news/list`（已有接口改造）
- `RegulationsManagePage.tsx` → 对接 `/simhub/regulation/list`
- `LabIntroManagePage.tsx` → 对接 `/simhub/center/info`（多租户改造后）
- `AppsManagePage.tsx` → 对接 `/simhub/sim-system/list`
- `SettingsPage.tsx` → 对接 `/simhub/school/settings`

**关键依赖**：后端对 `simhub_admin` 角色请求自动追加 `tenant_id` 过滤，前端无需额外传参。

### 5.3 Portal 门户租户解析

**方案一：子域名解析（推荐，长期方案）**
```
pkmu.simhub.xxx.com → tenant_code = 'pkmu'
→ 前端启动时调用 /simhub/portal/resolve-tenant?domain=pkmu
→ 拿到 tenant_id，存入全局 store
→ 所有 portal API 携带 tenant_id 参数
```

**方案二：登录后解析（短期可行方案）**
```
用户登录 → getInfo() 返回 tenant_id/tenant_info
→ 存入 AuthContext/Store
→ Portal 页面加载时读取 tenant_id
→ 门户 API 自动携带 tenant_id
```

**推荐**：两种方案并行实现：
- 有子域名时用方案一（无需登录即可加载学校品牌）；
- 无子域名或登录后用方案二（用户登录绑定学校数据）。

---

## 六、改造成本评估

### 改造量对比

| 模块 | 改造类型 | 估时 | 优先级 |
|------|----------|------|--------|
| 数据库 Schema 变更（新增表+字段） | 新增 | 1天 | P0 |
| 后端租户中间件 + 服务层改造 | 改造 | 3-4天 | P0 |
| 后端租户管理 API | 新增 | 1-2天 | P0 |
| 后端校级管理 API | 新增 | 2天 | P1 |
| 前端 simhub 视图加学校选择器 | 改造（低） | 1天 | P1 |
| Portal admin 页面接入 API（10页） | 改造 | 3-4天 | P1 |
| Portal 租户解析（登录方式） | 新增 | 1天 | P1 |
| Portal 门户页面租户参数传递 | 改造 | 1天 | P2 |
| Portal 子域名解析 | 新增 | 0.5天 | P2 |
| 数据迁移脚本（存量数据加 tenant_id） | 新增 | 0.5天 | P0 |

**总估时：约 14-17 个开发日**

---

## 七、分阶段迭代计划

### Phase A：数据模型基础层（优先级 P0）

**目标**：建立租户数据隔离的基础设施，不破坏现有功能。

**任务**：
- [ ] A1. 新建 `vf_tenant` 表（SQLAlchemy Model + Alembic migration）
- [ ] A2. `sys_user` 新增 `tenant_id` 字段（可空，NULL=平台用户）
- [ ] A3. `vf_*` 所有业务表新增 `tenant_id` (可空) + `source_type` (默认 'platform') 字段
- [ ] A4. 新建 `vf_tenant_content_grant` 授权表
- [ ] A5. 存量数据迁移脚本：将现有数据的 `tenant_id` 设为 NULL，`source_type` 设为 'platform'
- [ ] A6. 在 `vf_tenant` 插入第一条学校数据（测试租户）

**验收**：数据库 Schema 变更完成，服务启动无错误，存量接口行为不变。

---

### Phase B：后端租户服务层（优先级 P0）

**目标**：后端所有 simhub 接口支持租户隔离。

**任务**：
- [ ] B1. 创建租户管理 Controller/Service/DAO（`module_simhub/controller/tenant_controller.py`）
  - CRUD 租户（仅 admin）
  - 获取租户信息
- [ ] B2. 创建租户上下文工具函数（`utils/tenant_util.py`）
  - 从当前用户解析 `tenant_id`
  - 判断是否为平台管理员（`is_platform_admin()`）
  - 判断是否为学校管理员（`is_tenant_admin()`）
- [ ] B3. 改造所有 Service 层的查询方法：
  - 增加 `tenant_id: Optional[int] = None` 参数
  - 若 `tenant_id` 不为 None，WHERE 过滤
  - 查询逻辑：`WHERE tenant_id = :tid OR (source_type='platform' AND grant exists)`
- [ ] B4. 改造所有管理员 Controller，注入租户上下文：
  - `simhub_admin` 角色：自动从 token 获取 `tenant_id` 并过滤
  - `admin` 角色：可接受 `school_id` 查询参数（可选）
- [ ] B5. 改造门户 Controller，支持 `tenant_id` 参数：
  - 新增 `/simhub/portal/resolve-tenant` 接口
  - 所有公开接口支持 `?tenant_id=xxx` 参数
- [ ] B6. 新增学校管理员专用接口：
  - `/simhub/school/dashboard`（学校统计）
  - `/simhub/school/users`（本校用户管理）
  - `/simhub/school/settings`（学校配置）
- [ ] B7. 内容授权接口（平台→学校分配）：
  - `POST /simhub/tenant/{id}/grant`
  - `GET /simhub/tenant/{id}/grants`

**验收**：
- `admin` 无 school_id 参数时返回所有数据，有参数时按学校过滤；
- `simhub_admin` 登录后只能看到本校数据；
- 门户接口传 `tenant_id` 时返回对应学校数据。

---

### Phase C：超级管理台前端改造（优先级 P1）

**目标**：`medpro-fastapi-frontend` 的 `views/simhub/` 支持多校数据查看与管理。

**任务**：
- [ ] C1. 新增 `views/simhub/tenant/` 目录（学校管理页面）：
  - 学校列表（CRUD）
  - 学校详情/配置
- [ ] C2. 全局学校选择器组件（`components/SchoolSelector/`）：
  - 下拉框展示所有租户
  - 选择"全部"或某学校
  - 使用 Pinia store 持久化选择
- [ ] C3. 改造 `views/simhub/course/index.vue` 等所有列表页：
  - 顶部嵌入学校选择器
  - API 调用追加 `school_id` 参数
  - 列表增加「来源学校」列
- [ ] C4. 内容授权页面（新增）：
  - 在课程/实验/资源列表增加「分配给学校」按钮
  - 弹窗选择目标学校并完成授权

**改造量**：低，主要是加参数和加组件，原有代码改动最小。

---

### Phase D：Portal 校级管理页面接入 API（优先级 P1）

**目标**：将 `medpro-fastapi-portal/src/app/pages/admin/` 所有静态 Mock 数据替换为真实 API。

**任务**：
- [ ] D1. 创建 API 封装层 `src/api/school-admin.ts`：
  - 定义 SchoolDashboard、User、Course、Experiment、Resource、News 等接口类型和请求函数
  - 所有请求自动携带当前用户 token（已有 request.ts interceptor 支持）
- [ ] D2. 改造 `AdminDashboard.tsx`：
  - 接入 `/simhub/school/dashboard` 替换 hardcode 统计数据
- [ ] D3. 改造 `UserManagementPage.tsx`：
  - 接入 `/simhub/school/users`（分页、搜索、CRUD）
  - 去除 `mockStudents` 静态数据
- [ ] D4. 改造 `CoursesManagePage.tsx`：
  - 接入 `/simhub/course/list`（含平台授权课程 + 本校课程）
  - 新增/编辑/删除功能接入 API
- [ ] D5. 改造 `ExperimentsManagePage.tsx`：
  - 接入 `/simhub/experiment/list`
- [ ] D6. 改造 `ResourcesManagePage.tsx`：
  - 接入 `/simhub/resource/list`
- [ ] D7. 改造 `NewsManagePage.tsx`：
  - 接入 `/simhub/news` CRUD
- [ ] D8. 改造 `RegulationsManagePage.tsx`：
  - 接入 `/simhub/regulation` CRUD
- [ ] D9. 改造 `LabIntroManagePage.tsx`：
  - 接入 `/simhub/center/info`（按 tenant_id 隔离后的学校信息）
- [ ] D10. 改造 `AppsManagePage.tsx`：
  - 接入 `/simhub/sim-system/list`
- [ ] D11. 改造 `SettingsPage.tsx`：
  - 接入 `/simhub/school/settings`

**关键说明**：`simhub_admin` 登录后，后端自动根据 token 中的 `tenant_id` 过滤数据，前端**无需额外传 tenant_id**。

---

### Phase E：Portal 门户租户感知（优先级 P1~P2）

**目标**：门户网站根据登录账户或子域名确定所属学校，加载对应数据。

**任务**：
- [ ] E1. 扩展 `AuthContext`（`src/stores/auth.tsx`）：
  - `getInfo()` 返回值中包含 `tenant_id`、`tenant_name`、`tenant_code`
  - 新增 `tenantId`、`tenantInfo` 状态到 AuthState
- [ ] E2. 子域名租户解析（`src/lib/tenant.ts`）：
  - 应用启动时检测 `window.location.hostname` 的子域名部分
  - 若存在非顶级域名前缀，调用 `/simhub/portal/resolve-tenant?domain=xxx`
  - 解析到的 `tenant_id` 存入全局 store（优先于登录绑定）
- [ ] E3. 改造门户 API 层（`src/api/portal.ts`）：
  - 所有 portal 请求自动附加 `tenant_id` 参数
  - 封装 `useTenantId()` hook 从 context/subdomain 中读取
- [ ] E4. 门户页面绑定租户数据：
  - `HomePage.tsx` → 加载对应学校的 banner/stats/center_info
  - `LabIntroPage.tsx` → 加载对应学校的中心介绍
  - `NewsPage.tsx` → 加载对应学校的新闻
  - `ExperimentsPage.tsx` → 加载对应学校的实验（含平台授权实验）
  - `CoursesPage.tsx` → 加载对应学校的课程

---

### Phase F：集成测试与权限验证（优先级 P1）

**任务**：
- [ ] F1. 端到端测试：以 `admin` 登录，验证可看所有学校数据；
- [ ] F2. 端到端测试：以 `simhub_admin`（绑定学校A）登录，验证只能看学校A数据；
- [ ] F3. 内容授权测试：admin 将平台课程授权给学校A，验证学校A门户可见；
- [ ] F4. Portal 测试：用子域名访问，验证加载对应学校数据；
- [ ] F5. 权限边界测试：`simhub_admin` 尝试访问其他学校数据 → 403；
- [ ] F6. 教师创建课程测试：教师在 Portal 创建课程，验证超级管理员可见（tenant_id 过滤后可查）。

---

## 八、关键技术决策

### 8.1 租户隔离策略：应用层隔离（推荐）

选择「共享数据库 + 应用层 tenant_id 过滤」而非独立数据库，原因：
- 改造成本最低（无需多数据库路由）
- 现有代码改动最小（只加过滤参数）
- 租户数量相对有限（高校客户）
- 数据量不会因租户增加而爆炸式增长

### 8.2 vf_center_info 改造方案

当前 `vf_center_info` 是单行配置表，需改为多行：
- 添加 `tenant_id` 字段（原有行 tenant_id = NULL，作为平台默认模板）
- 学校在首次配置时从平台模板 copy 一份（或直接新建一行）
- 门户加载时按 tenant_id 查询对应行

### 8.3 simhub_admin 角色与身份验证

`simhub_admin` 是**角色**（`sys_role`），不是账户。多个用户账户可以拥有此角色，每个账户绑定不同的 `tenant_id`，从而实现数据隔离。

Portal admin 路由已有 `ProtectedRoute requiredRole="admin"` 保护，需调整：
- 在 `resolveRole()` 中新增对 `simhub_admin` 角色的识别（返回 `'simhub_admin'`）
- Portal admin 路由改为接受 `role === 'admin' || role === 'simhub_admin'`
- Portal 前端无需区分两种 admin 的 UI，后端自动通过当前用户的 `tenant_id` 控制数据范围
- `admin` 超管若也需访问 Portal admin（如调试），其 `tenant_id=NULL` 时后端不过滤，返回全量数据

---

## 九、文件改动清单

### 后端（medpro-fastapi-backend）

```
module_simhub/
  entity/do/simhub_do.py          ← 所有 vf_* 模型加 tenant_id/source_type
  entity/do/tenant_do.py          ← 新建：VfTenant, VfTenantContentGrant
  entity/vo/tenant_vo.py          ← 新建：租户 VO
  dao/tenant_dao.py               ← 新建
  service/tenant_service.py       ← 新建
  controller/tenant_controller.py ← 新建
  controller/portal_controller.py ← 改造：所有接口加 tenant_id 参数
  controller/course_controller.py ← 改造：加租户过滤
  controller/experiment_controller.py ← 改造
  controller/news_controller.py   ← 改造
  controller/resource_controller.py ← 改造
  controller/center_controller.py ← 改造
  controller/school_controller.py ← 新建：校级管理员专用接口

module_admin/entity/do/user_do.py ← 新增 tenant_id 字段

utils/tenant_util.py              ← 新建：租户上下文工具

alembic/versions/xxx_add_tenant.py ← 新建：迁移脚本
sql/saas-tenant-init.sql          ← 新建：初始化 SQL
```

### 前端 medpro-fastapi-frontend

```
src/views/simhub/tenant/          ← 新建目录：学校管理页面
src/components/SchoolSelector/    ← 新建：全局学校选择器
src/views/simhub/course/index.vue ← 改造：加学校选择器 + school_id 参数
src/views/simhub/experiment/index.vue ← 改造
src/views/simhub/news/index.vue   ← 改造
src/views/simhub/resource/index.vue ← 改造
src/api/simhub/tenant.js          ← 新建：租户管理 API
```

### 前端 medpro-fastapi-portal

```
src/stores/auth.tsx               ← 改造：加 tenantId/tenantInfo
src/lib/tenant.ts                 ← 新建：子域名解析
src/api/school-admin.ts           ← 新建：校级管理 API 封装
src/api/portal.ts                 ← 新建（或改造）：门户 API 封装，自动带 tenant_id
src/app/pages/admin/AdminDashboard.tsx     ← 接入 API
src/app/pages/admin/UserManagementPage.tsx ← 接入 API
src/app/pages/admin/CoursesManagePage.tsx  ← 接入 API
src/app/pages/admin/ExperimentsManagePage.tsx ← 接入 API
src/app/pages/admin/ResourcesManagePage.tsx   ← 接入 API
src/app/pages/admin/NewsManagePage.tsx     ← 接入 API
src/app/pages/admin/RegulationsManagePage.tsx ← 接入 API
src/app/pages/admin/LabIntroManagePage.tsx ← 接入 API
src/app/pages/admin/AppsManagePage.tsx     ← 接入 API
src/app/pages/admin/SettingsPage.tsx       ← 接入 API
src/app/routes.tsx                         ← 改造：admin 路由同时支持 simhub_admin
src/app/pages/HomePage.tsx                 ← 租户参数传递
src/app/pages/LabIntroPage.tsx             ← 租户参数传递
src/app/pages/NewsPage.tsx                 ← 租户参数传递
src/app/pages/ExperimentsPage.tsx          ← 租户参数传递
src/app/pages/CoursesPage.tsx              ← 租户参数传递
```

---

## 十、执行顺序建议

```
Phase A（1天）→ Phase B（4天）→ Phase C（1天）→ Phase D（4天）→ Phase E（2天）→ Phase F（1天）
```

**最小可行版本（MVP，约7天）**：
1. Phase A（Schema）
2. Phase B 部分（B1~B5，租户 CRUD + 过滤逻辑）
3. Phase D 部分（D1~D3，Dashboard + 用户管理接入 API）
4. Phase E 的 E1（登录后 tenantInfo 返回）

MVP 完成后即可验证多租户核心流程，其余页面接入 API 属于重复性工作可并行推进。
