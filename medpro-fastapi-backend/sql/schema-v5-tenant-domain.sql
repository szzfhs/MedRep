-- ============================================================
-- Schema 升级 v5：vf_tenant 表新增 domain 字段
-- 二级域名（完整域名，如：hzsf.medpro.com）
-- ============================================================

ALTER TABLE vf_tenant
    ADD COLUMN domain VARCHAR(200) DEFAULT NULL COMMENT '租户完整二级域名（如：hzsf.medpro.com），用于门户访问';
