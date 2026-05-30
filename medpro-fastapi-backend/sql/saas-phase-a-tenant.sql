-- =====================================================================
-- Phase A: SAAS 多租户 Schema 迁移（MySQL 8.0 兼容，幂等执行）
-- 通过 INFORMATION_SCHEMA 检测列是否已存在，避免重复执行报错
-- =====================================================================

SET @db = DATABASE();

-- -----------------------------------------------------------------------
-- 辅助宏：生成"若列不存在则 ALTER"的动态 SQL
-- -----------------------------------------------------------------------

-- sys_user.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sys_user' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE sys_user ADD COLUMN tenant_id BIGINT NULL COMMENT "所属租户ID（NULL=平台用户/超管，非NULL=绑定某学校）"',
  'SELECT "sys_user.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_center_info.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_center_info' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_center_info ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID（NULL=平台默认，非NULL=学校专属）"',
  'SELECT "vf_center_info.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_org_member.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_org_member' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_org_member ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_org_member.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_team_member.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_team_member' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_team_member ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_team_member.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_news.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_news' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_news ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_news.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_news.source_type
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_news' AND COLUMN_NAME='source_type')=0,
  'ALTER TABLE vf_news ADD COLUMN source_type VARCHAR(10) NOT NULL DEFAULT "platform" COMMENT "内容来源(platform/tenant)"',
  'SELECT "vf_news.source_type already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_regulation.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_regulation' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_regulation ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_regulation.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_regulation.source_type
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_regulation' AND COLUMN_NAME='source_type')=0,
  'ALTER TABLE vf_regulation ADD COLUMN source_type VARCHAR(10) NOT NULL DEFAULT "platform" COMMENT "内容来源(platform/tenant)"',
  'SELECT "vf_regulation.source_type already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_experiment_category.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_experiment_category' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_experiment_category ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_experiment_category.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_experiment.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_experiment' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_experiment ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_experiment.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_experiment.source_type
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_experiment' AND COLUMN_NAME='source_type')=0,
  'ALTER TABLE vf_experiment ADD COLUMN source_type VARCHAR(10) NOT NULL DEFAULT "platform" COMMENT "内容来源(platform/tenant)"',
  'SELECT "vf_experiment.source_type already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_course.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_course' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_course ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_course.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_course.source_type
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_course' AND COLUMN_NAME='source_type')=0,
  'ALTER TABLE vf_course ADD COLUMN source_type VARCHAR(10) NOT NULL DEFAULT "platform" COMMENT "内容来源(platform/tenant)"',
  'SELECT "vf_course.source_type already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_resource_category.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_resource_category' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_resource_category ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_resource_category.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_resource.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_resource' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_resource ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_resource.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_resource.source_type
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_resource' AND COLUMN_NAME='source_type')=0,
  'ALTER TABLE vf_resource ADD COLUMN source_type VARCHAR(10) NOT NULL DEFAULT "platform" COMMENT "内容来源(platform/tenant)"',
  'SELECT "vf_resource.source_type already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_sim_system.tenant_id
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_sim_system' AND COLUMN_NAME='tenant_id')=0,
  'ALTER TABLE vf_sim_system ADD COLUMN tenant_id BIGINT NULL COMMENT "租户ID"',
  'SELECT "vf_sim_system.tenant_id already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- vf_sim_system.source_type
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA=@db AND TABLE_NAME='vf_sim_system' AND COLUMN_NAME='source_type')=0,
  'ALTER TABLE vf_sim_system ADD COLUMN source_type VARCHAR(10) NOT NULL DEFAULT "platform" COMMENT "内容来源(platform/tenant)"',
  'SELECT "vf_sim_system.source_type already exists" AS msg'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- -----------------------------------------------------------------------
-- 存量数据迁移：source_type 置为 platform
-- -----------------------------------------------------------------------
UPDATE vf_news       SET source_type = 'platform' WHERE source_type IS NULL OR source_type = '';
UPDATE vf_regulation SET source_type = 'platform' WHERE source_type IS NULL OR source_type = '';
UPDATE vf_experiment SET source_type = 'platform' WHERE source_type IS NULL OR source_type = '';
UPDATE vf_course     SET source_type = 'platform' WHERE source_type IS NULL OR source_type = '';
UPDATE vf_resource   SET source_type = 'platform' WHERE source_type IS NULL OR source_type = '';
UPDATE vf_sim_system SET source_type = 'platform' WHERE source_type IS NULL OR source_type = '';

-- -----------------------------------------------------------------------
-- 插入测试租户（INSERT IGNORE 幂等）
-- -----------------------------------------------------------------------
INSERT IGNORE INTO vf_tenant
    (tenant_code, tenant_name, subdomain, contact_email, status, create_by, create_time, remark)
VALUES
    ('hzsf', '杭州师范大学', 'hzsf', 'admin@hznu.edu.cn', '0', 'admin', NOW(), '测试租户：杭州师范大学'),
    ('demo', 'Demo医学院（演示）', 'demo', 'demo@medpro.com', '0', 'admin', NOW(), '演示用租户');

-- -----------------------------------------------------------------------
-- 为 hzsf 创建校级管理员并绑定 simhub_admin 角色
-- -----------------------------------------------------------------------
SET @hzsf_tid = (SELECT tenant_id FROM vf_tenant WHERE tenant_code = 'hzsf' LIMIT 1);

INSERT IGNORE INTO sys_user
    (user_name, nick_name, user_type, email, phonenumber, sex, password,
     status, del_flag, create_by, create_time, tenant_id, remark)
VALUES
    ('hzsf_admin', '杭大管理员', '00', 'admin@hznu.edu.cn', '', '0',
     '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH',
     '0', '0', 'admin', NOW(), @hzsf_tid, '杭州师范大学校级管理员（测试）');

SET @hzsf_uid = (SELECT user_id FROM sys_user WHERE user_name = 'hzsf_admin' LIMIT 1);
INSERT IGNORE INTO sys_user_role (user_id, role_id) VALUES (@hzsf_uid, 102);

SELECT 'Phase A 迁移完成' AS result;
