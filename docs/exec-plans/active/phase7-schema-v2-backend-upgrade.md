# Phase 7 执行计划 — 数据库 Schema v2 后端升级

**状态**：🚧 待执行  
**优先级**：P0（前置依赖，Phase 8 依赖本阶段完成）  
**目标**：将后端 `module_simhub` 模块升级至数据库 Schema v2，新增4张业务表，扩展6张现有表字段，补充对应的 DAO/Service/Controller 层实现  
**预估工作量**：4~5 天

---

## 背景与变更范围

Schema v1（现状）共 33 张表；Schema v2 新增至 39 张表。  
本阶段仅涉及 `vf_*` 前缀的 SimHub 模块，系统管理模块（`sys_*`）和 AI 模块（`ai_*`）**不变动**。

### 新增表（4张）

| 表名 | 说明 |
|---|---|
| `vf_sim_system` | 实验系统信息表 |
| `vf_sim_system_image` | 实验系统图集关系表 |
| `vf_question` | 习题信息表 |
| `vf_section_question` | 课程章节与习题关联表 |

### 字段扩展表（6张）

| 表名 | 新增字段 | 说明 |
|---|---|---|
| `vf_experiment` | `sim_system_id`, `exp_duration`, `exp_guide` | 关联系统、实验时长、HTML指导书 |
| `vf_course` | `course_category` | 课程分类枚举（理论/实验/理实一体化） |
| `vf_course` | `status` 值域调整 | 0=新建 1=已审核 2=已发布（原0=发布,1=草稿） |
| `vf_course_section` | `status`, `create_time`, `update_time` | 章节状态与时间戳 |
| `vf_course_section` | `description` 类型升级 | `VARCHAR(500)` → `TEXT` |
| `vf_resource` | `resource_content`, `file_format` | 内容正文、文件格式 |
| `vf_resource` | `resource_type` 枚举值调整 | 调整为 courseware/lesson_plan/micro_video/ebook/extension |
| `vf_section_resource` | `course_id`, `status`, `create_time`, `update_time` | 冗余课程ID + 状态时间戳 |
| `vf_section_experiment` | `course_id`, `status`, `create_time`, `update_time` | 冗余课程ID + 状态时间戳 |

---

## 子任务清单

### 任务 7-1：数据库迁移脚本

> **路径**：`medpro-fastapi-backend/alembic/versions/` 或 `sql/` 目录

- [ ] **7-1-1** 编写 Alembic migration 脚本（或手工 SQL），完成以下 DDL：
  - 新建 `vf_sim_system` 表
  - 新建 `vf_sim_system_image` 表
  - 新建 `vf_question` 表
  - 新建`vf_section_question` 表
  - `ALTER TABLE vf_experiment ADD COLUMN sim_system_id BIGINT NULL, ADD COLUMN exp_duration INT NULL DEFAULT 0, ADD COLUMN exp_guide MEDIUMTEXT NULL`
  - `ALTER TABLE vf_course ADD COLUMN course_category CHAR(1) NULL DEFAULT '1'`（同时需 data migration: 原 status=1草稿→0新建，status=0发布→2已发布）
  - `ALTER TABLE vf_course_section ADD COLUMN status CHAR(1) NULL DEFAULT '0', ADD COLUMN create_time DATETIME NULL, ADD COLUMN update_time DATETIME NULL, MODIFY COLUMN description TEXT NULL`
  - `ALTER TABLE vf_resource ADD COLUMN resource_content TEXT NULL, ADD COLUMN file_format VARCHAR(20) NULL DEFAULT ''`（同时需 data migration: resource_type 值映射）
  - `ALTER TABLE vf_section_resource ADD COLUMN course_id BIGINT NULL, ADD COLUMN status CHAR(1) NULL DEFAULT '0', ADD COLUMN create_time DATETIME NULL, ADD COLUMN update_time DATETIME NULL`
  - `ALTER TABLE vf_section_experiment ADD COLUMN course_id BIGINT NULL, ADD COLUMN status CHAR(1) NULL DEFAULT '0', ADD COLUMN create_time DATETIME NULL, ADD COLUMN update_time DATETIME NULL`
