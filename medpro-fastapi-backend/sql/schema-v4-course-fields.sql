-- =====================================================================
-- Schema v4 DDL 升级脚本（MySQL）
-- 功能：为 vf_course 和 vf_course_section 增加门户展示所需字段
-- 包含：模拟课程数据初始化
-- 执行前提：schema v2 已执行完毕
-- 幂等设计：使用存储过程防止重复执行报错
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------
-- 辅助存储过程：幂等添加列
-- -----------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_add_col_v4`;
DELIMITER $$
CREATE PROCEDURE `sp_add_col_v4`(
  IN p_table_name   VARCHAR(64),
  IN p_column_name  VARCHAR(64),
  IN p_column_def   TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
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

-- -----------------------------------------------------------------------
-- 1. vf_course 新增字段
-- -----------------------------------------------------------------------
CALL sp_add_col_v4('vf_course', 'subtitle',
  "`subtitle` VARCHAR(300) NULL DEFAULT '' COMMENT '英文副标题' AFTER `course_name`");
CALL sp_add_col_v4('vf_course', 'teacher_name',
  "`teacher_name` VARCHAR(100) NULL DEFAULT '' COMMENT '主讲教师姓名（冗余）' AFTER `teacher_id`");
CALL sp_add_col_v4('vf_course', 'department',
  "`department` VARCHAR(100) NULL DEFAULT '' COMMENT '所属院系' AFTER `teacher_name`");
CALL sp_add_col_v4('vf_course', 'total_hours',
  "`total_hours` INT NULL DEFAULT 0 COMMENT '总学时' AFTER `total_resources`");
CALL sp_add_col_v4('vf_course', 'rating',
  "`rating` DECIMAL(3,1) NULL DEFAULT 0.0 COMMENT '课程评分(0.0-5.0)' AFTER `enroll_count`");
CALL sp_add_col_v4('vf_course', 'review_count',
  "`review_count` INT NULL DEFAULT 0 COMMENT '评价数' AFTER `rating`");
CALL sp_add_col_v4('vf_course', 'publish_date',
  "`publish_date` DATETIME NULL COMMENT '开课时间' AFTER `review_count`");

-- -----------------------------------------------------------------------
-- 2. vf_course_section 新增字段
-- -----------------------------------------------------------------------
CALL sp_add_col_v4('vf_course_section', 'hours',
  "`hours` INT NULL DEFAULT 0 COMMENT '章节学时' AFTER `section_type`");
CALL sp_add_col_v4('vf_course_section', 'has_resource',
  "`has_resource` CHAR(1) NULL DEFAULT '0' COMMENT '是否有课件资源(0=否,1=是)' AFTER `hours`");
CALL sp_add_col_v4('vf_course_section', 'has_experiment',
  "`has_experiment` CHAR(1) NULL DEFAULT '0' COMMENT '是否有虚拟实验(0=否,1=是)' AFTER `has_resource`");
CALL sp_add_col_v4('vf_course_section', 'has_test',
  "`has_test` CHAR(1) NULL DEFAULT '0' COMMENT '是否有在线测试(0=否,1=是)' AFTER `has_experiment`");

DROP PROCEDURE IF EXISTS `sp_add_col_v4`;

-- -----------------------------------------------------------------------
-- 3. 模拟课程数据（6门课程，与门户 mockData 一致）
-- -----------------------------------------------------------------------
-- 使用 INSERT IGNORE 防止重复插入
INSERT IGNORE INTO `vf_course`
  (`course_id`, `course_name`, `subtitle`, `teacher_name`, `department`,
   `cover_image`, `description`, `course_category`,
   `total_sections`, `total_resources`, `total_hours`,
   `status`, `enroll_count`, `rating`, `review_count`, `publish_date`,
   `sort_order`, `create_by`, `create_time`, `del_flag`)
VALUES
(1, '人体解剖学虚拟实验课程', 'Virtual Human Anatomy Laboratory', '王明远 教授', '基础医学院',
 '/profile/avatar/anatomy.jpg',
 '本课程以三维交互技术为核心，系统讲授人体各系统的解剖结构与功能关系。通过虚拟解剖实验，学生可在安全环境中反复练习解剖操作，配合影像学标注与临床病例分析，构建完整的解剖知识体系。',
 '2', 12, 36, 24, '2', 2341, 4.8, 186, '2024-09-01 00:00:00',
 1, 'admin', NOW(), '0'),

(2, '基础生理学实验课程', 'Basic Physiology Laboratory Course', '李晓华 副教授', '生理学教研室',
 '/profile/avatar/physiology.jpg',
 '系统涵盖神经-肌肉生理、血液循环生理、呼吸生理、消化生理等核心内容，借助虚拟仿真实验替代传统动物实验，使学生在无损实验中深入理解人体生理调节机制。',
 '2', 10, 30, 20, '2', 1876, 4.7, 152, '2024-09-01 00:00:00',
 2, 'admin', NOW(), '0'),

(3, '病原微生物学实验', 'Pathogenic Microbiology Laboratory', '张建国 教授', '微生物学与免疫学',
 '/profile/avatar/microbiology.jpg',
 '通过虚拟实验室模拟各类病原体的形态观察、培养鉴定、药敏测试等实验操作，使学生在生物安全的虚拟环境中掌握微生物学实验核心技能。',
 '2', 8, 24, 16, '2', 1432, 4.6, 98, '2024-10-15 00:00:00',
 3, 'admin', NOW(), '0'),

(4, '临床技能综合训练', 'Comprehensive Clinical Skills Training', '陈志远 主任医师', '临床医学院',
 '/profile/avatar/clinical.jpg',
 '依托高仿真临床模拟环境，系统训练问诊、体格检查、常用临床操作技能，通过虚拟病人系统提供逼真的临床情境，培养学生的临床思维与应急处置能力。',
 '3', 15, 45, 30, '2', 3218, 4.9, 267, '2024-09-01 00:00:00',
 4, 'admin', NOW(), '0'),

(5, '药理学虚拟实验课程', 'Pharmacology Virtual Laboratory', '刘芳 副教授', '药学院',
 '/profile/avatar/pharmacology.jpg',
 '结合分子药理学和临床药理学，通过虚拟实验演示药物-受体相互作用、量效关系分析、药代动力学参数计算等核心实验，替代传统动物实验，降低实验伦理风险。',
 '2', 9, 27, 18, '2', 987, 4.5, 73, '2024-11-01 00:00:00',
 5, 'admin', NOW(), '0'),

(6, '外科手术基础技能', 'Basic Surgical Techniques', '赵伟强 教授', '外科学教研室',
 '/profile/avatar/surgery.jpg',
 '系统训练外科手术基础操作技能，包括手术器械识别与使用、无菌操作规范、组织切开与缝合、打结技术等，通过VR力反馈系统提供真实手感模拟。',
 '3', 11, 33, 22, '2', 1654, 4.8, 134, '2024-09-15 00:00:00',
 6, 'admin', NOW(), '0');

-- -----------------------------------------------------------------------
-- 4. 课程章节数据（与 mockData 大纲一致）
-- -----------------------------------------------------------------------
-- 课程1：人体解剖学虚拟实验课程（12章）
INSERT IGNORE INTO `vf_course_section`
  (`course_id`, `parent_id`, `title`, `sort_order`, `section_type`, `hours`, `has_resource`, `has_experiment`, `has_test`, `status`)
VALUES
(1, 0, '运动系统：骨骼与关节',    1, 'chapter', 2, '1', '1', '1', '0'),
(1, 0, '运动系统：骨骼肌系统',    2, 'chapter', 2, '1', '1', '0', '0'),
(1, 0, '消化系统解剖',            3, 'chapter', 2, '1', '1', '1', '0'),
(1, 0, '呼吸系统解剖',            4, 'chapter', 2, '1', '0', '1', '0'),
(1, 0, '循环系统：心脏解剖',      5, 'chapter', 2, '1', '1', '1', '0'),
(1, 0, '循环系统：血管分布',      6, 'chapter', 2, '1', '0', '0', '0'),
(1, 0, '泌尿系统解剖',            7, 'chapter', 2, '1', '1', '1', '0'),
(1, 0, '生殖系统解剖',            8, 'chapter', 2, '1', '0', '1', '0'),
(1, 0, '神经系统：中枢神经',      9, 'chapter', 2, '1', '1', '1', '0'),
(1, 0, '神经系统：周围神经',     10, 'chapter', 2, '1', '0', '1', '0'),
(1, 0, '感觉器官解剖',           11, 'chapter', 2, '1', '1', '0', '0'),
(1, 0, '综合病例解剖分析',       12, 'chapter', 2, '1', '1', '1', '0');

-- 课程2：基础生理学实验课程（10章）
INSERT IGNORE INTO `vf_course_section`
  (`course_id`, `parent_id`, `title`, `sort_order`, `section_type`, `hours`, `has_resource`, `has_experiment`, `has_test`, `status`)
VALUES
(2, 0, '绪论：生理学研究方法',    1, 'chapter', 2, '1', '0', '1', '0'),
(2, 0, '细胞生理学基础',          2, 'chapter', 2, '1', '1', '1', '0'),
(2, 0, '神经系统信号传导',        3, 'chapter', 2, '1', '1', '1', '0'),
(2, 0, '骨骼肌生理与收缩',       4, 'chapter', 2, '1', '1', '0', '0'),
(2, 0, '心血管生理',              5, 'chapter', 2, '1', '1', '1', '0'),
(2, 0, '呼吸生理',                6, 'chapter', 2, '1', '1', '1', '0'),
(2, 0, '消化与吸收',              7, 'chapter', 2, '1', '1', '1', '0'),
(2, 0, '能量代谢与体温调节',     8, 'chapter', 2, '1', '0', '1', '0'),
(2, 0, '泌尿系统生理',            9, 'chapter', 2, '1', '0', '1', '0'),
(2, 0, '内分泌与生殖生理',       10, 'chapter', 2, '1', '1', '1', '0');

-- 课程3：病原微生物学实验（8章）
INSERT IGNORE INTO `vf_course_section`
  (`course_id`, `parent_id`, `title`, `sort_order`, `section_type`, `hours`, `has_resource`, `has_experiment`, `has_test`, `status`)
VALUES
(3, 0, '微生物学实验基础与安全',  1, 'chapter', 2, '1', '0', '1', '0'),
(3, 0, '细菌形态学观察',          2, 'chapter', 2, '1', '1', '1', '0'),
(3, 0, '培养基制备与灭菌',        3, 'chapter', 2, '1', '1', '0', '0'),
(3, 0, '细菌的分离培养',          4, 'chapter', 2, '1', '1', '1', '0'),
(3, 0, '细菌生化鉴定',            5, 'chapter', 2, '1', '1', '1', '0'),
(3, 0, '药物敏感性试验',          6, 'chapter', 2, '1', '1', '1', '0'),
(3, 0, '病毒学基础实验',          7, 'chapter', 2, '1', '0', '1', '0'),
(3, 0, '免疫学检测技术',          8, 'chapter', 2, '1', '1', '1', '0');

-- 课程4：临床技能综合训练（5章，mockData 中仅列出5章）
INSERT IGNORE INTO `vf_course_section`
  (`course_id`, `parent_id`, `title`, `sort_order`, `section_type`, `hours`, `has_resource`, `has_experiment`, `has_test`, `status`)
VALUES
(4, 0, '问诊技巧与医患沟通',      1, 'chapter', 2, '1', '0', '1', '0'),
(4, 0, '生命体征测量',            2, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '一般状态体格检查',        3, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '心肺听诊技能',            4, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '腹部检查技能',            5, 'chapter', 2, '1', '1', '0', '0'),
(4, 0, '神经系统检查',            6, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '急救基本操作',            7, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '临床常用操作技能',        8, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '手术室规范与无菌术',      9, 'chapter', 2, '1', '0', '1', '0'),
(4, 0, '常见外科操作训练',       10, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '内科常见症状分析',       11, 'chapter', 2, '1', '0', '1', '0'),
(4, 0, '诊断学综合训练',         12, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '临床思维与鉴别诊断',     13, 'chapter', 2, '1', '0', '1', '0'),
(4, 0, '模拟病例综合演练',       14, 'chapter', 2, '1', '1', '1', '0'),
(4, 0, '毕业技能综合考核',       15, 'chapter', 2, '1', '1', '1', '0');

-- 课程5：药理学虚拟实验课程（3章）
INSERT IGNORE INTO `vf_course_section`
  (`course_id`, `parent_id`, `title`, `sort_order`, `section_type`, `hours`, `has_resource`, `has_experiment`, `has_test`, `status`)
VALUES
(5, 0, '药物作用的基本原理',      1, 'chapter', 2, '1', '0', '1', '0'),
(5, 0, '受体与药物相互作用',      2, 'chapter', 2, '1', '1', '1', '0'),
(5, 0, '量效关系与毒效关系',      3, 'chapter', 2, '1', '1', '1', '0'),
(5, 0, '药代动力学基础',          4, 'chapter', 2, '1', '1', '1', '0'),
(5, 0, '常用心血管药物',          5, 'chapter', 2, '1', '1', '0', '0'),
(5, 0, '抗菌药物与耐药性',        6, 'chapter', 2, '1', '1', '1', '0'),
(5, 0, '中枢神经系统用药',        7, 'chapter', 2, '1', '0', '1', '0'),
(5, 0, '临床药理学综合实验',      8, 'chapter', 2, '1', '1', '1', '0'),
(5, 0, '药物不良反应与监测',      9, 'chapter', 2, '1', '0', '1', '0');

-- 课程6：外科手术基础技能（4章）
INSERT IGNORE INTO `vf_course_section`
  (`course_id`, `parent_id`, `title`, `sort_order`, `section_type`, `hours`, `has_resource`, `has_experiment`, `has_test`, `status`)
VALUES
(6, 0, '外科基本原则与手术室规范',  1, 'chapter', 2, '1', '0', '1', '0'),
(6, 0, '手术器械识别与使用',        2, 'chapter', 2, '1', '1', '1', '0'),
(6, 0, '无菌操作技术',              3, 'chapter', 2, '1', '1', '1', '0'),
(6, 0, '组织切开技术',              4, 'chapter', 2, '1', '1', '0', '0'),
(6, 0, '缝合技术与打结',            5, 'chapter', 2, '1', '1', '1', '0'),
(6, 0, '止血与引流技术',            6, 'chapter', 2, '1', '1', '1', '0'),
(6, 0, '腹腔镜基本操作',            7, 'chapter', 2, '1', '1', '0', '0'),
(6, 0, '骨科基本操作',              8, 'chapter', 2, '1', '1', '1', '0'),
(6, 0, '创伤外科处理',              9, 'chapter', 2, '1', '0', '1', '0'),
(6, 0, '术后护理与并发症处理',     10, 'chapter', 2, '1', '0', '1', '0'),
(6, 0, '外科综合技能考核',         11, 'chapter', 2, '1', '1', '1', '0');

-- -----------------------------------------------------------------------
-- 5. 更新章节统计（total_sections）
-- -----------------------------------------------------------------------
UPDATE vf_course c
SET c.total_sections = (
  SELECT COUNT(*) FROM vf_course_section s
  WHERE s.course_id = c.course_id AND s.status = '0'
)
WHERE c.course_id IN (1, 2, 3, 4, 5, 6);

SET FOREIGN_KEY_CHECKS = 1;
