# Phase 1 执行计划 — 后端 SimHub 模块

**状态**：✅ 全部完成，闭环验收通过  
**目标**：实现 module_simhub 后端模块，包含16张数据表和59个 API端点

## 任务清单

- [x] 创建目录结构（module_simhub/controller|dao|service|entity/do|vo）
- [x] entity/do — 16张表的 SQLAlchemy 模型（vf_ 前缀）
- [x] entity/vo — Pydantic VO 模型（请求/响应），7个 VO 文件
- [x] dao — 数据库访问层，7个 DAO 文件
- [x] service — 业务逻辑层，7个 Service 文件
- [x] controller — 8个 Controller（自动注册，59条路由已验证）
- [x] **闭环验收**：初始化 SQL 数据（菜单项、权限字符串、SimHub角色）
- [x] **闭环验收**：接口联调测试（Postman/pytest，覆盖主要端点）
- [x] **闭环验收**：数据库表创建验证（vf_* 16张表）

## 已验证里程碑

- ✅ `auto_register_routers` 扫描到 59 条 SimHub 路由
- ✅ 所有 16 个 DB 模型成功导入（module_simhub 全模块 import OK）
- ✅ 后端启动无报错
- ✅ vf_* 16 张表已在数据库中创建（`SHOW TABLES LIKE 'vf_%'` 返回 16 条）
- ✅ SQL 初始化数据已执行（`sql/simhub-init.sql`）：
  - SimHub 目录菜单 1 条 + 7 个二级菜单 + 29 个功能按钮（共 37 条）
  - SimHub管理员角色（role_id=102）创建完成
  - 角色-菜单关联：admin(102)=37条、teacher(100)=13条、student(101)=10条
  - 样例数据：1 条中心简介 / 7 个实验分类 / 1 条新闻 / 1 个实验 / 1 门课程
- ✅ 接口联调 pytest 测试 33/33 全通过（`medpro-fastapi-test/simhub/test_simhub_api.py`）
- ✅ 顺带修复 3 处后端 bug：
  - `RegulationService` 缺失 `get_regulation_list / get_regulation_detail / add_regulation / edit_regulation / delete_regulation` 方法别名
  - `CenterService.update_center_info` 返回 `VfCenterInfo` 而非 `CrudResponseModel`（controller 调用 `.message` 报错）

## API 端点设计

### 公开端口（无需登录）
- GET /simhub/portal/center — 获取中心介绍
- GET /simhub/portal/news — 新闻列表（分页）
- GET /simhub/portal/news/{id} — 新闻详情
- GET /simhub/portal/regulation — 规章制度列表
- GET /simhub/portal/regulation/{id} — 制度详情
- GET /simhub/portal/experiment/list — 实验列表
- GET /simhub/portal/experiment/{id} — 实验详情
- GET /simhub/portal/course/list — 课程列表
- GET /simhub/portal/course/{id} — 课程详情
- GET /simhub/portal/resource/list — 资源列表
- GET /simhub/portal/category — 实验分类树

### 认证用户端口
- POST /simhub/experiment/{id}/participate — 记录参与
- GET /simhub/course/enrolled — 我的课程
- POST /simhub/course/{id}/enroll — 选课
- GET /simhub/learning/progress — 学习进度
- PUT /simhub/learning/progress — 更新进度
- GET /simhub/profile/student — 学生信息
- PUT /simhub/profile/student — 更新学生信息
- GET /simhub/profile/teacher — 教师信息
- PUT /simhub/profile/teacher — 更新教师信息

### 教师端口
- GET /simhub/teacher/dashboard — 教师工作台
- GET /simhub/teacher/course/list — 我的课程管理
- POST /simhub/teacher/course — 创建课程
- PUT /simhub/teacher/course/{id} — 编辑课程
- GET /simhub/teacher/course/{id}/sections — 获取章节
- POST/PUT/DELETE /simhub/teacher/section — 章节管理

### 管理员管理端口
- CRUD /simhub/center — 中心介绍管理
- CRUD /simhub/news — 新闻管理
- CRUD /simhub/regulation — 规章制度管理
- CRUD /simhub/experiment — 实验项目管理
- CRUD /simhub/category — 实验分类管理
- CRUD /simhub/course — 课程管理
- CRUD /simhub/section — 章节管理
- CRUD /simhub/resource — 资源管理