- [ ] **7-1-2** 编写 `sql/schema-v2-upgrade.sql`（纯 SQL 版，供非 Alembic 环境使用）
- [ ] **7-1-3** 编写数据迁移脚本（`sql/data-migration-v2.sql`）：
  - `vf_course.status` 值域转换：`UPDATE vf_course SET status='2' WHERE status='0'`; `UPDATE vf_course SET status='0' WHERE status='1'`
  - `vf_resource.resource_type` 值域映射：doc→courseware, video→micro_video, pdf→ebook（按业务实际情况调整）
  - `vf_section_resource.course_id` 反填：`UPDATE vf_section_resource sr JOIN vf_course_section cs ON sr.section_id=cs.section_id SET sr.course_id=cs.course_id`
  - `vf_section_experiment.course_id` 反填：同上逻辑

**验收标准**：在开发数据库执行完整脚本后，`SHOW TABLES LIKE 'vf_%'` 返回 20 条；`DESCRIBE vf_experiment` 包含 `sim_system_id/exp_duration/exp_guide`。

---

### 任务 7-2：SQLAlchemy 模型更新（entity/do）

> **文件**：`medpro-fastapi-backend/module_simhub/entity/do/simhub_do.py`

- [ ] **7-2-1** 新增 `VfSimSystem` 模型（对应 `vf_sim_system` 表）：
  ```python
  class VfSimSystem(Base):
      __tablename__ = 'vf_sim_system'
      sim_system_id, system_name, system_detail, cover_image,
      hw_recommend, hw_support, sys_category, view_count,
      status, del_flag, create_by, create_time, update_by, update_time
  ```
- [ ] **7-2-2** 新增 `VfSimSystemImage` 模型（对应 `vf_sim_system_image` 表）：
  ```python
  class VfSimSystemImage(Base):
      __tablename__ = 'vf_sim_system_image'
      image_id, sim_system_id, image_url, sort_order, status,
      create_time, update_time
  ```
- [ ] **7-2-3** 新增 `VfQuestion` 模型（对应 `vf_question` 表）：
  ```python
  class VfQuestion(Base):
      __tablename__ = 'vf_question'
      question_id, question_name, stem, options, question_type,
      answer, explanation, difficulty, status, del_flag,
      create_by, create_time, update_by, update_time
  ```
- [ ] **7-2-4** 新增 `VfSectionQuestion` 模型（对应 `vf_section_question` 表）：
  ```python
  class VfSectionQuestion(Base):
      __tablename__ = 'vf_section_question'
      id, section_id, course_id, question_id, sort_order,
      status, create_time, update_time
  ```
- [ ] **7-2-5** 扩展 `VfExperiment` 模型：追加 `sim_system_id`、`exp_duration`（Integer）、`exp_guide`（Text/MediumText）字段
- [ ] **7-2-6** 扩展 `VfCourse` 模型：追加 `course_category`（CHAR(1)）字段；更新 `status` 注释
- [ ] **7-2-7** 扩展 `VfCourseSection` 模型：追加 `status`（CHAR(1)）、`create_time`（DateTime）、`update_time`（DateTime）字段；`description` 改为 `Text` 类型
- [ ] **7-2-8** 扩展 `VfResource` 模型：追加 `resource_content`（Text）、`file_format`（String(20)）字段；更新 `resource_type` 注释
- [ ] **7-2-9** 扩展 `VfSectionResource` 模型：追加 `course_id`（BigInteger）、`status`（CHAR(1)）、`create_time`（DateTime）、`update_time`（DateTime）字段
- [ ] **7-2-10** 扩展 `VfSectionExperiment` 模型：追加 `course_id`（BigInteger）、`status`（CHAR(1)）、`create_time`（DateTime）、`update_time`（DateTime）字段

**验收标准**：`python -c "from module_simhub.entity.do.simhub_do import *; print('OK')"` 无报错，共导出 20 个模型类。

