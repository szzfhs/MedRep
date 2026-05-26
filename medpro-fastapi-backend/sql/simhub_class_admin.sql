-- =====================================================
-- SimHub 行政班级管理 - 数据库表结构
-- 创建日期: 2026-05-26
-- =====================================================

-- 1. 学年学期配置表
CREATE TABLE IF NOT EXISTS `vf_term_config` (
  `term_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '学期ID',
  `term_name` VARCHAR(100) NOT NULL COMMENT '学年学期名称（如：2025-2026学年第1学期）',
  `term_code` VARCHAR(50) DEFAULT '' COMMENT '学期编码（如：202501）',
  `school_year` VARCHAR(20) DEFAULT '' COMMENT '学年（如：2025-2026）',
  `semester` CHAR(1) DEFAULT '1' COMMENT '学期（1=第一学期，2=第二学期）',
  `start_date` DATE DEFAULT NULL COMMENT '开始日期',
  `end_date` DATE DEFAULT NULL COMMENT '结束日期',
  `is_current` CHAR(1) DEFAULT '0' COMMENT '是否当前学期（0=否，1=是）',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` CHAR(1) DEFAULT '0' COMMENT '状态（0=正常，1=停用）',
  `remark` VARCHAR(500) DEFAULT '' COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT '' COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT '' COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` CHAR(1) DEFAULT '0' COMMENT '删除标志（0=存在，2=删除）',
  PRIMARY KEY (`term_id`),
  UNIQUE KEY `uk_term_code` (`term_code`),
  KEY `idx_is_current` (`is_current`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学年学期配置表';

-- 2. 行政班级表
CREATE TABLE IF NOT EXISTS `vf_class_admin` (
  `class_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '班级ID',
  `class_name` VARCHAR(100) NOT NULL COMMENT '班级名称（如：临床医学2023级1班）',
  `class_code` VARCHAR(50) DEFAULT '' COMMENT '班级编号（如：2023-01）',
  `dept_id` BIGINT DEFAULT NULL COMMENT '所属院系ID（关联sys_dept.dept_id）',
  `dept_name` VARCHAR(100) DEFAULT '' COMMENT '所属院系名称（冗余字段）',
  `term_id` BIGINT DEFAULT NULL COMMENT '所属学年学期ID（关联vf_term_config.term_id）',
  `term_name` VARCHAR(100) DEFAULT '' COMMENT '学年学期名称（冗余字段）',
  `major` VARCHAR(100) DEFAULT '' COMMENT '专业',
  `grade` VARCHAR(20) DEFAULT '' COMMENT '年级（如：2023）',
  `head_teacher` VARCHAR(100) DEFAULT '' COMMENT '班主任姓名',
  `head_teacher_phone` VARCHAR(20) DEFAULT '' COMMENT '班主任电话',
  `student_count` INT DEFAULT 0 COMMENT '学生人数',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` CHAR(1) DEFAULT '0' COMMENT '状态（0=正常，1=停用）',
  `remark` VARCHAR(500) DEFAULT '' COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT '' COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT '' COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` CHAR(1) DEFAULT '0' COMMENT '删除标志（0=存在，2=删除）',
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `uk_class_code` (`class_code`),
  KEY `idx_dept_id` (`dept_id`),
  KEY `idx_term_id` (`term_id`),
  KEY `idx_grade` (`grade`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行政班级表';

-- 3. 班级学生关联表
CREATE TABLE IF NOT EXISTS `vf_class_student` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `class_id` BIGINT NOT NULL COMMENT '班级ID',
  `user_id` BIGINT NOT NULL COMMENT '学生用户ID（关联sys_user.user_id）',
  `student_no` VARCHAR(30) DEFAULT '' COMMENT '学号（冗余）',
  `student_name` VARCHAR(100) DEFAULT '' COMMENT '学生姓名（冗余）',
  `join_date` DATE DEFAULT NULL COMMENT '加入日期',
  `is_monitor` CHAR(1) DEFAULT '0' COMMENT '是否班长（0=否，1=是）',
  `position` VARCHAR(50) DEFAULT '' COMMENT '班级职务（如：班长、学习委员等）',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` CHAR(1) DEFAULT '0' COMMENT '状态（0=在读，1=休学，2=退学，3=毕业）',
  `remark` VARCHAR(500) DEFAULT '' COMMENT '备注',
  `create_by` VARCHAR(64) DEFAULT '' COMMENT '创建者',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT '' COMMENT '更新者',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_class_user` (`class_id`, `user_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_student_no` (`student_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级学生关联表';

-- 4. 给学生扩展信息表添加班级ID字段（如果不存在）
-- ALTER TABLE `vf_student_profile` 
-- ADD COLUMN `class_id` BIGINT DEFAULT NULL COMMENT '行政班级ID（关联vf_class_admin.class_id）' AFTER `user_id`,
-- ADD KEY `idx_class_id` (`class_id`);

-- 5. 插入示例学年学期数据
INSERT INTO `vf_term_config` (`term_name`, `term_code`, `school_year`, `semester`, `start_date`, `end_date`, `is_current`, `sort_order`, `status`) 
VALUES 
('2024-2025学年第2学期', '202402', '2024-2025', '2', '2025-02-17', '2025-07-15', '0', 1, '0'),
('2025-2026学年第1学期', '202501', '2025-2026', '1', '2025-09-01', '2026-01-20', '0', 2, '0'),
('2025-2026学年第2学期', '202502', '2025-2026', '2', '2026-02-17', '2026-07-15', '1', 3, '0'),
('2026-2027学年第1学期', '202601', '2026-2027', '1', '2026-09-01', '2027-01-20', '0', 4, '0')
ON DUPLICATE KEY UPDATE term_name=VALUES(term_name);
