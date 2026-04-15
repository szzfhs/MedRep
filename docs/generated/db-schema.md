# SimHub 数据库表结构设计

> 自动生成 / 手工维护 — 最后更新: 2026-04-04

## 现有系统表（sys_ 前缀）

| 表名 | 说明 |
|------|------|
| sys_user | 用户信息 |
| sys_role | 角色 |
| sys_menu | 菜单/权限 |
| sys_dept | 部门 |
| sys_post | 岗位 |
| sys_config | 系统参数 |
| sys_dict_type | 字典类型 |
| sys_dict_data | 字典数据 |
| sys_notice | 通知公告 |
| sys_logininfor | 登录日志 |
| sys_oper_log | 操作日志 |
| sys_job | 定时任务 |
| sys_job_log | 任务日志 |
| sys_user_role | 用户角色关联 |
| sys_user_post | 用户岗位关联 |
| sys_role_menu | 角色菜单关联 |
| sys_role_dept | 角色数据范围 |

---

## SimHub 业务表（vf_ 前缀）

### vf_center_info — 实验中心信息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| center_name | VARCHAR(100) | 中心名称 |
| center_slogan | VARCHAR(200) | 宣传语 |
| description | TEXT | 详细介绍（富文本） |
| logo_url | VARCHAR(200) | Logo图片 |
| banner_url | VARCHAR(200) | 首页Banner图 |
| org_structure | TEXT | 组织架构（富文本） |
| team_intro | TEXT | 团队介绍（富文本） |
| contact_info | VARCHAR(500) | 联系方式 |
| update_by | VARCHAR(64) | 更新者 |
| update_time | DATETIME | 更新时间 |

### vf_news — 新闻动态

| 字段 | 类型 | 说明 |
|------|------|------|
| news_id | BIGINT PK | 新闻ID |
| title | VARCHAR(200) | 标题 |
| summary | VARCHAR(500) | 摘要 |
| content | TEXT | 正文（富文本） |
| cover_image | VARCHAR(200) | 封面图 |
| author | VARCHAR(50) | 作者 |
| status | CHAR(1) | 状态(0=草稿,1=已发布) |
| view_count | INT | 浏览次数 |
| publish_time | DATETIME | 发布时间 |
| create_by | VARCHAR(64) | 创建者 |
| create_time | DATETIME | 创建时间 |
| update_by | VARCHAR(64) | 更新者 |
| update_time | DATETIME | 更新时间 |
| del_flag | CHAR(1) | 删除标志 |

### vf_regulation — 规章制度

| 字段 | 类型 | 说明 |
|------|------|------|
| reg_id | BIGINT PK | 制度ID |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 正文（富文本） |
| attachment_url | VARCHAR(200) | 附件URL |
| category | VARCHAR(50) | 类别 |
| sort_order | INT | 排序 |
| status | CHAR(1) | 状态(0=正常,1=停用) |
| create_by | VARCHAR(64) | 创建者 |
| create_time | DATETIME | 创建时间 |
| update_by | VARCHAR(64) | 更新者 |
| update_time | DATETIME | 更新时间 |
| del_flag | CHAR(1) | 删除标志 |

### vf_experiment_category — 实验分类

| 字段 | 类型 | 说明 |
|------|------|------|
| category_id | BIGINT PK | 分类ID |
| category_name | VARCHAR(100) | 分类名称 |
| parent_id | BIGINT | 父分类ID（0=根节点） |
| icon | VARCHAR(100) | 图标 |
| sort_order | INT | 排序 |
| status | CHAR(1) | 状态 |

### vf_experiment — 虚拟仿真实验

| 字段 | 类型 | 说明 |
|------|------|------|
| exp_id | BIGINT PK | 实验ID |
| exp_name | VARCHAR(200) | 实验名称 |
| category_id | BIGINT FK | 分类ID |
| exp_type | VARCHAR(10) | 类型(web/exe) |
| launch_url | VARCHAR(500) | 启动地址 |
| cover_image | VARCHAR(200) | 封面图 |
| description | TEXT | 实验介绍（富文本） |
| env_requirements | TEXT | 环境要求 |
| software_requirements | TEXT | 软件要求 |
| attachments | TEXT | 附件JSON数组 |
| tags | VARCHAR(200) | 标签（逗号分隔） |
| status | CHAR(1) | 状态(0=发布,1=下线) |
| view_count | INT | 查看次数 |
| participate_count | INT | 参与人数 |
| sort_order | INT | 排序 |
| create_by | VARCHAR(64) | 创建者 |
| create_time | DATETIME | 创建时间 |
| update_by | VARCHAR(64) | 更新者 |
| update_time | DATETIME | 更新时间 |
| del_flag | CHAR(1) | 删除标志 |

### vf_experiment_participation — 实验参与记录

| 字段 | 类型 | 说明 |
|------|------|------|
| participation_id | BIGINT PK | 参与ID |
| user_id | BIGINT FK | 用户ID |
| exp_id | BIGINT FK | 实验ID |
| start_time | DATETIME | 开始时间 |
| end_time | DATETIME | 结束时间 |
| duration_seconds | INT | 持续秒数 |
| status | VARCHAR(10) | 状态(started/completed) |

### vf_course — 实验课程

