-- =====================================================================
-- vf_* 表完整建表脚本（从开发数据库导出，全部使用 IF NOT EXISTS 幂等）
-- 本文件需在 ruoyi-fastapi.sql 之后、simhub 数据插入之前执行
-- 生成时间：自动生成，勿手动修改
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `vf_center_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `center_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '虚拟仿真实验中心' COMMENT '中心名称',
  `center_slogan` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '宣传语',
  `hero_badge` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '英雄区徽章文字',
  `description` text COLLATE utf8mb4_general_ci COMMENT '详细介绍（富文本）',
  `logo_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT 'Logo图片URL',
  `banner_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '首页Banner图URL',
  `stat_founded_year` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '2018' COMMENT '中心成立年份',
  `stat_experiments` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '虚拟仿真实验项目数',
  `stat_students` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '年服务学生数',
  `stat_courses` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '实验课程数',
  `achievements_json` text COLLATE utf8mb4_general_ci COMMENT '荣誉成就JSON数组',
  `functions_json` text COLLATE utf8mb4_general_ci COMMENT '基本职能JSON数组',
  `contact_address` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '联系地址',
  `contact_phone` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '联系电话',
  `contact_email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '联系邮箱',
  `org_structure` text COLLATE utf8mb4_general_ci COMMENT '组织架构（富文本）',
  `team_intro` text COLLATE utf8mb4_general_ci COMMENT '团队介绍（富文本）',
  `contact_info` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '联系方式',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID（NULL=平台默认，非NULL=学校专属）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='实验中心信息表';
CREATE TABLE IF NOT EXISTS `vf_class_admin` (
  `class_id` bigint NOT NULL AUTO_INCREMENT COMMENT '班级ID',
  `class_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '班级名称',
  `class_code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '班级编号',
  `dept_id` bigint DEFAULT NULL COMMENT '所属院系ID',
  `dept_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '所属院系名称（冗余）',
  `term_id` bigint DEFAULT NULL COMMENT '所属学年学期ID',
  `term_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学年学期名称（冗余）',
  `major` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '专业',
  `grade` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '年级',
  `head_teacher` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '班主任姓名',
  `head_teacher_phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '班主任电话',
  `student_count` int DEFAULT '0' COMMENT '学生人数',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '备注',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志(0=存在,2=删除)',
  PRIMARY KEY (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='行政班级表';
CREATE TABLE IF NOT EXISTS `vf_class_student` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `class_id` bigint NOT NULL COMMENT '班级ID',
  `user_id` bigint NOT NULL COMMENT '学生用户ID',
  `student_no` varchar(30) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学号（冗余）',
  `student_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学生姓名（冗余）',
  `join_date` datetime DEFAULT NULL COMMENT '加入日期',
  `is_monitor` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否班长(0=否,1=是)',
  `position` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '班级职务',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=在读,1=休学,2=退学,3=毕业)',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '备注',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='班级学生关联表';
CREATE TABLE IF NOT EXISTS `vf_course` (
  `course_id` bigint NOT NULL AUTO_INCREMENT COMMENT '课程ID',
  `course_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '课程名称',
  `subtitle` varchar(300) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '英文副标题',
  `teacher_id` bigint DEFAULT NULL COMMENT '主讲教师ID',
  `teacher_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '主讲教师姓名（冗余）',
  `department` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '所属院系',
  `cover_image` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '封面图URL',
  `description` text COLLATE utf8mb4_general_ci COMMENT '课程介绍（富文本）',
  `learning_outcomes` text COLLATE utf8mb4_general_ci COMMENT '学习收获（JSON数组或多行文本）',
  `certificate_info` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '课程证书信息',
  `course_category` char(1) COLLATE utf8mb4_general_ci DEFAULT '1' COMMENT '课程分类（1=理论课 2=实验课 3=理实一体化课）',
  `category` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '课程分类',
  `total_sections` int DEFAULT '0' COMMENT '章节数',
  `total_resources` int DEFAULT '0' COMMENT '资源数',
  `total_hours` int DEFAULT '0' COMMENT '总学时',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '课程状态（0=新建 1=已审核 2=已发布）',
  `enroll_count` int DEFAULT '0' COMMENT '选课人数',
  `rating` decimal(3,1) DEFAULT '0.0' COMMENT '课程评分(0.0-5.0)',
  `review_count` int DEFAULT '0' COMMENT '评价数',
  `publish_date` datetime DEFAULT NULL COMMENT '开课时间',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `source_type` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'platform' COMMENT '内容来源(platform/tenant)',
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='实验课程表';
CREATE TABLE IF NOT EXISTS `vf_course_enrollment` (
  `enrollment_id` bigint NOT NULL AUTO_INCREMENT COMMENT '选课ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `course_id` bigint NOT NULL COMMENT '课程ID',
  `enroll_time` datetime DEFAULT NULL COMMENT '选课时间',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=学习中,1=已完成)',
  PRIMARY KEY (`enrollment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='选课记录表';
CREATE TABLE IF NOT EXISTS `vf_course_section` (
  `section_id` bigint NOT NULL AUTO_INCREMENT COMMENT '章节ID',
  `course_id` bigint NOT NULL COMMENT '课程ID',
  `parent_id` bigint DEFAULT '0' COMMENT '父章节ID(0=一级章节)',
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '章节标题',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `section_type` varchar(10) COLLATE utf8mb4_general_ci DEFAULT 'section' COMMENT '类型(chapter/section)',
  `hours` int DEFAULT '0' COMMENT '章节学时',
  `has_resource` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否有课件资源(0=否,1=是)',
  `has_micro_video` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否有微课视频(0=否,1=是)',
  `has_extension` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否有拓展资源(0=否,1=是)',
  `questions_count` int DEFAULT '0' COMMENT '关联试题数',
  `has_experiment` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否有虚拟实验(0=否,1=是)',
  `has_test` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否有在线测试(0=否,1=是)',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  `description` text COLLATE utf8mb4_general_ci COMMENT '章节简介',
  PRIMARY KEY (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='课程章节表';
CREATE TABLE IF NOT EXISTS `vf_experiment` (
  `exp_id` bigint NOT NULL AUTO_INCREMENT COMMENT '实验ID',
  `exp_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '实验名称',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `sim_system_id` bigint DEFAULT NULL COMMENT '关联实验系统ID（FK→vf_sim_system）',
  `exp_type` varchar(10) COLLATE utf8mb4_general_ci DEFAULT 'web' COMMENT '类型(web/exe)',
  `launch_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '启动地址',
  `cover_image` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '封面图URL',
  `description` text COLLATE utf8mb4_general_ci COMMENT '实验介绍（富文本）',
  `exp_duration` int DEFAULT '0' COMMENT '实验时长（分钟）',
  `exp_guide` mediumtext COLLATE utf8mb4_general_ci COMMENT '实验指导书（HTML图文内容）',
  `env_requirements` text COLLATE utf8mb4_general_ci COMMENT '环境要求',
  `software_requirements` text COLLATE utf8mb4_general_ci COMMENT '软件要求',
  `attachments` text COLLATE utf8mb4_general_ci COMMENT '附件JSON数组',
  `tags` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '标签（逗号分隔）',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `view_count` int DEFAULT '0' COMMENT '查看次数',
  `participate_count` int DEFAULT '0' COMMENT '参与人数',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `source_type` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'platform' COMMENT '内容来源(platform/tenant)',
  PRIMARY KEY (`exp_id`),
  KEY `idx_vf_exp_sim_system` (`sim_system_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='虚拟仿真实验表';
CREATE TABLE IF NOT EXISTS `vf_experiment_category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类名称',
  `parent_id` bigint DEFAULT '0' COMMENT '父分类ID(0=根节点)',
  `icon` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '图标',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='虚拟实验分类表';
CREATE TABLE IF NOT EXISTS `vf_experiment_participation` (
  `participation_id` bigint NOT NULL AUTO_INCREMENT COMMENT '参与ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `exp_id` bigint NOT NULL COMMENT '实验ID',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int DEFAULT '0' COMMENT '持续秒数',
  `status` varchar(10) COLLATE utf8mb4_general_ci DEFAULT 'started' COMMENT '状态(started/completed)',
  PRIMARY KEY (`participation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='实验参与记录表';
CREATE TABLE IF NOT EXISTS `vf_learning_progress` (
  `progress_id` bigint NOT NULL AUTO_INCREMENT COMMENT '进度ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `course_id` bigint NOT NULL COMMENT '课程ID',
  `section_id` bigint NOT NULL COMMENT '章节ID',
  `resource_id` bigint DEFAULT NULL COMMENT '资源ID',
  `last_position` int DEFAULT '0' COMMENT '上次播放位置（秒）',
  `completed` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否完成(0=否,1=是)',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`progress_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='学习进度表';
CREATE TABLE IF NOT EXISTS `vf_lesson_prep` (
  `prep_id` bigint NOT NULL AUTO_INCREMENT COMMENT '备课ID',
  `course_id` bigint DEFAULT NULL COMMENT '关联已有课程ID（NULL=全新课程草稿）',
  `teacher_id` bigint NOT NULL COMMENT '教师用户ID',
  `prep_name` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '备课标题',
  `current_step` int DEFAULT '1' COMMENT '当前编辑步骤(1~5)',
  `basic_info_json` text COLLATE utf8mb4_general_ci COMMENT '步骤1基本信息草稿（JSON）',
  `outline_json` mediumtext COLLATE utf8mb4_general_ci COMMENT '步骤2大纲草稿（JSON树）',
  `resource_config_json` mediumtext COLLATE utf8mb4_general_ci COMMENT '步骤3资源配置草稿（JSON，key=sectionId）',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=草稿,1=待审核,2=已发布)',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`prep_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='备课草稿表';
CREATE TABLE IF NOT EXISTS `vf_news` (
  `news_id` bigint NOT NULL AUTO_INCREMENT COMMENT '新闻ID',
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `summary` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '摘要',
  `content` text COLLATE utf8mb4_general_ci COMMENT '正文（富文本）',
  `cover_image` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '封面图URL',
  `author` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '作者',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=草稿,1=已发布)',
  `view_count` int DEFAULT '0' COMMENT '浏览次数',
  `publish_time` datetime DEFAULT NULL COMMENT '发布时间',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志(0=正常,2=删除)',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `source_type` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'platform' COMMENT '内容来源(platform/tenant)',
  PRIMARY KEY (`news_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='新闻动态表';
CREATE TABLE IF NOT EXISTS `vf_org_member` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名及职称（如：王建华 教授）',
  `title_text` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '职务名称（如：实验教学中心主任）',
  `dept` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '职责描述（如：统筹管理）',
  `color` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '#0B5394' COMMENT '显示颜色',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='中心组织架构成员表';
CREATE TABLE IF NOT EXISTS `vf_question` (
  `question_id` bigint NOT NULL AUTO_INCREMENT COMMENT '习题ID（主键）',
  `question_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '习题名称/标题',
  `stem` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题干内容（富文本）',
  `options` text COLLATE utf8mb4_unicode_ci COMMENT '选项JSON数组（单/多选题），填空/问答题为NULL',
  `question_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'single' COMMENT '题型（single=单选/multiple=多选/fill=填空/essay=问答）',
  `answer` text COLLATE utf8mb4_unicode_ci COMMENT '正确答案（选择题为key逗号分隔，填空/问答为文本）',
  `explanation` text COLLATE utf8mb4_unicode_ci COMMENT '答案释义/解析',
  `difficulty` tinyint DEFAULT '1' COMMENT '难度（1=易 2=中 3=难）',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `del_flag` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '删除标志（0=存在 2=删除）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`question_id`),
  KEY `idx_vf_question_type` (`question_type`),
  KEY `idx_vf_question_status` (`status`,`del_flag`),
  FULLTEXT KEY `ft_vf_question_stem` (`stem`,`question_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='习题信息表';
CREATE TABLE IF NOT EXISTS `vf_regulation` (
  `reg_id` bigint NOT NULL AUTO_INCREMENT COMMENT '制度ID',
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `content` text COLLATE utf8mb4_general_ci COMMENT '正文（富文本）',
  `attachment_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '附件URL',
  `category` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '类别',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `source_type` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'platform' COMMENT '内容来源(platform/tenant)',
  PRIMARY KEY (`reg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='规章制度表';
CREATE TABLE IF NOT EXISTS `vf_resource` (
  `resource_id` bigint NOT NULL AUTO_INCREMENT COMMENT '资源ID',
  `resource_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '资源名称',
  `resource_content` text COLLATE utf8mb4_general_ci COMMENT '资源内容描述（摘要/正文）',
  `file_format` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '文件格式类型（pdf/mp4/docx/pptx/epub等）',
  `resource_type` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'courseware' COMMENT '资源类型（courseware=课件/lesson_plan=教案/micro_video=微课视频/ebook=电子书/extension=拓展资源）',
  `file_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '文件URL',
  `cover_image` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '封面图URL',
  `description` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '描述',
  `file_size` bigint DEFAULT '0' COMMENT '文件大小（字节）',
  `duration` int DEFAULT '0' COMMENT '时长（秒，视频/音频）',
  `category_id` bigint DEFAULT NULL COMMENT '资源分类ID',
  `course_id` bigint DEFAULT NULL COMMENT '关联课程ID',
  `section_id` bigint DEFAULT NULL COMMENT '关联章节ID',
  `allow_download` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '允许下载(0=是,1=否)',
  `download_count` int DEFAULT '0' COMMENT '下载次数',
  `view_count` int DEFAULT '0' COMMENT '查看次数',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `source_type` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'platform' COMMENT '内容来源(platform/tenant)',
  PRIMARY KEY (`resource_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='教学资源表';
CREATE TABLE IF NOT EXISTS `vf_resource_category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类名称',
  `parent_id` bigint DEFAULT '0' COMMENT '父分类ID',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='资源分类表';
CREATE TABLE IF NOT EXISTS `vf_section_experiment` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `section_id` bigint NOT NULL COMMENT '章节ID',
  `course_id` bigint DEFAULT NULL COMMENT '课程ID（FK→vf_course，冗余加速查询）',
  `exp_id` bigint NOT NULL COMMENT '实验ID',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_vf_se_section_exp` (`section_id`,`exp_id`),
  KEY `idx_vf_se_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='章节-实验关联表';
CREATE TABLE IF NOT EXISTS `vf_section_question` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `section_id` bigint NOT NULL COMMENT '章节ID（FK→vf_course_section）',
  `course_id` bigint NOT NULL COMMENT '课程ID（FK→vf_course，冗余加速查询）',
  `question_id` bigint NOT NULL COMMENT '习题ID（FK→vf_question）',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_vf_sq_section_question` (`section_id`,`question_id`),
  KEY `idx_vf_sq_course_id` (`course_id`),
  KEY `idx_vf_sq_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程章节与习题关联表';
CREATE TABLE IF NOT EXISTS `vf_section_resource` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `section_id` bigint NOT NULL COMMENT '章节ID',
  `course_id` bigint DEFAULT NULL COMMENT '课程ID（FK→vf_course，冗余加速查询）',
  `resource_id` bigint NOT NULL COMMENT '资源ID',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_vf_sr_section_resource` (`section_id`,`resource_id`),
  KEY `idx_vf_sr_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='章节-资源关联表';
CREATE TABLE IF NOT EXISTS `vf_sim_system` (
  `sim_system_id` bigint NOT NULL AUTO_INCREMENT COMMENT '实验系统ID（主键）',
  `system_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '系统名称',
  `system_detail` text COLLATE utf8mb4_unicode_ci COMMENT '系统详情（富文本）',
  `cover_image` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '系统封面图URL',
  `hw_recommend` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '推荐硬件配置描述',
  `hw_support` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '支持的硬件设备（逗号分隔：helmet/pc/zspace）',
  `sys_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '系统分类',
  `view_count` int DEFAULT '0' COMMENT '查看次数',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `del_flag` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '删除标志（0=存在 2=删除）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  `source_type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'platform' COMMENT '内容来源(platform/tenant)',
  PRIMARY KEY (`sim_system_id`),
  KEY `idx_vf_sim_system_status` (`status`,`del_flag`),
  KEY `idx_vf_sim_system_category` (`sys_category`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实验系统信息表';
CREATE TABLE IF NOT EXISTS `vf_sim_system_image` (
  `image_id` bigint NOT NULL AUTO_INCREMENT COMMENT '图片ID（主键）',
  `sim_system_id` bigint NOT NULL COMMENT '实验系统ID（FK→vf_sim_system）',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片URL',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`image_id`),
  KEY `idx_vf_ssi_system_id` (`sim_system_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实验系统图集表';
CREATE TABLE IF NOT EXISTS `vf_student_profile` (
  `profile_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` bigint NOT NULL COMMENT 'sys_user.user_id',
  `student_no` varchar(30) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学号',
  `class_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '班级',
  `major` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '专业',
  `college` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学院',
  `grade` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '年级',
  `enroll_year` int DEFAULT NULL COMMENT '入学年份',
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='学生扩展信息表';
CREATE TABLE IF NOT EXISTS `vf_teacher_profile` (
  `profile_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` bigint NOT NULL COMMENT 'sys_user.user_id',
  `teacher_no` varchar(30) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '工号',
  `college` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学院',
  `department` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '系部/教研室',
  `title` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '职称',
  `introduction` text COLLATE utf8mb4_general_ci COMMENT '简介',
  `avatar_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '头像URL',
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='教师扩展信息表';
CREATE TABLE IF NOT EXISTS `vf_team_member` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `title_role` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '职位职称（如：中心主任 · 教授）',
  `specialty` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '研究专长（如：解剖学 · 数字医学教育）',
  `bio` text COLLATE utf8mb4_general_ci COMMENT '个人简介',
  `image_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '头像图片URL',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `tenant_id` bigint DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='核心团队成员表';
CREATE TABLE IF NOT EXISTS `vf_tenant` (
  `tenant_id` bigint NOT NULL AUTO_INCREMENT COMMENT '租户ID',
  `tenant_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '租户编码（如：hzsf，用于子域名等）',
  `tenant_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '机构名称（如：杭州师范大学）',
  `subdomain` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '子域名前缀（如：hzsf），NULL 表示未配置',
  `logo_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT 'Logo 图片 URL',
  `theme_config` text COLLATE utf8mb4_general_ci COMMENT '主题配置 JSON（颜色/字体等）',
  `contact_email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '联系邮箱',
  `contact_phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '联系电话',
  `address` varchar(300) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学校地址',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '备注',
  `domain` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '租户完整二级域名（如：hzsf.medpro.com）',
  PRIMARY KEY (`tenant_id`),
  UNIQUE KEY `tenant_code` (`tenant_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='学校/机构租户表';
CREATE TABLE IF NOT EXISTS `vf_tenant_content_grant` (
  `grant_id` bigint NOT NULL AUTO_INCREMENT COMMENT '授权ID',
  `tenant_id` bigint NOT NULL COMMENT '被授权学校租户ID',
  `content_type` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '内容类型(course/experiment/resource/sim_system)',
  `content_id` bigint NOT NULL COMMENT '内容ID（对应各业务表主键）',
  `granted_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '授权操作者（admin账号）',
  `grant_time` datetime DEFAULT NULL COMMENT '授权时间',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=有效,1=已撤销)',
  PRIMARY KEY (`grant_id`),
  UNIQUE KEY `uq_tenant_content` (`tenant_id`,`content_type`,`content_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='平台内容授权给学校表';
CREATE TABLE IF NOT EXISTS `vf_term_config` (
  `term_id` bigint NOT NULL AUTO_INCREMENT COMMENT '学期ID',
  `term_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '学年学期名称',
  `term_code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学期编码',
  `school_year` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '学年',
  `semester` char(1) COLLATE utf8mb4_general_ci DEFAULT '1' COMMENT '学期(1=第一学期,2=第二学期)',
  `start_date` datetime DEFAULT NULL COMMENT '开始日期',
  `end_date` datetime DEFAULT NULL COMMENT '结束日期',
  `is_current` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '是否当前学期(0=否,1=是)',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  `remark` varchar(500) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '备注',
  `create_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_general_ci DEFAULT '''''' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志(0=存在,2=删除)',
  PRIMARY KEY (`term_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='学年学期配置表';

SET FOREIGN_KEY_CHECKS = 1;
-- vf-schema-create.sql 执行完毕
