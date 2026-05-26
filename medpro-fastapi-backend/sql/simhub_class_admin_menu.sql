-- =====================================================
-- SimHub 行政班级管理 - 菜单和权限配置
-- 创建日期: 2026-05-26
-- 菜单 ID 范围: 2015 (主菜单) 2110~2114 (按钮)
-- =====================================================

SET NAMES utf8mb4;

-- =====================================================
-- PART 1: 主菜单（行政班级管理）
-- =====================================================

INSERT IGNORE INTO `sys_menu`
  (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`,
   `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES
  -- 行政班级管理（目录菜单）- 放在 SimHub管理 (menu_id=2000) 下
  (2015, '行政班级管理', 2000, 15, 'class-admin', 'simhub/class-admin/index', 1,
   0, 'C', '0', '0', 'simhub:classAdmin:list', 'peoples', 'admin', NOW(), '行政班级管理');

-- =====================================================
-- PART 2: 行政班级管理 按钮权限（2110~2114）
-- =====================================================

INSERT IGNORE INTO `sys_menu`
  (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`,
   `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES
  (2110, '班级查询', 2015, 1, '', '', 1, 0, 'F', '0', '0', 'simhub:classAdmin:list', '#', 'admin', NOW(), ''),
  (2111, '班级详情', 2015, 2, '', '', 1, 0, 'F', '0', '0', 'simhub:classAdmin:query', '#', 'admin', NOW(), ''),
  (2112, '班级新增', 2015, 3, '', '', 1, 0, 'F', '0', '0', 'simhub:classAdmin:add', '#', 'admin', NOW(), ''),
  (2113, '班级修改', 2015, 4, '', '', 1, 0, 'F', '0', '0', 'simhub:classAdmin:edit', '#', 'admin', NOW(), ''),
  (2114, '班级删除', 2015, 5, '', '', 1, 0, 'F', '0', '0', 'simhub:classAdmin:remove', '#', 'admin', NOW(), '');

-- =====================================================
-- PART 3: 为 simhub_admin (role_id=102) 授予新菜单权限
-- =====================================================

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT 102, menu_id FROM `sys_menu`
WHERE menu_id IN (2015, 2110, 2111, 2112, 2113, 2114);

-- 为 admin 角色(role_id=1) 授予权限
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT 1, menu_id FROM `sys_menu`
WHERE menu_id IN (2015, 2110, 2111, 2112, 2113, 2114);

-- =====================================================
-- PART 4: 字典类型配置（如需要）
-- =====================================================

-- INSERT IGNORE INTO `sys_dict_type` (`dict_name`, `dict_type`, `status`, `create_by`, `create_time`, `remark`)
-- VALUES
--   ('学生状态', 'vf_student_status', '0', 'admin', NOW(), '0=在读 1=休学 2=退学 3=毕业');

-- INSERT IGNORE INTO `sys_dict_data` (`dict_code`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `remark`)
-- VALUES
--   (NULL, 1, '在读', '0', 'vf_student_status', '', 'success', 'Y', '0', 'admin', NOW(), ''),
--   (NULL, 2, '休学', '1', 'vf_student_status', '', 'warning', 'N', '0', 'admin', NOW(), ''),
--   (NULL, 3, '退学', '2', 'vf_student_status', '', 'danger', 'N', '0', 'admin', NOW(), ''),
--   (NULL, 4, '毕业', '3', 'vf_student_status', '', 'info', 'N', '0', 'admin', NOW(), '');

-- =====================================================
-- 提示：执行完后重启后端服务，并在前端清除浏览器缓存
-- =====================================================
