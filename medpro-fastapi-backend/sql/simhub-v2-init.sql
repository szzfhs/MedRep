-- =====================================================================
-- Schema v2 菜单 & 字典初始化 SQL
-- 依赖：simhub-init.sql 已执行完毕（menu_id 2000~2071 已存在）
-- 新增菜单 ID 范围：2008~2009（子模块）、2080~2099（按钮权限）
-- =====================================================================

SET NAMES utf8mb4;

-- =====================================================================
-- PART 1: 新增子模块菜单（实验系统管理 / 习题管理）
-- =====================================================================

INSERT IGNORE INTO `sys_menu`
  (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`,
   `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES
  -- 实验系统管理（目录菜单）
  (2008, '实验系统管理', 2000, 8, 'sim-system', 'simhub/simSystem/index', 1,
   0, 'C', '0', '0', 'simhub:simSystem:list', 'component', 'admin', NOW(), '实验系统管理'),
  -- 习题管理（目录菜单）
  (2009, '习题管理', 2000, 9, 'question', 'simhub/question/index', 1,
   0, 'C', '0', '0', 'simhub:question:list', 'edit', 'admin', NOW(), '习题管理');

-- =====================================================================
-- PART 2: 实验系统管理 按钮权限（2080~2084）
-- =====================================================================

INSERT IGNORE INTO `sys_menu`
  (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`,
   `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES
  (2080, '实验系统查询', 2008, 1, '', '', 1, 0, 'F', '0', '0', 'simhub:simSystem:list', '#', 'admin', NOW(), ''),
  (2081, '实验系统详情', 2008, 2, '', '', 1, 0, 'F', '0', '0', 'simhub:simSystem:query', '#', 'admin', NOW(), ''),
  (2082, '实验系统新增', 2008, 3, '', '', 1, 0, 'F', '0', '0', 'simhub:simSystem:add', '#', 'admin', NOW(), ''),
  (2083, '实验系统修改', 2008, 4, '', '', 1, 0, 'F', '0', '0', 'simhub:simSystem:edit', '#', 'admin', NOW(), ''),
  (2084, '实验系统删除', 2008, 5, '', '', 1, 0, 'F', '0', '0', 'simhub:simSystem:remove', '#', 'admin', NOW(), '');

-- =====================================================================
-- PART 3: 习题管理 按钮权限（2090~2094）
-- =====================================================================

INSERT IGNORE INTO `sys_menu`
  (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`,
   `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES
  (2090, '习题查询', 2009, 1, '', '', 1, 0, 'F', '0', '0', 'simhub:question:list', '#', 'admin', NOW(), ''),
  (2091, '习题详情', 2009, 2, '', '', 1, 0, 'F', '0', '0', 'simhub:question:query', '#', 'admin', NOW(), ''),
  (2092, '习题新增', 2009, 3, '', '', 1, 0, 'F', '0', '0', 'simhub:question:add', '#', 'admin', NOW(), ''),
  (2093, '习题修改', 2009, 4, '', '', 1, 0, 'F', '0', '0', 'simhub:question:edit', '#', 'admin', NOW(), ''),
  (2094, '习题删除', 2009, 5, '', '', 1, 0, 'F', '0', '0', 'simhub:question:remove', '#', 'admin', NOW(), '');

-- =====================================================================
-- PART 4: 为 simhub_admin (role_id=102) 授予新菜单权限
-- =====================================================================

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT 102, menu_id FROM `sys_menu`
WHERE menu_id IN (2008, 2009, 2080, 2081, 2082, 2083, 2084, 2090, 2091, 2092, 2093, 2094);

-- 教师角色(role_id=100)：仅查看权限
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT 100, menu_id FROM `sys_menu`
WHERE menu_id IN (2008, 2009, 2080, 2081, 2090, 2091);

-- =====================================================================
-- PART 5: 新增业务字典类型
-- =====================================================================

INSERT IGNORE INTO `sys_dict_type` (`dict_name`, `dict_type`, `status`, `create_by`, `create_time`, `remark`)
VALUES
  ('课程分类',      'vf_course_category',      '0', 'admin', NOW(), '1=理论课 2=实验课 3=理实一体化课'),
  ('课程状态',      'vf_course_status',        '0', 'admin', NOW(), '0=新建 1=已审核 2=已发布'),
  ('资源类型',      'vf_resource_type',        '0', 'admin', NOW(), 'courseware/lesson_plan/micro_video/ebook/extension'),
  ('习题题型',      'vf_question_type',        '0', 'admin', NOW(), 'single/multiple/fill/essay'),
  ('支持硬件设备',  'vf_hw_support',           '0', 'admin', NOW(), 'helmet/pc/zspace'),
  ('实验系统分类',  'vf_sim_system_category',  '0', 'admin', NOW(), 'web=Web实验 client=客户端');

-- =====================================================================
-- PART 6: 新增业务字典数据
-- =====================================================================

-- 课程分类字典数据
INSERT IGNORE INTO `sys_dict_data`
  (`dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `remark`)
VALUES
  (1, '理论课',       '1', 'vf_course_category', '', 'primary',   'N', '0', 'admin', NOW(), ''),
  (2, '实验课',       '2', 'vf_course_category', '', 'success',   'N', '0', 'admin', NOW(), ''),
  (3, '理实一体化课', '3', 'vf_course_category', '', 'warning',   'N', '0', 'admin', NOW(), '');

-- 课程状态字典数据
INSERT IGNORE INTO `sys_dict_data`
  (`dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `remark`)
VALUES
  (0, '新建',   '0', 'vf_course_status', '', 'info',    'N', '0', 'admin', NOW(), ''),
  (1, '已审核', '1', 'vf_course_status', '', 'warning', 'N', '0', 'admin', NOW(), ''),
  (2, '已发布', '2', 'vf_course_status', '', 'success', 'Y', '0', 'admin', NOW(), '');

-- 资源类型字典数据
INSERT IGNORE INTO `sys_dict_data`
  (`dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `remark`)
VALUES
  (1, '课件',     'courseware',   'vf_resource_type', '', 'primary', 'Y', '0', 'admin', NOW(), ''),
  (2, '教案',     'lesson_plan',  'vf_resource_type', '', 'success', 'N', '0', 'admin', NOW(), ''),
  (3, '微课视频', 'micro_video',  'vf_resource_type', '', 'info',    'N', '0', 'admin', NOW(), ''),
  (4, '电子书',   'ebook',        'vf_resource_type', '', 'warning', 'N', '0', 'admin', NOW(), ''),
  (5, '拓展资源', 'extension',    'vf_resource_type', '', 'danger',  'N', '0', 'admin', NOW(), '');

-- 习题题型字典数据
INSERT IGNORE INTO `sys_dict_data`
  (`dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `remark`)
VALUES
  (1, '单选题', 'single',   'vf_question_type', '', 'primary', 'Y', '0', 'admin', NOW(), ''),
  (2, '多选题', 'multiple', 'vf_question_type', '', 'success', 'N', '0', 'admin', NOW(), ''),
  (3, '填空题', 'fill',     'vf_question_type', '', 'warning', 'N', '0', 'admin', NOW(), ''),
  (4, '问答题', 'essay',    'vf_question_type', '', 'info',    'N', '0', 'admin', NOW(), '');

-- 支持硬件设备字典数据
INSERT IGNORE INTO `sys_dict_data`
  (`dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `remark`)
VALUES
  (1, 'VR头盔',   'helmet', 'vf_hw_support', '', 'primary', 'N', '0', 'admin', NOW(), ''),
  (2, '普通PC',   'pc',     'vf_hw_support', '', 'success', 'Y', '0', 'admin', NOW(), ''),
  (3, 'zSpace',   'zspace', 'vf_hw_support', '', 'info',    'N', '0', 'admin', NOW(), '');

-- 实验系统分类字典数据
INSERT IGNORE INTO `sys_dict_data`
  (`dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `remark`)
VALUES
  (1, 'Web实验', 'web',    'vf_sim_system_category', '', 'primary', 'Y', '0', 'admin', NOW(), ''),
  (2, '客户端',  'client', 'vf_sim_system_category', '', 'success', 'N', '0', 'admin', NOW(), '');

-- =====================================================================
-- 验收查询
-- =====================================================================
-- SELECT menu_id, menu_name, perms FROM sys_menu WHERE menu_id BETWEEN 2008 AND 2099 ORDER BY menu_id;
-- SELECT dict_type, COUNT(*) FROM sys_dict_data WHERE dict_type LIKE 'vf_%' GROUP BY dict_type;
