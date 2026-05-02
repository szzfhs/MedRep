# MedPro 数据库表结构 Schema

> 生成日期：2026-04-22（v2.0 融合业务数据表优化版）  
> 上次版本：2026-04-07（v1.0 初始版）  
> 数据库：MySQL / PostgreSQL（双数据库支持）  
> ORM：SQLAlchemy（FastAPI 后端）
>
> **v2.0 主要变更**：融合课程管理、资源管理、实验系统、习题库业务需求；  
> SimHub 模块新增 4 张表（vf_sim_system / vf_sim_system_image / vf_question / vf_section_question），  
> 并对 6 张既有表进行字段扩展优化（详见[模块统计](#模块统计)）。

---

## 目录

- [一、系统管理模块（sys\_\*）](#一系统管理模块-sys_)
  - [sys_user — 用户信息表](#sys_user--用户信息表)
  - [sys_user_role — 用户角色关联表](#sys_user_role--用户角色关联表)
  - [sys_user_post — 用户岗位关联表](#sys_user_post--用户岗位关联表)
  - [sys_role — 角色信息表](#sys_role--角色信息表)
  - [sys_role_menu — 角色菜单关联表](#sys_role_menu--角色菜单关联表)
  - [sys_role_dept — 角色部门关联表](#sys_role_dept--角色部门关联表)
  - [sys_menu — 菜单权限表](#sys_menu--菜单权限表)
  - [sys_dept — 部门表](#sys_dept--部门表)
  - [sys_post — 岗位信息表](#sys_post--岗位信息表)
  - [sys_dict_type — 字典类型表](#sys_dict_type--字典类型表)
  - [sys_dict_data — 字典数据表](#sys_dict_data--字典数据表)
  - [sys_config — 参数配置表](#sys_config--参数配置表)
  - [sys_notice — 通知公告表](#sys_notice--通知公告表)
  - [sys_logininfor — 系统访问记录](#sys_logininfor--系统访问记录)
  - [sys_oper_log — 操作日志记录](#sys_oper_log--操作日志记录)
  - [sys_job — 定时任务调度表](#sys_job--定时任务调度表)
  - [sys_job_log — 定时任务日志表](#sys_job_log--定时任务日志表)
- [二、AI 模块（ai\_\*）](#二ai-模块-ai_)
  - [ai_models — AI 模型表](#ai_models--ai-模型表)
  - [ai_chat_config — AI 对话配置表](#ai_chat_config--ai-对话配置表)
- [三、SimHub 虚拟仿真实验平台（vf\_\*）](#三simhub-虚拟仿真实验平台-vf_)
  - [vf_center_info — 实验中心信息表](#vf_center_info--实验中心信息表)
  - [vf_news — 新闻动态表](#vf_news--新闻动态表)
  - [vf_regulation — 规章制度表](#vf_regulation--规章制度表)
  - [vf_experiment_category — 实验分类表](#vf_experiment_category--实验分类表)
  - [vf_sim_system — 实验系统信息表 🆕](#vf_sim_system--实验系统信息表)
  - [vf_sim_system_image — 实验系统图集表 🆕](#vf_sim_system_image--实验系统图集表)
  - [vf_experiment — 实验项目信息表（扩展）](#vf_experiment--实验项目信息表)
  - [vf_experiment_participation — 实验参与记录表](#vf_experiment_participation--实验参与记录表)
  - [vf_course — 课程信息表（扩展）](#vf_course--课程信息表)
  - [vf_course_section — 课程章节信息表（扩展）](#vf_course_section--课程章节信息表)
  - [vf_course_enrollment — 选课记录表](#vf_course_enrollment--选课记录表)
  - [vf_learning_progress — 学习进度表](#vf_learning_progress--学习进度表)
  - [vf_resource_category — 资源分类表](#vf_resource_category--资源分类表)
  - [vf_resource — 教学资源信息表（扩展）](#vf_resource--教学资源信息表)
  - [vf_section_experiment — 章节-实验项目关联表（扩展）](#vf_section_experiment--章节实验项目关联表)
  - [vf_section_resource — 章节-资源关联表（扩展）](#vf_section_resource--章节资源关联表)
  - [vf_question — 习题信息表 🆕](#vf_question--习题信息表)
  - [vf_section_question — 章节-习题关联表 🆕](#vf_section_question--章节习题关联表)
  - [vf_student_profile — 学生扩展信息表](#vf_student_profile--学生扩展信息表)
  - [vf_teacher_profile — 教师扩展信息表](#vf_teacher_profile--教师扩展信息表)
- [四、表关系总览（ER 图说明）](#四表关系总览er-图说明)

---

## 一、系统管理模块（sys\_\*）

### sys_user — 用户信息表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| user_id | BIGINT | NOT NULL | AUTO_INCREMENT | 用户ID（主键） |
| dept_id | BIGINT | NULL | NULL | 所属部门ID（FK → sys_dept） |
| user_name | VARCHAR(30) | NOT NULL | — | 用户账号 |
| nick_name | VARCHAR(30) | NOT NULL | — | 用户昵称 |
| user_type | VARCHAR(2) | NULL | '00' | 用户类型（00=系统用户） |
| email | VARCHAR(50) | NULL | '' | 用户邮箱 |
| phonenumber | VARCHAR(11) | NULL | '' | 手机号码 |
| sex | CHAR(1) | NULL | '0' | 性别（0=男 1=女 2=未知） |
| avatar | VARCHAR(100) | NULL | '' | 头像地址 |
| password | VARCHAR(100) | NULL | '' | 密码（哈希） |
| status | CHAR(1) | NULL | '0' | 账号状态（0=正常 1=停用） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=存在 2=删除） |
| login_ip | VARCHAR(128) | NULL | '' | 最后登录IP |
| login_date | DATETIME | NULL | — | 最后登录时间 |
| pwd_update_date | DATETIME | NULL | — | 密码最后更新时间 |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | NULL | 备注 |

---

### sys_user_role — 用户角色关联表

| 字段名 | 类型 | 可空 | 说明 |
|---|---|---|---|
| user_id | BIGINT | NOT NULL | 用户ID（联合主键，FK → sys_user） |
| role_id | BIGINT | NOT NULL | 角色ID（联合主键，FK → sys_role） |

---

### sys_user_post — 用户岗位关联表

| 字段名 | 类型 | 可空 | 说明 |
|---|---|---|---|
| user_id | BIGINT | NOT NULL | 用户ID（联合主键，FK → sys_user） |
| post_id | BIGINT | NOT NULL | 岗位ID（联合主键，FK → sys_post） |

---

### sys_role — 角色信息表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| role_id | BIGINT | NOT NULL | AUTO_INCREMENT | 角色ID（主键） |
| role_name | VARCHAR(30) | NOT NULL | — | 角色名称 |
| role_key | VARCHAR(100) | NOT NULL | — | 角色权限字符串 |
| role_sort | INT | NOT NULL | — | 显示顺序 |
| data_scope | CHAR(1) | NULL | '1' | 数据范围（1=全部 2=自定 3=本部门 4=本部门及以下） |
| menu_check_strictly | TINYINT/SMALLINT | NULL | 1 | 菜单树是否关联显示 |
| dept_check_strictly | TINYINT/SMALLINT | NULL | 1 | 部门树是否关联显示 |
| status | CHAR(1) | NOT NULL | — | 状态（0=正常 1=停用） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志 |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | NULL | 备注 |

---

### sys_role_menu — 角色菜单关联表

| 字段名 | 类型 | 可空 | 说明 |
|---|---|---|---|
| role_id | BIGINT | NOT NULL | 角色ID（联合主键，FK → sys_role） |
| menu_id | BIGINT | NOT NULL | 菜单ID（联合主键，FK → sys_menu） |

---

### sys_role_dept — 角色部门关联表

| 字段名 | 类型 | 可空 | 说明 |
|---|---|---|---|
| role_id | BIGINT | NOT NULL | 角色ID（联合主键，FK → sys_role） |
| dept_id | BIGINT | NOT NULL | 部门ID（联合主键，FK → sys_dept） |

---

### sys_menu — 菜单权限表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| menu_id | BIGINT | NOT NULL | AUTO_INCREMENT | 菜单ID（主键） |
| menu_name | VARCHAR(50) | NOT NULL | — | 菜单名称 |
| parent_id | BIGINT | NULL | 0 | 父菜单ID（0=顶级） |
| order_num | INT | — | 0 | 显示顺序 |
| path | VARCHAR(200) | NULL | '' | 路由地址 |
| component | VARCHAR(255) | NULL | NULL | 组件路径 |
| query | VARCHAR(255) | NULL | NULL | 路由参数 |
| route_name | VARCHAR(50) | NULL | '' | 路由名称 |
| is_frame | INT | NULL | 1 | 是否外链（0=是 1=否） |
| is_cache | INT | NULL | 0 | 是否缓存（0=缓存 1=不缓存） |
| menu_type | CHAR(1) | NULL | '' | 类型（M=目录 C=菜单 F=按钮） |
| visible | CHAR(1) | NULL | '0' | 显示状态（0=显示 1=隐藏） |
| status | CHAR(1) | NULL | '0' | 菜单状态（0=正常 1=停用） |
| perms | VARCHAR(100) | NULL | NULL | 权限标识 |
| icon | VARCHAR(100) | NULL | '#' | 菜单图标 |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | '' | 备注 |

---

### sys_dept — 部门表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| dept_id | BIGINT | NOT NULL | AUTO_INCREMENT | 部门ID（主键） |
| parent_id | BIGINT | — | 0 | 父部门ID（0=顶级） |
| ancestors | VARCHAR(50) | NULL | '' | 祖级列表（逗号分隔） |
| dept_name | VARCHAR(30) | NULL | '' | 部门名称 |
| order_num | INT | — | 0 | 显示顺序 |
| leader | VARCHAR(20) | NULL | NULL | 负责人 |
| phone | VARCHAR(11) | NULL | NULL | 联系电话 |
| email | VARCHAR(50) | NULL | NULL | 邮箱 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=存在 2=删除） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |

---

### sys_post — 岗位信息表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| post_id | BIGINT | NOT NULL | AUTO_INCREMENT | 岗位ID（主键） |
| post_code | VARCHAR(64) | NOT NULL | — | 岗位编码 |
| post_name | VARCHAR(50) | NOT NULL | — | 岗位名称 |
| post_sort | INT | NOT NULL | — | 显示顺序 |
| status | CHAR(1) | NOT NULL | — | 状态（0=正常 1=停用） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | NULL | 备注 |

---

### sys_dict_type — 字典类型表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| dict_id | BIGINT | NOT NULL | AUTO_INCREMENT | 字典主键 |
| dict_name | VARCHAR(100) | NULL | '' | 字典名称 |
| dict_type | VARCHAR(100) | NULL（唯一） | '' | 字典类型（唯一键） |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | NULL | 备注 |

---

### sys_dict_data — 字典数据表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| dict_code | BIGINT | NOT NULL | AUTO_INCREMENT | 字典编码（主键） |
| dict_sort | INT | NULL | 0 | 字典排序 |
| dict_label | VARCHAR(100) | NULL | '' | 字典标签 |
| dict_value | VARCHAR(100) | NULL | '' | 字典键值 |
| dict_type | VARCHAR(100) | NULL | '' | 字典类型（FK → sys_dict_type.dict_type） |
| css_class | VARCHAR(100) | NULL | NULL | 样式属性 |
| list_class | VARCHAR(100) | NULL | NULL | 表格回显样式 |
| is_default | CHAR(1) | NULL | 'N' | 是否默认（Y=是 N=否） |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | NULL | 备注 |

---

### sys_config — 参数配置表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| config_id | INT | NOT NULL | AUTO_INCREMENT | 参数主键 |
| config_name | VARCHAR(100) | NULL | '' | 参数名称 |
| config_key | VARCHAR(100) | NULL | '' | 参数键名 |
| config_value | VARCHAR(500) | NULL | '' | 参数键值 |
| config_type | CHAR(1) | NULL | 'N' | 系统内置（Y=是 N=否） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | NULL | 备注 |

---

### sys_notice — 通知公告表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| notice_id | INT | NOT NULL | AUTO_INCREMENT | 公告ID（主键） |
| notice_title | VARCHAR(50) | NOT NULL | — | 公告标题 |
| notice_type | CHAR(1) | NOT NULL | — | 类型（1=通知 2=公告） |
| notice_content | LONGBLOB / BYTEA | NULL | NULL | 公告内容（富文本） |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=关闭） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(255) | NULL | NULL | 备注 |

---

### sys_logininfor — 系统访问记录

索引：`idx_sys_logininfor_s(status)`, `idx_sys_logininfor_lt(login_time)`

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| info_id | BIGINT | NOT NULL | AUTO_INCREMENT | 访问ID（主键） |
| user_name | VARCHAR(50) | NULL | '' | 用户账号 |
| ipaddr | VARCHAR(128) | NULL | '' | 登录IP地址 |
| login_location | VARCHAR(255) | NULL | '' | 登录地点 |
| browser | VARCHAR(50) | NULL | '' | 浏览器类型 |
| os | VARCHAR(50) | NULL | '' | 操作系统 |
| status | CHAR(1) | NULL | '0' | 登录状态（0=成功 1=失败） |
| msg | VARCHAR(255) | NULL | '' | 提示消息 |
| login_time | DATETIME | NULL | NOW() | 访问时间 |

---

### sys_oper_log — 操作日志记录

索引：`idx_sys_oper_log_bt(business_type)`, `idx_sys_oper_log_s(status)`, `idx_sys_oper_log_ot(oper_time)`

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| oper_id | BIGINT | NOT NULL | AUTO_INCREMENT | 日志主键 |
| title | VARCHAR(50) | NULL | '' | 模块标题 |
| business_type | INT | NULL | 0 | 业务类型（0=其它 1=新增 2=修改 3=删除） |
| method | VARCHAR(100) | NULL | '' | 方法名称 |
| request_method | VARCHAR(10) | NULL | '' | 请求方式 |
| operator_type | INT | NULL | 0 | 操作类别（0=其它 1=后台 2=手机端） |
| oper_name | VARCHAR(50) | NULL | '' | 操作人员 |
| dept_name | VARCHAR(50) | NULL | '' | 部门名称 |
| oper_url | VARCHAR(255) | NULL | '' | 请求URL |
| oper_ip | VARCHAR(128) | NULL | '' | 主机地址 |
| oper_location | VARCHAR(255) | NULL | '' | 操作地点 |
| oper_param | VARCHAR(2000) | NULL | '' | 请求参数 |
| json_result | VARCHAR(2000) | NULL | '' | 返回参数 |
| status | INT | NULL | 0 | 操作状态（0=正常 1=异常） |
| error_msg | VARCHAR(2000) | NULL | '' | 错误消息 |
| oper_time | DATETIME | NULL | NOW() | 操作时间 |
| cost_time | BIGINT | NULL | 0 | 消耗时间（ms） |

---

### sys_job — 定时任务调度表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| job_id | BIGINT | NOT NULL | AUTO_INCREMENT | 任务ID（联合主键之一） |
| job_name | VARCHAR(64) | NOT NULL | '' | 任务名称（联合主键之一） |
| job_group | VARCHAR(64) | NOT NULL | 'default' | 任务组名（联合主键之一） |
| job_executor | VARCHAR(64) | NULL | 'default' | 任务执行器 |
| invoke_target | VARCHAR(500) | NOT NULL | — | 调用目标字符串 |
| job_args | VARCHAR(255) | NULL | '' | 位置参数 |
| job_kwargs | VARCHAR(255) | NULL | '' | 关键字参数 |
| cron_expression | VARCHAR(255) | NULL | '' | cron 表达式 |
| misfire_policy | VARCHAR(20) | NULL | '3' | 错误执行策略（1=立即 2=一次 3=放弃） |
| concurrent | CHAR(1) | NULL | '1' | 是否并发（0=允许 1=禁止） |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=暂停） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | '' | 备注 |

---

### sys_job_log — 定时任务调度日志表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| job_log_id | BIGINT | NOT NULL | AUTO_INCREMENT | 任务日志ID（主键） |
| job_name | VARCHAR(64) | NOT NULL | — | 任务名称 |
| job_group | VARCHAR(64) | NOT NULL | — | 任务组名 |
| job_executor | VARCHAR(64) | NOT NULL | — | 任务执行器 |
| invoke_target | VARCHAR(500) | NOT NULL | — | 调用目标字符串 |
| job_args | VARCHAR(255) | NULL | '' | 位置参数 |
| job_kwargs | VARCHAR(255) | NULL | '' | 关键字参数 |
| job_trigger | VARCHAR(255) | NULL | '' | 任务触发器 |
| job_message | VARCHAR(500) | NULL | — | 日志信息 |
| status | CHAR(1) | NULL | '0' | 执行状态（0=正常 1=失败） |
| exception_info | VARCHAR(2000) | NULL | '' | 异常信息 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |

---

## 二、AI 模块（ai\_\*）

### ai_models — AI 模型表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| model_id | BIGINT | NOT NULL | AUTO_INCREMENT | 模型主键 |
| model_code | VARCHAR(100) | NOT NULL | — | 模型编码 |
| model_name | VARCHAR(100) | NULL | NULL | 模型名称 |
| provider | VARCHAR(50) | NOT NULL | — | 提供商（如 openai、anthropic） |
| model_sort | INT | NOT NULL | — | 显示顺序 |
| api_key | VARCHAR(255) | NULL | NULL | API Key |
| base_url | VARCHAR(255) | NULL | NULL | Base URL |
| model_type | VARCHAR(50) | NULL | NULL | 模型类型 |
| max_tokens | INT | NULL | — | 最大输出 token 数 |
| temperature | FLOAT | NULL | — | 默认温度 |
| support_reasoning | CHAR(1) | — | 'N' | 是否支持推理（Y/N） |
| support_images | CHAR(1) | — | 'N' | 是否支持图片（Y/N） |
| status | CHAR(1) | — | '0' | 模型状态 |
| user_id | BIGINT | NULL | — | 关联用户ID |
| dept_id | BIGINT | NULL | — | 关联部门ID |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |
| remark | VARCHAR(500) | NULL | NULL | 备注 |

---

### ai_chat_config — AI 对话配置表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| chat_config_id | BIGINT | NOT NULL | AUTO_INCREMENT | 配置主键 |
| user_id | BIGINT | NOT NULL（唯一） | — | 用户ID（FK → sys_user，唯一键） |
| temperature | FLOAT | NULL | — | 默认温度 |
| add_history_to_context | CHAR(1) | — | '0' | 是否添加历史记录（0=是 1=否） |
| num_history_runs | INT | NULL | — | 历史记录条数 |
| system_prompt | TEXT | NULL | — | 系统提示词 |
| metrics_default_visible | CHAR(1) | — | '0' | 默认显示指标（0=是 1=否） |
| vision_enabled | CHAR(1) | — | '1' | 是否开启视觉（0=是 1=否） |
| image_max_size_mb | INT | NULL | — | 图片最大大小（MB） |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_time | DATETIME | NULL | NOW() | 更新时间 |

---

## 三、SimHub 虚拟仿真实验平台（vf\_\*）

### vf_center_info — 实验中心信息表

> 单条记录设计，存储整个实验中心的基本信息。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| id | BIGINT | NOT NULL | AUTO_INCREMENT | 主键 |
| center_name | VARCHAR(100) | NULL | '虚拟仿真实验中心' | 中心名称 |
| center_slogan | VARCHAR(200) | NULL | '' | 宣传语 |
| description | TEXT | NULL | — | 详细介绍（富文本） |
| logo_url | VARCHAR(200) | NULL | '' | Logo 图片 URL |
| banner_url | VARCHAR(200) | NULL | '' | 首页 Banner 图 URL |
| org_structure | TEXT | NULL | — | 组织架构（富文本） |
| team_intro | TEXT | NULL | — | 团队介绍（富文本） |
| contact_info | VARCHAR(500) | NULL | '' | 联系方式 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新时间（ON UPDATE） |

---

### vf_news — 新闻动态表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| news_id | BIGINT | NOT NULL | AUTO_INCREMENT | 新闻ID（主键） |
| title | VARCHAR(200) | NOT NULL | — | 标题 |
| summary | VARCHAR(500) | NULL | NULL | 摘要 |
| content | TEXT | NULL | — | 正文（富文本） |
| cover_image | VARCHAR(200) | NULL | '' | 封面图 URL |
| author | VARCHAR(50) | NULL | '' | 作者 |
| status | CHAR(1) | NULL | '0' | 状态（0=草稿 1=已发布） |
| view_count | INT | NULL | 0 | 浏览次数 |
| publish_time | DATETIME | NULL | — | 发布时间 |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新时间（ON UPDATE） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=正常 2=删除） |

---

### vf_regulation — 规章制度表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| reg_id | BIGINT | NOT NULL | AUTO_INCREMENT | 制度ID（主键） |
| title | VARCHAR(200) | NOT NULL | — | 标题 |
| content | TEXT | NULL | — | 正文（富文本） |
| attachment_url | VARCHAR(200) | NULL | '' | 附件 URL |
| category | VARCHAR(50) | NULL | '' | 类别 |
| sort_order | INT | NULL | 0 | 排序 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| create_by | VARCHAR(64) | NULL | '' | 创建者 |
| create_time | DATETIME | NULL | NOW() | 创建时间 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新时间（ON UPDATE） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志 |

---

### vf_experiment_category — 实验分类表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| category_id | BIGINT | NOT NULL | AUTO_INCREMENT | 分类ID（主键） |
| category_name | VARCHAR(100) | NOT NULL | — | 分类名称 |
| parent_id | BIGINT | NULL | 0 | 父分类ID（0=根节点） |
| icon | VARCHAR(100) | NULL | '' | 图标 |
| sort_order | INT | NULL | 0 | 排序 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |

---

### vf_sim_system — 实验系统信息表

> 🆕 新增表。管理各类虚拟仿真实验系统（如 VR 头盔、zSpace、PC 端等），作为实验项目的技术载体。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| sim_system_id | BIGINT | NOT NULL | AUTO_INCREMENT | 实验系统ID（主键） |
| system_name | VARCHAR(200) | NOT NULL | — | 系统名称 |
| system_detail | TEXT | NULL | — | 系统详情（富文本） |
| cover_image | VARCHAR(200) | NULL | '' | 系统封面图 URL |
| hw_recommend | VARCHAR(500) | NULL | '' | 推荐硬件配置描述 |
| hw_support | VARCHAR(100) | NULL | '' | 支持的硬件设备（逗号分隔：helmet=头盔，pc=PC电脑，zspace=zSpace，...） |
| sys_category | VARCHAR(100) | NULL | '' | 系统分类 |
| view_count | INT | NULL | 0 | 查看次数 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=存在 2=删除） |
| create_by | VARCHAR(64) | NULL | '' | 创建人 |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |

---

### vf_sim_system_image — 实验系统图集表

> 🆕 新增表。存储实验系统的图片集合，支持一个系统关联多张图片。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| image_id | BIGINT | NOT NULL | AUTO_INCREMENT | 图片ID（主键） |
| sim_system_id | BIGINT | NOT NULL | — | 实验系统ID（FK → vf_sim_system） |
| image_url | VARCHAR(500) | NOT NULL | — | 图片 URL |
| sort_order | INT | NULL | 0 | 排序 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |

---

### vf_experiment — 实验项目信息表

> 扩展字段：新增 `sim_system_id`（关联实验系统）、`exp_duration`（实验时长）、`exp_guide`（实验指导书）。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| exp_id | BIGINT | NOT NULL | AUTO_INCREMENT | 实验项目ID（主键） |
| exp_name | VARCHAR(200) | NOT NULL | — | 实验项目名称 |
| category_id | BIGINT | NULL | NULL | 分类ID（FK → vf_experiment_category） |
| sim_system_id | BIGINT | NULL | NULL | 🆕 关联实验系统ID（FK → vf_sim_system） |
| cover_image | VARCHAR(200) | NULL | '' | 实验项目封面图 URL |
| description | TEXT | NULL | — | 实验项目简介（富文本） |
| exp_duration | INT | NULL | 0 | 🆕 实验时长（分钟） |
| exp_guide | MEDIUMTEXT | NULL | — | 🆕 实验指导书（HTML图文内容） |
| exp_type | VARCHAR(10) | NULL | 'web' | 启动类型（web/exe） |
| launch_url | VARCHAR(500) | NULL | '' | 启动地址 |
| env_requirements | TEXT | NULL | — | 环境要求 |
| software_requirements | TEXT | NULL | — | 软件要求 |
| attachments | TEXT | NULL | — | 附件 JSON 数组 |
| tags | VARCHAR(200) | NULL | '' | 标签（逗号分隔） |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| view_count | INT | NULL | 0 | 查看次数 |
| participate_count | INT | NULL | 0 | 参与人数 |
| sort_order | INT | NULL | 0 | 排序 |
| create_by | VARCHAR(64) | NULL | '' | 创建人 |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=存在 2=删除） |

---

### vf_experiment_participation — 实验参与记录表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| participation_id | BIGINT | NOT NULL | AUTO_INCREMENT | 参与ID（主键） |
| user_id | BIGINT | NOT NULL | — | 用户ID（FK → sys_user） |
| exp_id | BIGINT | NOT NULL | — | 实验ID（FK → vf_experiment） |
| start_time | DATETIME | NULL | NOW() | 开始时间 |
| end_time | DATETIME | NULL | — | 结束时间 |
| duration_seconds | INT | NULL | 0 | 持续秒数 |
| status | VARCHAR(10) | NULL | 'started' | 状态（started/completed） |

---

### vf_course — 课程信息表

> 扩展字段：新增 `course_category`（课程分类枚举）；`status` 字段值调整为三态（新建/已审核/已发布）。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| course_id | BIGINT | NOT NULL | AUTO_INCREMENT | 课程ID（主键） |
| course_name | VARCHAR(200) | NOT NULL | — | 课程名称 |
| teacher_id | BIGINT | NULL | NULL | 主讲教师ID（FK → sys_user） |
| cover_image | VARCHAR(200) | NULL | '' | 课程封面图 URL |
| description | TEXT | NULL | — | 课程简介（富文本） |
| course_category | CHAR(1) | NULL | '1' | 🆕 课程分类（1=理论课 2=实验课 3=理实一体化课） |
| status | CHAR(1) | NULL | '0' | 课程状态（0=新建 1=已审核 2=已发布） |
| total_sections | INT | NULL | 0 | 章节总数（冗余统计） |
| total_resources | INT | NULL | 0 | 资源总数（冗余统计） |
| enroll_count | INT | NULL | 0 | 选课人数（冗余统计） |
| sort_order | INT | NULL | 0 | 排序 |
| create_by | VARCHAR(64) | NULL | '' | 创建人 |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=存在 2=删除） |

---

### vf_course_section — 课程章节信息表

> 扩展字段：新增 `status`（章节状态）；`description` 扩展为 TEXT 类型以支持较长简介。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| section_id | BIGINT | NOT NULL | AUTO_INCREMENT | 章节ID（主键） |
| course_id | BIGINT | NOT NULL | — | 课程ID（FK → vf_course） |
| parent_id | BIGINT | NULL | 0 | 父章节ID（0=一级章/章；>0=节） |
| title | VARCHAR(200) | NOT NULL | — | 章节名称 |
| description | TEXT | NULL | — | 章节简介 |
| sort_order | INT | NULL | 0 | 排序 |
| section_type | VARCHAR(10) | NULL | 'section' | 类型（chapter=章 / section=节） |
| status | CHAR(1) | NULL | '0' | 🆕 状态（0=正常 1=停用） |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |

---

### vf_course_enrollment — 选课记录表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| enrollment_id | BIGINT | NOT NULL | AUTO_INCREMENT | 选课ID（主键） |
| user_id | BIGINT | NOT NULL | — | 用户ID（FK → sys_user） |
| course_id | BIGINT | NOT NULL | — | 课程ID（FK → vf_course） |
| enroll_time | DATETIME | NULL | NOW() | 选课时间 |
| status | CHAR(1) | NULL | '0' | 状态（0=学习中 1=已完成） |

---

### vf_learning_progress — 学习进度表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| progress_id | BIGINT | NOT NULL | AUTO_INCREMENT | 进度ID（主键） |
| user_id | BIGINT | NOT NULL | — | 用户ID（FK → sys_user） |
| course_id | BIGINT | NOT NULL | — | 课程ID（FK → vf_course） |
| section_id | BIGINT | NOT NULL | — | 章节ID（FK → vf_course_section） |
| resource_id | BIGINT | NULL | NULL | 资源ID（FK → vf_resource） |
| last_position | INT | NULL | 0 | 上次播放位置（秒） |
| completed | CHAR(1) | NULL | '0' | 是否完成（0=否 1=是） |
| update_time | DATETIME | NULL | NOW() | 更新时间（ON UPDATE） |

---

### vf_resource_category — 资源分类表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| category_id | BIGINT | NOT NULL | AUTO_INCREMENT | 分类ID（主键） |
| category_name | VARCHAR(100) | NOT NULL | — | 分类名称 |
| parent_id | BIGINT | NULL | 0 | 父分类ID（0=根节点） |
| sort_order | INT | NULL | 0 | 排序 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |

---

### vf_resource — 教学资源信息表

> 扩展字段：新增 `resource_content`（资源内容描述）、`file_format`（文件格式类型）；`resource_type` 调整为业务枚举值（courseware/lesson_plan/micro_video/ebook/extension）。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| resource_id | BIGINT | NOT NULL | AUTO_INCREMENT | 资源ID（主键） |
| resource_name | VARCHAR(200) | NOT NULL | — | 资源名称 |
| resource_content | TEXT | NULL | — | 🆕 资源内容描述（摘要/正文） |
| file_format | VARCHAR(20) | NULL | '' | 🆕 文件格式类型（pdf/mp4/docx/pptx/epub 等） |
| resource_type | VARCHAR(20) | NULL | 'courseware' | 资源类型（courseware=课件/lesson_plan=教案/micro_video=微课视频/ebook=电子书/extension=拓展资源） |
| file_url | VARCHAR(500) | NULL | '' | 资源URL |
| cover_image | VARCHAR(200) | NULL | '' | 资源封面图 URL |
| file_size | BIGINT | NULL | 0 | 文件大小（字节） |
| duration | INT | NULL | 0 | 时长（秒，视频/音频适用） |
| category_id | BIGINT | NULL | NULL | 资源分类ID（FK → vf_resource_category） |
| allow_download | CHAR(1) | NULL | '0' | 允许下载（0=是 1=否） |
| download_count | INT | NULL | 0 | 下载次数 |
| view_count | INT | NULL | 0 | 查看次数 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| create_by | VARCHAR(64) | NULL | '' | 创建人 |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=存在 2=删除） |

---

### vf_section_experiment — 章节-实验项目关联表

> 扩展字段：新增 `course_id`（冗余课程ID方便查询）、`create_time`、`update_time`、`status`。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| id | BIGINT | NOT NULL | AUTO_INCREMENT | 主键 |
| section_id | BIGINT | NOT NULL | — | 章节ID（FK → vf_course_section） |
| course_id | BIGINT | NOT NULL | — | 🆕 课程ID（FK → vf_course，冗余加速查询） |
| exp_id | BIGINT | NOT NULL | — | 实验项目ID（FK → vf_experiment） |
| sort_order | INT | NULL | 0 | 排序 |
| status | CHAR(1) | NULL | '0' | 🆕 状态（0=正常 1=停用） |
| create_time | DATETIME | NULL | NOW() | 🆕 创建日期 |
| update_time | DATETIME | NULL | — | 🆕 更新日期（ON UPDATE） |

---

### vf_section_resource — 章节-资源关联表

> 扩展字段：新增 `course_id`（冗余课程ID方便查询）、`create_time`、`update_time`、`status`。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| id | BIGINT | NOT NULL | AUTO_INCREMENT | 主键 |
| section_id | BIGINT | NOT NULL | — | 章节ID（FK → vf_course_section） |
| course_id | BIGINT | NOT NULL | — | 🆕 课程ID（FK → vf_course，冗余加速查询） |
| resource_id | BIGINT | NOT NULL | — | 资源ID（FK → vf_resource） |
| sort_order | INT | NULL | 0 | 排序 |
| status | CHAR(1) | NULL | '0' | 🆕 状态（0=正常 1=停用） |
| create_time | DATETIME | NULL | NOW() | 🆕 创建日期 |
| update_time | DATETIME | NULL | — | 🆕 更新日期（ON UPDATE） |

---

### vf_question — 习题信息表

> 🆕 新增表。管理课程相关的习题库，支持多种题型，通过章节-习题关联表与章节绑定。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| question_id | BIGINT | NOT NULL | AUTO_INCREMENT | 习题ID（主键） |
| question_name | VARCHAR(200) | NULL | '' | 习题名称（标题） |
| stem | TEXT | NOT NULL | — | 题干内容（富文本） |
| options | TEXT | NULL | — | 选项 JSON 数组（如：[{"key":"A","content":"..."},...]，填空/问答题为 NULL） |
| question_type | VARCHAR(20) | NOT NULL | 'single' | 习题类型（single=单选题/multiple=多选题/fill=填空题/essay=问答题） |
| answer | TEXT | NULL | — | 正确答案（单/多选为选项key逗号分隔，填空/问答为文本） |
| explanation | TEXT | NULL | — | 答案释义/解析 |
| difficulty | TINYINT | NULL | 1 | 难度等级（1=易 2=中 3=难） |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| del_flag | CHAR(1) | NULL | '0' | 删除标志（0=存在 2=删除） |
| create_by | VARCHAR(64) | NULL | '' | 创建人 |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_by | VARCHAR(64) | NULL | '' | 更新者 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |

---

### vf_section_question — 章节-习题关联表

> 🆕 新增表。维护课程章节与习题的多对多关系，一道习题可关联多个章节。

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| id | BIGINT | NOT NULL | AUTO_INCREMENT | 主键 |
| section_id | BIGINT | NOT NULL | — | 章节ID（FK → vf_course_section） |
| course_id | BIGINT | NOT NULL | — | 课程ID（FK → vf_course，冗余加速查询） |
| question_id | BIGINT | NOT NULL | — | 习题ID（FK → vf_question） |
| sort_order | INT | NULL | 0 | 排序 |
| status | CHAR(1) | NULL | '0' | 状态（0=正常 1=停用） |
| create_time | DATETIME | NULL | NOW() | 创建日期 |
| update_time | DATETIME | NULL | — | 更新日期（ON UPDATE） |

---

### vf_student_profile — 学生扩展信息表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| profile_id | BIGINT | NOT NULL | AUTO_INCREMENT | 主键 |
| user_id | BIGINT | NOT NULL（唯一） | — | 用户ID（FK → sys_user，唯一键） |
| student_no | VARCHAR(30) | NULL | '' | 学号 |
| class_name | VARCHAR(100) | NULL | '' | 班级 |
| major | VARCHAR(100) | NULL | '' | 专业 |
| college | VARCHAR(100) | NULL | '' | 学院 |
| grade | VARCHAR(20) | NULL | '' | 年级 |
| enroll_year | INT | NULL | — | 入学年份 |

---

### vf_teacher_profile — 教师扩展信息表

| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|
| profile_id | BIGINT | NOT NULL | AUTO_INCREMENT | 主键 |
| user_id | BIGINT | NOT NULL（唯一） | — | 用户ID（FK → sys_user，唯一键） |
| teacher_no | VARCHAR(30) | NULL | '' | 工号 |
| college | VARCHAR(100) | NULL | '' | 学院 |
| department | VARCHAR(100) | NULL | '' | 系部/教研室 |
| title | VARCHAR(50) | NULL | '' | 职称 |
| introduction | TEXT | NULL | — | 简介 |
| avatar_url | VARCHAR(200) | NULL | '' | 头像 URL |

---

## 四、表关系总览（ER 图说明）

```
┌──────────────────────────────────────────────────────────────┐
│                    系统管理核心关系                              │
│                                                              │
│  sys_dept ◄─────── sys_user ───────────────────────────┐    │
│     ▲                  │                                │    │
│     │          sys_user_role  sys_user_post             │    │
│     │                  │           │                    │    │
│  sys_role_dept      sys_role    sys_post                │    │
│     │                  │                                │    │
│  sys_role ──── sys_role_menu ──► sys_menu               │    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│               SimHub 实验系统与实验项目关系                      │
│                                                              │
│  vf_sim_system ────────────────────────────────────────┐    │
│       │                                                │    │
│  vf_sim_system_image (1:N)                             │    │
│                                                        │    │
│  vf_experiment ◄── vf_experiment_category              │    │
│       │         └── sim_system_id ──────────────────────    │
│       │                                                     │
│  vf_experiment_participation ──► sys_user                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  SimHub 课程学习关系                            │
│                                                              │
│  sys_user                                                    │
│     ├── vf_student_profile (1:1)                            │
│     ├── vf_teacher_profile (1:1)                            │
│     ├── vf_course_enrollment ──► vf_course (N:N)            │
│     └── vf_learning_progress ──► vf_course / section / res  │
│                                                              │
│  vf_course (course_category: 理论/实验/理实一体化)             │
│       │    (status: 新建/已审核/已发布)                        │
│       ├── teacher_id ──► sys_user                           │
│       └── vf_course_section (1:N, 支持多级章节)              │
│                 ├── vf_section_resource ──► vf_resource     │
│                 ├── vf_section_experiment ──► vf_experiment │
│                 └── vf_section_question ──► vf_question     │
│                                                              │
│  vf_resource (resource_type: 课件/教案/微课视频/电子书/拓展)   │
│       └── vf_resource_category                              │
│                                                              │
│  vf_question (question_type: 单选/多选/填空/问答)             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                       AI 模块关系                              │
│                                                              │
│  sys_user ──► ai_chat_config (1:1)                          │
│  ai_models  (独立，可按用户/部门过滤)                           │
└──────────────────────────────────────────────────────────────┘
```

### 关键外键汇总

| 从表 | 字段 | 指向表 | 说明 |
|---|---|---|---|
| sys_user | dept_id | sys_dept.dept_id | 用户所属部门 |
| sys_user_role | user_id | sys_user.user_id | 用户-角色 N:N |
| sys_user_role | role_id | sys_role.role_id | 用户-角色 N:N |
| sys_user_post | user_id | sys_user.user_id | 用户-岗位 N:N |
| sys_user_post | post_id | sys_post.post_id | 用户-岗位 N:N |
| sys_role_menu | role_id | sys_role.role_id | 角色-菜单 N:N |
| sys_role_menu | menu_id | sys_menu.menu_id | 角色-菜单 N:N |
| sys_role_dept | role_id | sys_role.role_id | 角色-部门 N:N |
| sys_role_dept | dept_id | sys_dept.dept_id | 角色-部门 N:N |
| sys_dict_data | dict_type | sys_dict_type.dict_type | 字典数据归属类型 |
| ai_chat_config | user_id | sys_user.user_id | AI配置属于某用户（1:1） |
| vf_student_profile | user_id | sys_user.user_id | 学生扩展（1:1） |
| vf_teacher_profile | user_id | sys_user.user_id | 教师扩展（1:1） |
| vf_sim_system_image | sim_system_id | vf_sim_system.sim_system_id | 系统图集（1:N） |
| vf_experiment | category_id | vf_experiment_category.category_id | 实验项目分类 |
| vf_experiment | sim_system_id | vf_sim_system.sim_system_id | 实验项目关联实验系统 |
| vf_experiment_participation | user_id | sys_user.user_id | 实验参与-用户 |
| vf_experiment_participation | exp_id | vf_experiment.exp_id | 实验参与-实验项目 |
| vf_course | teacher_id | sys_user.user_id | 课程主讲教师 |
| vf_course_section | course_id | vf_course.course_id | 章节属于课程 |
| vf_course_enrollment | user_id | sys_user.user_id | 选课记录-用户 |
| vf_course_enrollment | course_id | vf_course.course_id | 选课记录-课程 |
| vf_learning_progress | user_id | sys_user.user_id | 学习进度-用户 |
| vf_learning_progress | course_id | vf_course.course_id | 学习进度-课程 |
| vf_learning_progress | section_id | vf_course_section.section_id | 学习进度-章节 |
| vf_learning_progress | resource_id | vf_resource.resource_id | 学习进度-资源 |
| vf_resource | category_id | vf_resource_category.category_id | 资源分类 |
| vf_section_resource | section_id | vf_course_section.section_id | 章节-资源关联 |
| vf_section_resource | course_id | vf_course.course_id | 章节-资源关联（冗余） |
| vf_section_resource | resource_id | vf_resource.resource_id | 章节-资源关联 |
| vf_section_experiment | section_id | vf_course_section.section_id | 章节-实验项目关联 |
| vf_section_experiment | course_id | vf_course.course_id | 章节-实验项目关联（冗余） |
| vf_section_experiment | exp_id | vf_experiment.exp_id | 章节-实验项目关联 |
| vf_section_question | section_id | vf_course_section.section_id | 章节-习题关联 |
| vf_section_question | course_id | vf_course.course_id | 章节-习题关联（冗余） |
| vf_section_question | question_id | vf_question.question_id | 章节-习题关联 |

---

### 模块统计

| 模块 | 表前缀 | 表数量 | 主要变更说明 |
|---|---|---|---|
| 系统管理 | sys_ | 17 | 用户/角色/菜单/部门/岗位/字典/配置/日志等（无变更） |
| AI 模块 | ai_ | 2 | AI 模型管理 + 用户对话配置（无变更） |
| SimHub 实验平台 | vf_ | 20 | 新增4张表，扩展6张表字段 |
| **合计** | | **39** | **净增 6 张表** |

#### SimHub 模块变更明细

| 表名 | 变更类型 | 变更内容 |
|---|---|---|
| vf_sim_system | 🆕 新增 | 实验系统信息表 |
| vf_sim_system_image | 🆕 新增 | 实验系统图集关系表 |
| vf_question | 🆕 新增 | 习题信息表（支持4种题型） |
| vf_section_question | 🆕 新增 | 课程章节与习题关联表 |
| vf_experiment | ✏️ 扩展 | 新增 sim_system_id/exp_duration/exp_guide 字段 |
| vf_course | ✏️ 扩展 | 新增 course_category 字段；status 值域调整为 0/1/2 |
| vf_course_section | ✏️ 扩展 | 新增 status/create_time/update_time 字段；description 扩展为 TEXT |
| vf_resource | ✏️ 扩展 | 新增 resource_content/file_format 字段；resource_type 枚举值调整 |
| vf_section_resource | ✏️ 扩展 | 新增 course_id/status/create_time/update_time 字段 |
| vf_section_experiment | ✏️ 扩展 | 新增 course_id/status/create_time/update_time 字段 |
