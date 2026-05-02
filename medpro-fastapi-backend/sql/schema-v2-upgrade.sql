-- =====================================================================
-- Schema v2 DDL 升级脚本（MySQL）
-- 目标数据库：medpro-fastapi
-- 执行前提：schema v1（simhub-init.sql）已执行完毕，16张 vf_* 表存在
-- 幂等设计：使用 IF NOT EXISTS / IF EXISTS 防止重复执行报错
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------
-- 辅助存储过程：幂等添加列（MySQL 8.0 不支持 ADD COLUMN IF NOT EXISTS）
-- -----------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_add_column_if_not_exists`;
DELIMITER $$
CREATE PROCEDURE `sp_add_column_if_not_exists`(
  IN p_table_schema VARCHAR(64),
  IN p_table_name   VARCHAR(64),
  IN p_column_name  VARCHAR(64),
  IN p_column_def   TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = p_table_schema
      AND TABLE_NAME   = p_table_name
      AND COLUMN_NAME  = p_column_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN ', p_column_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

-- 辅助存储过程：幂等添加索引
DROP PROCEDURE IF EXISTS `sp_add_index_if_not_exists`;
DELIMITER $$
CREATE PROCEDURE `sp_add_index_if_not_exists`(
  IN p_table_schema VARCHAR(64),
  IN p_table_name   VARCHAR(64),
  IN p_index_name   VARCHAR(64),
  IN p_index_def    TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = p_table_schema
      AND TABLE_NAME   = p_table_name
      AND INDEX_NAME   = p_index_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD ', p_index_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

-- =====================================================================
-- PART A: 新增4张表
-- =====================================================================

-- -----------------------------------------------------------------------
-- A-1. vf_sim_system — 实验系统信息表
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vf_sim_system` (
  `sim_system_id` bigint NOT NULL AUTO_INCREMENT COMMENT '实验系统ID（主键）',
  `system_name`   varchar(200) NOT NULL COMMENT '系统名称',
  `system_detail` text COMMENT '系统详情（富文本）',
  `cover_image`   varchar(200) DEFAULT '' COMMENT '系统封面图URL',
  `hw_recommend`  varchar(500) DEFAULT '' COMMENT '推荐硬件配置描述',
  `hw_support`    varchar(100) DEFAULT '' COMMENT '支持的硬件设备（逗号分隔：helmet/pc/zspace）',
  `sys_category`  varchar(100) DEFAULT '' COMMENT '系统分类',
  `view_count`    int DEFAULT 0 COMMENT '查看次数',
  `status`        char(1) DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `del_flag`      char(1) DEFAULT '0' COMMENT '删除标志（0=存在 2=删除）',
  `create_by`     varchar(64) DEFAULT '' COMMENT '创建人',
  `create_time`   datetime DEFAULT NULL COMMENT '创建日期',
  `update_by`     varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time`   datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`sim_system_id`),
  KEY `idx_vf_sim_system_status` (`status`, `del_flag`),
  KEY `idx_vf_sim_system_category` (`sys_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实验系统信息表';

-- -----------------------------------------------------------------------
-- A-2. vf_sim_system_image — 实验系统图集表
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vf_sim_system_image` (
  `image_id`      bigint NOT NULL AUTO_INCREMENT COMMENT '图片ID（主键）',
  `sim_system_id` bigint NOT NULL COMMENT '实验系统ID（FK→vf_sim_system）',
  `image_url`     varchar(500) NOT NULL COMMENT '图片URL',
  `sort_order`    int DEFAULT 0 COMMENT '排序',
  `status`        char(1) DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `create_time`   datetime DEFAULT NULL COMMENT '创建日期',
  `update_time`   datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`image_id`),
  KEY `idx_vf_ssi_system_id` (`sim_system_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实验系统图集表';

-- -----------------------------------------------------------------------
-- A-3. vf_question — 习题信息表
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vf_question` (
  `question_id`   bigint NOT NULL AUTO_INCREMENT COMMENT '习题ID（主键）',
  `question_name` varchar(200) DEFAULT '' COMMENT '习题名称/标题',
  `stem`          text NOT NULL COMMENT '题干内容（富文本）',
  `options`       text COMMENT '选项JSON数组（单/多选题），填空/问答题为NULL',
  `question_type` varchar(20) NOT NULL DEFAULT 'single' COMMENT '题型（single=单选/multiple=多选/fill=填空/essay=问答）',
  `answer`        text COMMENT '正确答案（选择题为key逗号分隔，填空/问答为文本）',
  `explanation`   text COMMENT '答案释义/解析',
  `difficulty`    tinyint DEFAULT 1 COMMENT '难度（1=易 2=中 3=难）',
  `status`        char(1) DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `del_flag`      char(1) DEFAULT '0' COMMENT '删除标志（0=存在 2=删除）',
  `create_by`     varchar(64) DEFAULT '' COMMENT '创建人',
  `create_time`   datetime DEFAULT NULL COMMENT '创建日期',
  `update_by`     varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time`   datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`question_id`),
  KEY `idx_vf_question_type` (`question_type`),
  KEY `idx_vf_question_status` (`status`, `del_flag`),
  FULLTEXT KEY `ft_vf_question_stem` (`stem`, `question_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='习题信息表';

-- -----------------------------------------------------------------------
-- A-4. vf_section_question — 课程章节与习题关联表
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vf_section_question` (
  `id`          bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `section_id`  bigint NOT NULL COMMENT '章节ID（FK→vf_course_section）',
  `course_id`   bigint NOT NULL COMMENT '课程ID（FK→vf_course，冗余加速查询）',
  `question_id` bigint NOT NULL COMMENT '习题ID（FK→vf_question）',
  `sort_order`  int DEFAULT 0 COMMENT '排序',
  `status`      char(1) DEFAULT '0' COMMENT '状态（0=正常 1=停用）',
  `create_time` datetime DEFAULT NULL COMMENT '创建日期',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_vf_sq_section_question` (`section_id`, `question_id`),
  KEY `idx_vf_sq_course_id` (`course_id`),
  KEY `idx_vf_sq_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程章节与习题关联表';


-- =====================================================================
-- PART B: 扩展6张现有表字段（通过存储过程实现幂等）
-- 使用当前数据库名动态调用
-- =====================================================================

SET @db = DATABASE();

-- -----------------------------------------------------------------------
-- B-1. vf_experiment — 新增 sim_system_id / exp_duration / exp_guide
-- -----------------------------------------------------------------------
CALL sp_add_column_if_not_exists(@db, 'vf_experiment', 'sim_system_id',
  '`sim_system_id` bigint DEFAULT NULL COMMENT "关联实验系统ID（FK→vf_sim_system）" AFTER `category_id`');
CALL sp_add_column_if_not_exists(@db, 'vf_experiment', 'exp_duration',
  '`exp_duration` int DEFAULT 0 COMMENT "实验时长（分钟）" AFTER `description`');
CALL sp_add_column_if_not_exists(@db, 'vf_experiment', 'exp_guide',
  '`exp_guide` mediumtext COMMENT "实验指导书（HTML图文内容）" AFTER `exp_duration`');

CALL sp_add_index_if_not_exists(@db, 'vf_experiment', 'idx_vf_exp_sim_system',
  'INDEX `idx_vf_exp_sim_system` (`sim_system_id`)');

ALTER TABLE `vf_experiment` MODIFY COLUMN `status` char(1) DEFAULT '0' COMMENT '状态（0=正常 1=停用）';

-- -----------------------------------------------------------------------
-- B-2. vf_course — 新增 course_category；status 值域扩展为三态
-- -----------------------------------------------------------------------
CALL sp_add_column_if_not_exists(@db, 'vf_course', 'course_category',
  '`course_category` char(1) DEFAULT "1" COMMENT "课程分类（1=理论课 2=实验课 3=理实一体化课）" AFTER `description`');

ALTER TABLE `vf_course` MODIFY COLUMN `status` char(1) DEFAULT '0' COMMENT '课程状态（0=新建 1=已审核 2=已发布）';

-- -----------------------------------------------------------------------
-- B-3. vf_course_section — 新增 status / create_time / update_time；description 升级为 TEXT
-- -----------------------------------------------------------------------
CALL sp_add_column_if_not_exists(@db, 'vf_course_section', 'status',
  '`status` char(1) DEFAULT "0" COMMENT "状态（0=正常 1=停用）" AFTER `section_type`');
CALL sp_add_column_if_not_exists(@db, 'vf_course_section', 'create_time',
  '`create_time` datetime DEFAULT NULL COMMENT "创建日期" AFTER `status`');
CALL sp_add_column_if_not_exists(@db, 'vf_course_section', 'update_time',
  '`update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT "更新日期" AFTER `create_time`');

ALTER TABLE `vf_course_section` MODIFY COLUMN `description` text COMMENT '章节简介';

-- -----------------------------------------------------------------------
-- B-4. vf_resource — 新增 resource_content / file_format；更新枚举注释
-- -----------------------------------------------------------------------
CALL sp_add_column_if_not_exists(@db, 'vf_resource', 'resource_content',
  '`resource_content` text COMMENT "资源内容描述（摘要/正文）" AFTER `resource_name`');
CALL sp_add_column_if_not_exists(@db, 'vf_resource', 'file_format',
  '`file_format` varchar(20) DEFAULT "" COMMENT "文件格式类型（pdf/mp4/docx/pptx/epub等）" AFTER `resource_content`');

ALTER TABLE `vf_resource` MODIFY COLUMN `resource_type` varchar(20) DEFAULT 'courseware'
  COMMENT '资源类型（courseware=课件/lesson_plan=教案/micro_video=微课视频/ebook=电子书/extension=拓展资源）';

-- -----------------------------------------------------------------------
-- B-5. vf_section_resource — 新增 course_id / status / create_time / update_time
-- -----------------------------------------------------------------------
CALL sp_add_column_if_not_exists(@db, 'vf_section_resource', 'course_id',
  '`course_id` bigint DEFAULT NULL COMMENT "课程ID（FK→vf_course，冗余加速查询）" AFTER `section_id`');
CALL sp_add_column_if_not_exists(@db, 'vf_section_resource', 'status',
  '`status` char(1) DEFAULT "0" COMMENT "状态（0=正常 1=停用）" AFTER `sort_order`');
CALL sp_add_column_if_not_exists(@db, 'vf_section_resource', 'create_time',
  '`create_time` datetime DEFAULT NULL COMMENT "创建日期" AFTER `status`');
CALL sp_add_column_if_not_exists(@db, 'vf_section_resource', 'update_time',
  '`update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT "更新日期" AFTER `create_time`');

CALL sp_add_index_if_not_exists(@db, 'vf_section_resource', 'uk_vf_sr_section_resource',
  'UNIQUE KEY `uk_vf_sr_section_resource` (`section_id`, `resource_id`)');
CALL sp_add_index_if_not_exists(@db, 'vf_section_resource', 'idx_vf_sr_course_id',
  'INDEX `idx_vf_sr_course_id` (`course_id`)');

-- -----------------------------------------------------------------------
-- B-6. vf_section_experiment — 新增 course_id / status / create_time / update_time
-- -----------------------------------------------------------------------
CALL sp_add_column_if_not_exists(@db, 'vf_section_experiment', 'course_id',
  '`course_id` bigint DEFAULT NULL COMMENT "课程ID（FK→vf_course，冗余加速查询）" AFTER `section_id`');
CALL sp_add_column_if_not_exists(@db, 'vf_section_experiment', 'status',
  '`status` char(1) DEFAULT "0" COMMENT "状态（0=正常 1=停用）" AFTER `sort_order`');
CALL sp_add_column_if_not_exists(@db, 'vf_section_experiment', 'create_time',
  '`create_time` datetime DEFAULT NULL COMMENT "创建日期" AFTER `status`');
CALL sp_add_column_if_not_exists(@db, 'vf_section_experiment', 'update_time',
  '`update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT "更新日期" AFTER `create_time`');

CALL sp_add_index_if_not_exists(@db, 'vf_section_experiment', 'uk_vf_se_section_exp',
  'UNIQUE KEY `uk_vf_se_section_exp` (`section_id`, `exp_id`)');
CALL sp_add_index_if_not_exists(@db, 'vf_section_experiment', 'idx_vf_se_course_id',
  'INDEX `idx_vf_se_course_id` (`course_id`)');

-- 清理辅助存储过程
DROP PROCEDURE IF EXISTS `sp_add_column_if_not_exists`;
DROP PROCEDURE IF EXISTS `sp_add_index_if_not_exists`;


SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 验收查询（执行完后运行此处验证）
-- =====================================================================
-- SHOW TABLES LIKE 'vf_%';                          -- 应返回 20 条
-- DESCRIBE vf_experiment;                           -- 应含 sim_system_id/exp_duration/exp_guide
-- DESCRIBE vf_course;                               -- 应含 course_category
-- DESCRIBE vf_course_section;                       -- 应含 status/create_time/update_time
-- DESCRIBE vf_resource;                             -- 应含 resource_content/file_format
-- DESCRIBE vf_section_resource;                     -- 应含 course_id/status/create_time/update_time
-- DESCRIBE vf_section_experiment;                   -- 应含 course_id/status/create_time/update_time