---

### 任务 7-3：Pydantic VO 模型更新（entity/vo）

> **路径**：`medpro-fastapi-backend/module_simhub/entity/vo/`

- [ ] **7-3-1** 新建 `sim_system_vo.py`：
  - `SimSystemModel`：完整字段 Pydantic 模型
  - `SimSystemPageQueryModel`：分页查询参数（keyword, sys_category, status, pageNum, pageSize）
  - `SimSystemCreateModel`：创建请求体（system_name, system_detail, cover_image, hw_recommend, hw_support, sys_category, status）
  - `SimSystemUpdateModel`：更新请求体（同上 + sim_system_id）
  - `SimSystemImageModel`：图集记录模型
  - `SimSystemWithImagesModel`：系统详情 + 图集列表（关联查询响应）
- [ ] **7-3-2** 新建 `question_vo.py`：
  - `QuestionModel`：完整字段 Pydantic 模型
  - `QuestionPageQueryModel`：分页查询（keyword, question_type, difficulty, status, pageNum, pageSize）
  - `QuestionCreateModel`：创建请求体
  - `QuestionUpdateModel`：更新请求体
  - `SectionQuestionModel`：章节-习题关联记录
  - `SectionQuestionBindModel`：章节绑定习题请求体（section_id, course_id, question_ids: list[int]）
- [ ] **7-3-3** 更新 `experiment_vo.py`：在 `ExperimentModel`/`ExperimentCreateModel`/`ExperimentUpdateModel` 中追加 `sim_system_id`、`exp_duration`、`exp_guide` 字段
- [ ] **7-3-4** 更新 `course_vo.py`：在 `CourseModel`/`CourseCreateModel`/`CourseUpdateModel` 中追加 `course_category` 字段；调整 status 枚举说明
- [ ] **7-3-5** 更新 `resource_vo.py`：追加 `resource_content`、`file_format` 字段；调整 `resource_type` 枚举范围

**验收标准**：所有 VO 模型 import 无报错；新字段 JSON 序列化正确。

---

### 任务 7-4：DAO 层更新

> **路径**：`medpro-fastapi-backend/module_simhub/dao/`

- [ ] **7-4-1** 新建 `sim_system_dao.py`：
  - `get_sim_system_list(db, query: SimSystemPageQueryModel)` — 分页查询（支持 keyword/sys_category/status 过滤）
  - `get_sim_system_detail(db, sim_system_id)` — 单条详情
  - `get_sim_system_with_images(db, sim_system_id)` — 详情 + 图集列表（JOIN 或分两步查询）
  - `add_sim_system(db, model: SimSystemCreateModel, operator)` — 新增
  - `edit_sim_system(db, model: SimSystemUpdateModel, operator)` — 修改
  - `delete_sim_system(db, sim_system_ids: list[int])` — 批量软删除（del_flag='2'）
  - `get_sim_system_images(db, sim_system_id)` — 获取图集列表
  - `add_sim_system_image(db, sim_system_id, image_url, sort_order)` — 新增图片
  - `delete_sim_system_images(db, sim_system_id)` — 清空图集
  - `batch_save_images(db, sim_system_id, images: list)` — 批量保存图集
- [ ] **7-4-2** 新建 `question_dao.py`：
  - `get_question_list(db, query: QuestionPageQueryModel)` — 分页查询
  - `get_question_detail(db, question_id)` — 单条详情
  - `add_question(db, model: QuestionCreateModel, operator)` — 新增
  - `edit_question(db, model: QuestionUpdateModel, operator)` — 修改
  - `delete_question(db, question_ids: list[int])` — 批量软删除
  - `get_section_questions(db, section_id)` — 获取章节已绑定习题列表
  - `bind_section_questions(db, section_id, course_id, question_ids: list[int])` — 绑定习题（先清空再插入）
  - `unbind_section_question(db, section_id, question_id)` — 解绑单条习题
