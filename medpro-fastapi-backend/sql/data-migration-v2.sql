-- =====================================================================
-- Schema v2 数据迁移脚本（MySQL）
-- 目的：将存量数据从 v1 枚举值映射到 v2 枚举值
-- 执行前提：schema-v2-upgrade.sql 已执行完毕
-- ⚠️ 重要：迁移前建议备份数据库！
-- =====================================================================

SET NAMES utf8mb4;

-- -----------------------------------------------------------------------
-- M-1. vf_course.status 值域迁移
-- v1: 0=发布，1=草稿
-- v2: 0=新建，1=已审核，2=已发布
-- 迁移策略：原"草稿(1)" → 新"新建(0)"；原"发布(0)" → 新"已发布(2)"
-- 使用两步避免冲突：先改发布→临时值，再改草稿→新建，最后改临时值→已发布
-- -----------------------------------------------------------------------
UPDATE `vf_course` SET `status` = '9' WHERE `status` = '0';  -- 原发布→临时
UPDATE `vf_course` SET `status` = '0' WHERE `status` = '1';  -- 原草稿→新建
UPDATE `vf_course` SET `status` = '2' WHERE `status` = '9';  -- 临时→已发布

-- -----------------------------------------------------------------------
-- M-2. vf_resource.resource_type 值域迁移
-- v1: pdf/video/audio/image/doc
-- v2: courseware/lesson_plan/micro_video/ebook/extension
-- 迁移策略：按文件格式特征进行映射（尽量保留语义）
-- -----------------------------------------------------------------------
UPDATE `vf_resource` SET `resource_type` = 'micro_video'  WHERE `resource_type` = 'video';
UPDATE `vf_resource` SET `resource_type` = 'ebook'        WHERE `resource_type` = 'pdf';
UPDATE `vf_resource` SET `resource_type` = 'courseware'   WHERE `resource_type` = 'doc';
UPDATE `vf_resource` SET `resource_type` = 'courseware'   WHERE `resource_type` = 'image';
UPDATE `vf_resource` SET `resource_type` = 'extension'    WHERE `resource_type` = 'audio';
-- 兜底：未匹配到任何新值的旧值统一归为 courseware
UPDATE `vf_resource`
  SET `resource_type` = 'courseware'
  WHERE `resource_type` NOT IN ('courseware','lesson_plan','micro_video','ebook','extension');

-- -----------------------------------------------------------------------
-- M-3. vf_section_resource.course_id 反填
-- 通过 vf_course_section 反查 course_id 补全冗余字段
-- -----------------------------------------------------------------------
UPDATE `vf_section_resource` sr
  JOIN `vf_course_section` cs ON sr.section_id = cs.section_id
  SET sr.course_id = cs.course_id
  WHERE sr.course_id IS NULL;

-- -----------------------------------------------------------------------
-- M-4. vf_section_experiment.course_id 反填
-- -----------------------------------------------------------------------
UPDATE `vf_section_experiment` se
  JOIN `vf_course_section` cs ON se.section_id = cs.section_id
  SET se.course_id = cs.course_id
  WHERE se.course_id IS NULL;

-- -----------------------------------------------------------------------
-- M-5. vf_course_section 时间戳反填（使用关联课程的 create_time）
-- -----------------------------------------------------------------------
UPDATE `vf_course_section` cs
  JOIN `vf_course` c ON cs.course_id = c.course_id
  SET cs.create_time = COALESCE(cs.create_time, c.create_time, NOW()),
      cs.update_time = COALESCE(cs.update_time, c.update_time)
  WHERE cs.create_time IS NULL;

-- =====================================================================
-- 验收查询
-- =====================================================================
-- SELECT status, COUNT(*) FROM vf_course GROUP BY status;
-- SELECT resource_type, COUNT(*) FROM vf_resource GROUP BY resource_type;
-- SELECT COUNT(*) FROM vf_section_resource WHERE course_id IS NULL;   -- 应为 0
-- SELECT COUNT(*) FROM vf_section_experiment WHERE course_id IS NULL; -- 应为 0
