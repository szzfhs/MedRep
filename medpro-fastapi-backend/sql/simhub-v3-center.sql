-- =====================================================================
-- SimHub v3 — 实验中心介绍模块升级 SQL
-- 依赖：simhub-init.sql、simhub-v2-init.sql 已执行
-- 幂等：支持重复执行（ALTER IGNORE / INSERT IGNORE）
-- =====================================================================

SET NAMES utf8mb4;

-- =====================================================================
-- PART 1: 扩展 vf_center_info 表字段（MySQL 8.0 兼容，幂等）
-- =====================================================================

DROP PROCEDURE IF EXISTS `sp_add_col_if_not_exists`;
DELIMITER $$
CREATE PROCEDURE `sp_add_col_if_not_exists`(
  IN tbl_name VARCHAR(64), IN col_name VARCHAR(64), IN col_def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl_name AND COLUMN_NAME = col_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl_name, '` ADD COLUMN `', col_name, '` ', col_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL sp_add_col_if_not_exists('vf_center_info', 'hero_badge',        "VARCHAR(200) NULL DEFAULT '' COMMENT '英雄区徽章文字' AFTER `center_slogan`");
CALL sp_add_col_if_not_exists('vf_center_info', 'stat_founded_year', "VARCHAR(20)  NULL DEFAULT '2018' COMMENT '中心成立年份' AFTER `banner_url`");
CALL sp_add_col_if_not_exists('vf_center_info', 'stat_experiments',  "VARCHAR(20)  NULL DEFAULT '0' COMMENT '虚拟仿真实验项目数' AFTER `stat_founded_year`");
CALL sp_add_col_if_not_exists('vf_center_info', 'stat_students',     "VARCHAR(20)  NULL DEFAULT '0' COMMENT '年服务学生数' AFTER `stat_experiments`");
CALL sp_add_col_if_not_exists('vf_center_info', 'stat_courses',      "VARCHAR(20)  NULL DEFAULT '0' COMMENT '实验课程数' AFTER `stat_students`");
CALL sp_add_col_if_not_exists('vf_center_info', 'achievements_json', "TEXT NULL COMMENT '荣誉成就JSON数组' AFTER `stat_courses`");
CALL sp_add_col_if_not_exists('vf_center_info', 'functions_json',    "TEXT NULL COMMENT '基本职能JSON数组' AFTER `achievements_json`");
CALL sp_add_col_if_not_exists('vf_center_info', 'contact_address',   "VARCHAR(500) NULL DEFAULT '' COMMENT '联系地址' AFTER `functions_json`");
CALL sp_add_col_if_not_exists('vf_center_info', 'contact_phone',     "VARCHAR(100) NULL DEFAULT '' COMMENT '联系电话' AFTER `contact_address`");
CALL sp_add_col_if_not_exists('vf_center_info', 'contact_email',     "VARCHAR(100) NULL DEFAULT '' COMMENT '联系邮箱' AFTER `contact_phone`");

DROP PROCEDURE IF EXISTS `sp_add_col_if_not_exists`;

-- =====================================================================
-- PART 2: 创建组织架构成员表 vf_org_member
-- =====================================================================

CREATE TABLE IF NOT EXISTS `vf_org_member` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name`        VARCHAR(50)  NOT NULL COMMENT '姓名及职称（如：王建华 教授）',
  `title_text`  VARCHAR(100) NULL DEFAULT '' COMMENT '职务名称（如：实验教学中心主任）',
  `dept`        VARCHAR(50)  NULL DEFAULT '' COMMENT '职责描述（如：统筹管理）',
  `color`       VARCHAR(20)  NULL DEFAULT '#0B5394' COMMENT '显示颜色',
  `sort_order`  INT          NULL DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='中心组织架构成员表';

-- =====================================================================
-- PART 3: 创建核心团队成员表 vf_team_member
-- =====================================================================

CREATE TABLE IF NOT EXISTS `vf_team_member` (
  `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name`        VARCHAR(50)   NOT NULL COMMENT '姓名',
  `title_role`  VARCHAR(100)  NULL DEFAULT '' COMMENT '职位职称（如：中心主任 · 教授）',
  `specialty`   VARCHAR(200)  NULL DEFAULT '' COMMENT '研究专长（如：解剖学 · 数字医学教育）',
  `bio`         TEXT          NULL COMMENT '个人简介',
  `image_url`   VARCHAR(200)  NULL DEFAULT '' COMMENT '头像图片URL',
  `sort_order`  INT           NULL DEFAULT 0 COMMENT '排序',
  `status`      CHAR(1)       NULL DEFAULT '0' COMMENT '状态(0=正常,1=停用)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核心团队成员表';

-- =====================================================================
-- PART 4: 初始化中心基本信息（幂等）
-- =====================================================================

INSERT IGNORE INTO `vf_center_info`
  (`center_name`, `center_slogan`, `hero_badge`, `description`,
   `stat_founded_year`, `stat_experiments`, `stat_students`, `stat_courses`,
   `achievements_json`, `functions_json`,
   `contact_address`, `contact_phone`, `contact_email`, `update_by`)
VALUES (
  '虚拟仿真实验教学中心',
  '依托国家级医学实验教学示范中心，以现代信息技术深度融合医学实验教学，构建开放共享的虚拟仿真实验教学新生态。',
  '国家级虚拟仿真实验教学示范中心',
  '某医科大学虚拟仿真实验教学中心成立于2018年，依托我校国家级基础医学实验教学示范中心建设而成，是教育部认定的国家级虚拟仿真实验教学示范中心之一。\n\n中心以"精准仿真、开放共享、创新发展"为建设理念，充分利用虚拟现实（VR）、增强现实（AR）、WebGL三维交互等技术，开发了涵盖人体解剖、临床技能、药物作用、微生物实验等多领域的高质量虚拟仿真实验项目。\n\n目前中心已建成52个虚拟仿真实验项目，开设18门系统化实验课程，配套数字教材、视频、课件等各类教学资源384件，年均服务在校生超过1.2万人次。\n\n中心积极推动省内外高校间教学资源开放共享，已与8所高校签署合作协议，共享优质实验教学资源，有效扩大了优质医学教育资源的辐射范围。',
  '2018', '52', '1.2万+', '18',
  '[{"label":"国家级示范中心","yearDesc":"2022年获批","iconName":"Award","color":"#0B5394"},{"label":"省级重点实验室","yearDesc":"2020年获批","iconName":"Building2","color":"#00897B"},{"label":"国家级精品课程","yearDesc":"3门认定","iconName":"BookOpen","color":"#6A1B9A"},{"label":"发表教学论文","yearDesc":"逾50篇","iconName":"Star","color":"#E65100"}]',
  '["开发高质量虚拟仿真实验项目，替代高危险性、不可逆、不可重复的真实实验","构建系统化虚拟实验课程体系，覆盖基础医学到临床实践全链条","建设数字化教学资源库，提供电子教材、视频、课件等多类型资源","为教师提供虚拟仿真实验教学技能培训与技术支持","开展省内外高校间虚拟仿真实验教学资源共享与协作","持续探索"线上虚拟+线下实体"混合式实验教学创新模式"]',
  '某市某区大学路XX号 医学院A栋3层实验中心',
  '021-XXXX-XXXX（工作日 8:30-17:30）',
  'simhub@medical.edu.cn',
  'admin'
);

-- =====================================================================
-- PART 5: 初始化组织架构成员数据（幂等）
-- =====================================================================

INSERT IGNORE INTO `vf_org_member` (`id`, `name`, `title_text`, `dept`, `color`, `sort_order`) VALUES
  (1, '王建华 教授', '实验教学中心主任', '统筹管理', '#0B5394', 1),
  (2, '李晓华 副教授', '教学副主任',     '教学协调', '#00897B', 2),
  (3, '张国华 高工',  '技术总监',       '技术支持', '#6A1B9A', 3),
  (4, '陈美玲 讲师',  '实验主管',       '实验管理', '#E65100', 4);

-- =====================================================================
-- PART 6: 初始化核心团队成员数据（幂等）
-- =====================================================================

INSERT IGNORE INTO `vf_team_member` (`id`, `name`, `title_role`, `specialty`, `bio`, `image_url`, `sort_order`, `status`) VALUES
  (1, '王建华', '中心主任 · 教授',       '解剖学 · 数字医学教育', '博士生导师，从事解剖学教学与虚拟仿真实验研究20余年，主持国家级虚拟仿真实验教学项目3项。', '', 1, '0'),
  (2, '李晓华', '副主任 · 副教授',       '生理学 · 教育技术',     '教育部高等学校生理学教学指导委员会委员，长期致力于数字化实验教学资源建设。', '', 2, '0'),
  (3, '张国华', '技术总监 · 高级工程师', 'VR/AR技术 · 系统架构',  '负责平台技术架构设计与VR实验项目开发，拥有10年医疗教育软件开发经验。', '', 3, '0'),
  (4, '陈美玲', '实验教学主管 · 讲师',   '临床技能 · 教学设计',   '临床医学博士，专注于临床技能虚拟仿真教学系统的开发与评估研究。', '', 4, '0');
