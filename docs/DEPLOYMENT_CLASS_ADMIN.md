# SimHub 行政班级管理功能 - 部署说明

## 功能概述

行政班级管理功能为 SimHub 虚拟仿真实验教学平台提供完整的班级和学生管理能力，包括：

- ✅ 学年学期配置管理
- ✅ 行政班级 CRUD 操作
- ✅ 班级学生管理（添加、批量添加、删除）
- ✅ 关联部门信息和学年学期
- ✅ 完整的前后端实现

## 部署步骤

### 1. 数据库初始化

按顺序执行以下 SQL 文件：

```bash
# 1. 创建表结构
mysql -u root -p medpro < medpro-fastapi-backend/sql/simhub_class_admin.sql

# 2. 添加菜单权限
mysql -u root -p medpro < medpro-fastapi-backend/sql/simhub_class_admin_menu.sql
```

**注意事项：**
- 如果 `vf_student_profile` 表需要添加 `class_id` 字段，请手动执行 SQL 中注释的 ALTER TABLE 语句
- 执行菜单 SQL 前，请确认 `sys_menu` 表中 menu_id 2010 及 2100-2104 未被占用

### 2. 后端部署

后端代码已完整实现，无需额外配置。重启后端服务即可：

```bash
cd medpro-fastapi-backend
./medpro.sh restart
# 或
python server.py
```

**新增文件列表：**
- `module_simhub/entity/do/simhub_do.py` - 添加了 VfTermConfig, VfClassAdmin, VfClassStudent 模型
- `module_simhub/entity/vo/class_admin_vo.py` - 视图对象定义
- `module_simhub/dao/class_admin_dao.py` - 数据访问层
- `module_simhub/service/class_admin_service.py` - 业务逻辑层
- `module_simhub/controller/class_admin_controller.py` - API 控制器

### 3. 前端部署

前端代码已完整实现，无需额外配置。清除浏览器缓存后刷新即可：

```bash
# 如果需要重新构建（开发环境无需执行）
cd medpro-fastapi-frontend
npm run build
```

**新增文件列表：**
- `src/api/simhub/class_admin.js` - API 接口定义
- `src/views/simhub/class-admin/index.vue` - 班级管理主页面

### 4. 权限配置

执行菜单 SQL 后，会自动为以下角色授予权限：
- `admin` (role_id=1) - 完整权限
- `simhub_admin` (role_id=102) - 完整权限

如需为其他角色授权，请在「系统管理 → 角色管理」中手动配置。

## 功能使用

### 访问入口

登录后台系统后，在左侧菜单找到：
```
SimHub管理 → 行政班级管理
```

### 主要功能

#### 1. 学年学期配置

点击页面上方的「学期配置」按钮，可以：
- 查看所有学年学期
- 新增学年学期
- 修改学年学期信息
- 设置当前学期
- 删除学年学期

**字段说明：**
- 学年学期名称：如 "2025-2026学年第1学期"
- 学期编码：如 "202501"（便于程序识别）
- 学年：如 "2025-2026"
- 学期：第一学期/第二学期
- 当前学期：用于标识正在进行的学期

#### 2. 行政班级管理

主列表页面提供：
- 班级查询（支持按班级名称、编号、院系、学期、年级等条件筛选）
- 新增班级
- 修改班级信息
- 删除班级
- 查看班级学生

**班级信息字段：**
- 基本信息：班级名称、班级编号、年级、专业
- 归属信息：所属院系、学年学期
- 管理信息：班主任姓名、联系电话
- 统计信息：学生人数（自动统计）

#### 3. 学生管理

点击班级列表中的「学生」按钮或学生人数链接，进入学生管理界面：

**功能：**
- 添加学生：单个添加学生到班级
- 批量添加：一次性添加多个学生
- 移除学生：从班级中移除学生
- 查看学生信息：学号、姓名、职务、状态等

**学生状态：**
- 0 = 在读
- 1 = 休学
- 2 = 退学
- 3 = 毕业

## 数据库表结构

### vf_term_config - 学年学期配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| term_id | BIGINT | 学期ID（主键） |
| term_name | VARCHAR(100) | 学年学期名称 |
| term_code | VARCHAR(50) | 学期编码 |
| school_year | VARCHAR(20) | 学年 |
| semester | CHAR(1) | 学期（1/2） |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| is_current | CHAR(1) | 是否当前学期 |
| status | CHAR(1) | 状态 |

### vf_class_admin - 行政班级表