- [ ] **7-4-3** 更新 `experiment_dao.py`：在查询/新增/编辑方法中包含 `sim_system_id`、`exp_duration`、`exp_guide` 字段
- [ ] **7-4-4** 更新 `course_dao.py`：在查询/新增/编辑方法中包含 `course_category` 字段
- [ ] **7-4-5** 更新 `resource_dao.py`：在查询/新增/编辑方法中包含 `resource_content`、`file_format` 字段

**验收标准**：DAO 函数可被 Service 层调用，无 import 错误；对实际 DB 执行基础 CRUD 验证通过。

---

### 任务 7-5：Service 层更新

> **路径**：`medpro-fastapi-backend/module_simhub/service/`

- [ ] **7-5-1** 新建 `sim_system_service.py`：
  - `get_sim_system_list_services(query, db, current_user)` — 列表服务
  - `get_sim_system_detail_service(sim_system_id, db)` — 详情服务（含图集）
  - `add_sim_system_service(sim_system, images, db, current_user)` — 创建服务（事务：新增主记录 + 批量保存图集）
  - `edit_sim_system_service(sim_system, images, db, current_user)` — 更新服务（事务：更新主记录 + 清空/重建图集）
  - `delete_sim_system_service(sim_system_ids, db, current_user)` — 删除服务（软删除）
- [ ] **7-5-2** 新建 `question_service.py`：
  - `get_question_list_service(query, db, current_user)` — 列表服务
  - `get_question_detail_service(question_id, db)` — 详情服务
  - `add_question_service(question, db, current_user)` — 创建服务
  - `edit_question_service(question, db, current_user)` — 更新服务
  - `delete_question_service(question_ids, db, current_user)` — 删除服务
  - `get_section_questions_service(section_id, db)` — 获取章节习题
  - `bind_section_questions_service(bind_model, db, current_user)` — 绑定章节习题
- [ ] **7-5-3** 更新 `experiment_service.py`：透传新字段至 DAO 层
- [ ] **7-5-4** 更新 `course_service.py`：透传 `course_category` 至 DAO 层
- [ ] **7-5-5** 更新 `resource_service.py`：透传新字段至 DAO 层

**验收标准**：所有 Service 函数调用链完整，无属性错误。

---

### 任务 7-6：Controller 层新增

> **路径**：`medpro-fastapi-backend/module_simhub/controller/`

- [ ] **7-6-1** 新建 `sim_system_controller.py`，注册路由前缀 `/simhub/sim-system`：
  ```
  GET    /simhub/sim-system/list                    — 分页列表
  GET    /simhub/sim-system/{sim_system_id}          — 详情（含图集）
  POST   /simhub/sim-system                         — 新增（含图集）
  PUT    /simhub/sim-system                         — 修改（含图集）
  DELETE /simhub/sim-system/{sim_system_ids}        — 批量删除
  GET    /simhub/sim-system/{sim_system_id}/images  — 获取图集
  POST   /simhub/sim-system/{sim_system_id}/images  — 更新图集
  GET    /simhub/portal/sim-system/list             — 公开列表（无需登录）
  GET    /simhub/portal/sim-system/{id}             — 公开详情
  ```
- [ ] **7-6-2** 新建 `question_controller.py`，注册路由前缀 `/simhub/question`：
  ```
  GET    /simhub/question/list                      — 习题分页列表
  GET    /simhub/question/{question_id}             — 习题详情
  POST   /simhub/question                          — 新增习题
  PUT    /simhub/question                          — 修改习题
  DELETE /simhub/question/{question_ids}           — 批量删除
  GET    /simhub/question/section/{section_id}     — 获取章节绑定的习题
  POST   /simhub/question/section/bind             — 章节绑定习题（批量）
  DELETE /simhub/question/section/{section_id}/{question_id} — 章节解绑单题
  ```
- [ ] **7-6-3** 验证 `auto_register_routers` 可自动扫描并注册以上两个新 controller

**路由设计说明**：
- 管理端路由（需鉴权）：`/simhub/sim-system/`、`/simhub/question/`
- 门户端公开路由（无需鉴权）：`/simhub/portal/sim-system/`