| 字段 | 类型 | 说明 |
|------|------|------|
| course_id | BIGINT PK | 课程ID |
| course_name | VARCHAR(200) | 课程名称 |
| teacher_id | BIGINT FK | 主讲教师ID |
| cover_image | VARCHAR(200) | 封面图 |
| description | TEXT | 课程介绍（富文本） |
| category | VARCHAR(100) | 课程分类 |
| total_sections | INT | 章节数 |
| total_resources | INT | 资源数 |
| status | CHAR(1) | 状态(0=发布,1=草稿) |
| enroll_count | INT | 选课人数 |
| sort_order | INT | 排序 |
| create_by | VARCHAR(64) | 创建者 |
| create_time | DATETIME | 创建时间 |
| update_by | VARCHAR(64) | 更新者 |
| update_time | DATETIME | 更新时间 |
| del_flag | CHAR(1) | 删除标志 |

### vf_course_section — 课程章节

| 字段 | 类型 | 说明 |
|------|------|------|
| section_id | BIGINT PK | 章节ID |
| course_id | BIGINT FK | 课程ID |
| parent_id | BIGINT | 父章节ID（0=一级章节） |
| title | VARCHAR(200) | 章节标题 |
| sort_order | INT | 排序 |
| section_type | VARCHAR(10) | 类型(chapter/section) |
| description | VARCHAR(500) | 描述 |

### vf_course_enrollment — 选课记录

| 字段 | 类型 | 说明 |
|------|------|------|
| enrollment_id | BIGINT PK | 选课ID |
| user_id | BIGINT FK | 用户ID |
| course_id | BIGINT FK | 课程ID |
| enroll_time | DATETIME | 选课时间 |
| status | CHAR(1) | 状态(0=学习中,1=已完成) |

### vf_learning_progress — 学习进度

| 字段 | 类型 | 说明 |
|------|------|------|
| progress_id | BIGINT PK | 进度ID |
| user_id | BIGINT FK | 用户ID |
| course_id | BIGINT FK | 课程ID |
| section_id | BIGINT FK | 章节ID |
| resource_id | BIGINT FK | 资源ID |
| last_position | INT | 上次播放位置（秒） |
| completed | CHAR(1) | 是否完成(0=否,1=是) |
| update_time | DATETIME | 更新时间 |

### vf_resource_category — 资源分类

| 字段 | 类型 | 说明 |
|------|------|------|
| category_id | BIGINT PK | 分类ID |
| category_name | VARCHAR(100) | 分类名称 |
| parent_id | BIGINT | 父分类ID |
| sort_order | INT | 排序 |
| status | CHAR(1) | 状态 |

### vf_resource — 教学资源

| 字段 | 类型 | 说明 |
|------|------|------|
| resource_id | BIGINT PK | 资源ID |
| resource_name | VARCHAR(200) | 资源名称 |
| resource_type | VARCHAR(10) | 类型(pdf/video/audio/image/doc) |
| file_url | VARCHAR(500) | 文件URL |
| cover_image | VARCHAR(200) | 封面图 |
| description | VARCHAR(500) | 描述 |
| file_size | BIGINT | 文件大小（字节） |
| duration | INT | 时长（秒，视频/音频） |
| category_id | BIGINT FK | 资源分类 |
| course_id | BIGINT FK | 关联课程 |
| section_id | BIGINT FK | 关联章节 |
| allow_download | CHAR(1) | 允许下载(0=是,1=否) |
| download_count | INT | 下载次数 |
| view_count | INT | 查看次数 |
| status | CHAR(1) | 状态(0=正常,1=停用) |
| create_by | VARCHAR(64) | 创建者 |
| create_time | DATETIME | 创建时间 |
| update_by | VARCHAR(64) | 更新者 |
| update_time | DATETIME | 更新时间 |
| del_flag | CHAR(1) | 删除标志 |

### vf_section_experiment — 章节-实验关联

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | ID |
| section_id | BIGINT FK | 章节ID |
| exp_id | BIGINT FK | 实验ID |
| sort_order | INT | 排序 |

### vf_section_resource — 章节-资源关联

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | ID |
| section_id | BIGINT FK | 章节ID |
| resource_id | BIGINT FK | 资源ID |
| sort_order | INT | 排序 |

### vf_student_profile — 学生扩展信息

| 字段 | 类型 | 说明 |
|------|------|------|
| profile_id | BIGINT PK | ID |
| user_id | BIGINT FK UNIQUE | sys_user.user_id |
| student_no | VARCHAR(30) | 学号 |
| class_name | VARCHAR(100) | 班级 |
| major | VARCHAR(100) | 专业 |
| college | VARCHAR(100) | 学院 |
| grade | VARCHAR(20) | 年级 |
| enroll_year | INT | 入学年份 |

### vf_teacher_profile — 教师扩展信息

| 字段 | 类型 | 说明 |
|------|------|------|
| profile_id | BIGINT PK | ID |
| user_id | BIGINT FK UNIQUE | sys_user.user_id |
| teacher_no | VARCHAR(30) | 工号 |
| college | VARCHAR(100) | 学院 |
| department | VARCHAR(100) | 系部/教研室 |
| title | VARCHAR(50) | 职称 |
| introduction | TEXT | 简介 |
| avatar_url | VARCHAR(200) | 头像 |