| 字段 | 类型 | 说明 |
|------|------|------|
| class_id | BIGINT | 班级ID（主键） |
| class_name | VARCHAR(100) | 班级名称 |
| class_code | VARCHAR(50) | 班级编号 |
| dept_id | BIGINT | 所属院系ID（外键） |
| dept_name | VARCHAR(100) | 所属院系名称（冗余） |
| term_id | BIGINT | 所属学年学期ID（外键） |
| term_name | VARCHAR(100) | 学年学期名称（冗余） |
| major | VARCHAR(100) | 专业 |
| grade | VARCHAR(20) | 年级 |
| head_teacher | VARCHAR(100) | 班主任姓名 |
| head_teacher_phone | VARCHAR(20) | 班主任电话 |
| student_count | INT | 学生人数 |
| status | CHAR(1) | 状态 |

### vf_class_student - 班级学生关联表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | ID（主键） |
| class_id | BIGINT | 班级ID |
| user_id | BIGINT | 学生用户ID |
| student_no | VARCHAR(30) | 学号（冗余） |
| student_name | VARCHAR(100) | 学生姓名（冗余） |
| join_date | DATE | 加入日期 |
| is_monitor | CHAR(1) | 是否班长 |
| position | VARCHAR(50) | 班级职务 |
| status | CHAR(1) | 状态（0-3） |

## API 接口清单

### 学年学期配置

- `GET /simhub/class-admin/term/list` - 获取学年学期列表
- `GET /simhub/class-admin/term/{termId}` - 获取学年学期详情
- `GET /simhub/class-admin/term/options` - 获取学年学期选项（下拉框用）
- `POST /simhub/class-admin/term` - 新增学年学期
- `PUT /simhub/class-admin/term` - 修改学年学期
- `DELETE /simhub/class-admin/term/{termIds}` - 删除学年学期

### 行政班级管理

- `GET /simhub/class-admin/list` - 获取班级列表
- `GET /simhub/class-admin/{classId}` - 获取班级详情
- `GET /simhub/class-admin/options` - 获取班级选项（下拉框用）
- `POST /simhub/class-admin` - 新增班级
- `PUT /simhub/class-admin` - 修改班级
- `DELETE /simhub/class-admin/{classIds}` - 删除班级

### 班级学生管理

- `GET /simhub/class-admin/student/list` - 获取班级学生列表
- `POST /simhub/class-admin/student` - 添加班级学生
- `POST /simhub/class-admin/student/batch` - 批量添加班级学生
- `DELETE /simhub/class-admin/student/{ids}` - 删除班级学生

## 权限标识

```
simhub:classAdmin:list   - 查询
simhub:classAdmin:query  - 详情
simhub:classAdmin:add    - 新增
simhub:classAdmin:edit   - 修改
simhub:classAdmin:remove - 删除
```

## 注意事项

1. **学生人数统计**：当添加或移除学生时，班级表的 `student_count` 字段会自动更新
2. **冗余字段**：`dept_name` 和 `term_name` 是冗余字段，便于查询展示，修改时会同步更新
3. **学期唯一性**：同一时间只能有一个学期标记为"当前学期"
4. **软删除**：班级和学期采用软删除机制（del_flag='2'），数据不会真正删除

## 扩展建议

如需进一步完善功能，可考虑：

1. **学生选择器**：实现用户选择组件，支持从系统用户中选择学生
2. **Excel 导入导出**：支持批量导入班级和学生数据
3. **班级统计**：增加班级统计报表功能
4. **班级公告**：为每个班级添加公告功能
5. **学生档案**：关联 `vf_student_profile` 表，完善学生信息
6. **课程关联**：支持为班级批量分配课程

## 技术栈

- **后端**：FastAPI + SQLAlchemy + MySQL
- **前端**：Vue 3 + Element Plus + Pinia
- **数据表**：遵循 RuoYi 框架规范

## 问题排查

如遇到问题，请检查：

1. ✅ 数据库表是否创建成功
2. ✅ 菜单权限是否正确配置
3. ✅ 后端服务是否正常启动
4. ✅ 浏览器控制台是否有报错
5. ✅ 角色是否被授予相应权限

查看后端日志：
```bash
tail -f medpro-fastapi-backend/logs/medpro.log
```

---

**部署完成后，请在系统中测试以下流程：**
1. 配置学年学期
2. 创建行政班级
3. 添加学生到班级
4. 查看和管理班级信息

祝使用愉快！ 🎉