**验收标准**：新增路由在 FastAPI 启动日志或 `/docs` Swagger 中可见；基础 CRUD 接口可用 curl/Swagger 测试通过。

---

### 任务 7-7：初始化 SQL 数据更新

> **文件**：`medpro-fastapi-backend/sql/simhub-init.sql` 或新建 `sql/simhub-v2-init.sql`

- [ ] **7-7-1** 新增菜单项（sys_menu）：
  - 实验系统管理（一级菜单 SimHub 下的子菜单）：路由 `/simhub/sim-system`，组件 `simhub/sim-system/index`
    - 功能按钮：查询、新增、修改、删除、图集管理
  - 习题管理（子菜单）：路由 `/simhub/question`，组件 `simhub/question/index`
    - 功能按钮：查询、新增、修改、删除
- [ ] **7-7-2** 为 SimHub管理员角色（role_id=102）追加以上新菜单权限关联
- [ ] **7-7-3** 新增字典项（sys_dict_type + sys_dict_data）：
  - 字典类型 `vf_course_category`：理论课(1)/实验课(2)/理实一体化课(3)
  - 字典类型 `vf_course_status`：新建(0)/已审核(1)/已发布(2)
  - 字典类型 `vf_resource_type`：课件(courseware)/教案(lesson_plan)/微课视频(micro_video)/电子书(ebook)/拓展资源(extension)
  - 字典类型 `vf_question_type`：单选题(single)/多选题(multiple)/填空题(fill)/问答题(essay)
  - 字典类型 `vf_hw_support`：头盔(helmet)/PC电脑(pc)/zSpace(zspace)

**验收标准**：执行 SQL 后，管理后台菜单管理页可看到新增菜单项；字典管理页可看到新字典类型。

---

### 任务 7-8：接口测试更新

> **路径**：`medpro-fastapi-test/simhub/`

- [ ] **7-8-1** 更新 `test_simhub_api.py`：追加对新字段的断言（实验详情包含 `sim_system_id`、课程详情包含 `course_category`）
- [ ] **7-8-2** 新建 `test_sim_system_api.py`：测试实验系统 CRUD 9 个接口
- [ ] **7-8-3** 新建 `test_question_api.py`：测试习题 CRUD + 章节绑定 8 个接口

**验收标准**：`pytest medpro-fastapi-test/simhub/ -v` 全部通过（含新增测试用例）。

---

## 执行顺序

```
7-1（DB迁移）→ 7-2（模型）→ 7-3（VO）→ 7-4（DAO）→ 7-5（Service）→ 7-6（Controller）→ 7-7（初始化SQL）→ 7-8（测试）
```

## 风险与注意事项

| 风险点 | 影响 | 缓解措施 |
|---|---|---|
| `vf_course.status` 值域反转 | 存量数据全部错误 | 严格先执行数据迁移 SQL，再修改代码 |
| `vf_resource.resource_type` 枚举映射不完整 | 老数据类型变为脏数据 | 迁移前备份，迁移 SQL 覆盖所有旧值 |
| `VfResource` 去掉 `course_id`/`section_id` 直接外键 | 需更新相关查询逻辑 | DAO 层查询改为走关联表 |
| 新增 Controller 未被 auto_register 扫描 | 路由 404 | 确认文件命名符合约定（`*_controller.py`）且在正确目录 |
| `exp_guide` 字段使用 MEDIUMTEXT | MySQL/PG 兼容性 | MySQL 用 `MEDIUMTEXT`，PostgreSQL 统一用 `TEXT` |

## 闭环验收标准

- [ ] `SHOW TABLES LIKE 'vf_%'` 返回 20 条记录
- [ ] 后端启动无报错，路由数量从 59 增至 **≥76**（新增 ≥17 条）
- [ ] 所有新增 API 在 `/docs` 可见并可测试
- [ ] pytest 测试全绿（含新增用例）
- [ ] 管理后台菜单中可见"实验系统管理"和"习题管理"两个新子菜单
