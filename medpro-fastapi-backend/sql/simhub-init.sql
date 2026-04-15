-- =====================================================================
-- SimHub 虚拟仿真实验教学平台 — 初始化 SQL
-- 包含：菜单项、权限字符串、SimHub 角色
-- 运行方式：仅需执行一次，支持幂等（INSERT IGNORE）
-- 执行顺序：在 ruoyi-fastapi.sql 已执行之后运行
-- =====================================================================

-- -----------------------------------------------------------------------
-- 1. SimHub 管理员角色（role_id=102）
--    role_id=100 教师、role_id=101 学生 已由基础SQL创建，此处补充管理员角色
-- -----------------------------------------------------------------------
INSERT IGNORE INTO sys_role
  (role_id, role_name, role_key, role_sort, data_scope,
   menu_check_strictly, dept_check_strictly, status, del_flag,
   create_by, create_time, update_by, update_time, remark)
VALUES
  (102, 'SimHub管理员', 'simhub_admin', 5, 1,
   1, 1, '0', '0',
   'admin', NOW(), '', NULL, 'SimHub虚拟仿真实验平台管理员');


-- -----------------------------------------------------------------------
-- 2. SimHub 菜单项（menu_id 范围：2000 – 2099）
--    字段顺序：menu_id, menu_name, parent_id, order_num, path, component,
--              query, route_name, is_frame, is_cache, menu_type,
--              visible, status, perms, icon,
--              create_by, create_time, update_by, update_time, remark
-- -----------------------------------------------------------------------

-- 2-1. 一级目录
INSERT IGNORE INTO sys_menu VALUES
  (2000, 'SimHub管理', 0, 5, 'simhub', NULL, '', '', 1, 0, 'M', '0', '0', '', 'education',
   'admin', NOW(), '', NULL, 'SimHub虚拟仿真实验教学平台');

-- 2-2. 二级菜单（C = 页面菜单）
INSERT IGNORE INTO sys_menu VALUES
  (2001, '中心简介', 2000, 1, 'center',     'simhub/center/index',     '', '', 1, 0, 'C', '0', '0', 'simhub:center:query',     'home',      'admin', NOW(), '', NULL, '中心简介管理菜单'),
  (2002, '新闻动态', 2000, 2, 'news',       'simhub/news/index',       '', '', 1, 0, 'C', '0', '0', 'simhub:news:list',        'message',   'admin', NOW(), '', NULL, '新闻动态管理菜单'),
  (2003, '规章制度', 2000, 3, 'regulation', 'simhub/regulation/index', '', '', 1, 0, 'C', '0', '0', 'simhub:regulation:list',  'document',  'admin', NOW(), '', NULL, '规章制度管理菜单'),
  (2004, '实验管理', 2000, 4, 'experiment', 'simhub/experiment/index', '', '', 1, 0, 'C', '0', '0', 'simhub:experiment:list',  'experiment','admin', NOW(), '', NULL, '虚拟实验管理菜单'),
  (2005, '课程管理', 2000, 5, 'course',     'simhub/course/index',     '', '', 1, 0, 'C', '0', '0', 'simhub:course:list',      'online',    'admin', NOW(), '', NULL, '课程管理菜单'),
  (2006, '资源管理', 2000, 6, 'resource',   'simhub/resource/index',   '', '', 1, 0, 'C', '0', '0', 'simhub:resource:list',    'upload',    'admin', NOW(), '', NULL, '资源管理菜单'),
  (2007, '个人档案', 2000, 7, 'profile',    'simhub/profile/index',    '', '', 1, 0, 'C', '0', '0', 'simhub:profile:query',    'user',      'admin', NOW(), '', NULL, '个人档案管理菜单');

-- 2-3. 功能按钮（F = 按钮）

-- 中心简介按钮（parent=2001）
INSERT IGNORE INTO sys_menu VALUES
  (2010, '中心查询', 2001, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:center:query', '#', 'admin', NOW(), '', NULL, ''),
  (2011, '中心修改', 2001, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:center:edit',  '#', 'admin', NOW(), '', NULL, '');

-- 新闻动态按钮（parent=2002）
INSERT IGNORE INTO sys_menu VALUES
  (2020, '新闻查询', 2002, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:news:list',   '#', 'admin', NOW(), '', NULL, ''),
  (2021, '新闻详情', 2002, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:news:query',  '#', 'admin', NOW(), '', NULL, ''),
  (2022, '新闻新增', 2002, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:news:add',    '#', 'admin', NOW(), '', NULL, ''),
  (2023, '新闻修改', 2002, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:news:edit',   '#', 'admin', NOW(), '', NULL, ''),
  (2024, '新闻删除', 2002, 5, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:news:remove', '#', 'admin', NOW(), '', NULL, '');

-- 规章制度按钮（parent=2003）
INSERT IGNORE INTO sys_menu VALUES
  (2030, '制度查询', 2003, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:regulation:list',   '#', 'admin', NOW(), '', NULL, ''),
  (2031, '制度详情', 2003, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:regulation:query',  '#', 'admin', NOW(), '', NULL, ''),
  (2032, '制度新增', 2003, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:regulation:add',    '#', 'admin', NOW(), '', NULL, ''),
  (2033, '制度修改', 2003, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:regulation:edit',   '#', 'admin', NOW(), '', NULL, ''),
  (2034, '制度删除', 2003, 5, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:regulation:remove', '#', 'admin', NOW(), '', NULL, '');

-- 实验管理按钮（parent=2004）
INSERT IGNORE INTO sys_menu VALUES
  (2040, '实验查询', 2004, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:experiment:list',   '#', 'admin', NOW(), '', NULL, ''),
  (2041, '实验详情', 2004, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:experiment:query',  '#', 'admin', NOW(), '', NULL, ''),
  (2042, '实验新增', 2004, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:experiment:add',    '#', 'admin', NOW(), '', NULL, ''),
  (2043, '实验修改', 2004, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:experiment:edit',   '#', 'admin', NOW(), '', NULL, ''),
  (2044, '实验删除', 2004, 5, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:experiment:remove', '#', 'admin', NOW(), '', NULL, '');

-- 课程管理按钮（parent=2005）
INSERT IGNORE INTO sys_menu VALUES
  (2050, '课程查询', 2005, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:course:list',   '#', 'admin', NOW(), '', NULL, ''),
  (2051, '课程详情', 2005, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:course:query',  '#', 'admin', NOW(), '', NULL, ''),
  (2052, '课程新增', 2005, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:course:add',    '#', 'admin', NOW(), '', NULL, ''),
  (2053, '课程修改', 2005, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:course:edit',   '#', 'admin', NOW(), '', NULL, ''),
  (2054, '课程删除', 2005, 5, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:course:remove', '#', 'admin', NOW(), '', NULL, '');

-- 资源管理按钮（parent=2006）
INSERT IGNORE INTO sys_menu VALUES
  (2060, '资源查询', 2006, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:resource:list',   '#', 'admin', NOW(), '', NULL, ''),
  (2061, '资源详情', 2006, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:resource:query',  '#', 'admin', NOW(), '', NULL, ''),
  (2062, '资源新增', 2006, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:resource:add',    '#', 'admin', NOW(), '', NULL, ''),
  (2063, '资源修改', 2006, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:resource:edit',   '#', 'admin', NOW(), '', NULL, ''),
  (2064, '资源删除', 2006, 5, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:resource:remove', '#', 'admin', NOW(), '', NULL, '');

-- 个人档案按钮（parent=2007）
INSERT IGNORE INTO sys_menu VALUES
  (2070, '档案查询', 2007, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:profile:query', '#', 'admin', NOW(), '', NULL, ''),
  (2071, '档案修改', 2007, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'simhub:profile:edit',  '#', 'admin', NOW(), '', NULL, '');


-- -----------------------------------------------------------------------
-- 3. 角色-菜单关联（sys_role_menu）
-- -----------------------------------------------------------------------

-- SimHub 管理员（102）：拥有所有 SimHub 菜单权限
INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES
  -- 目录和菜单页面
  (102, 2000), (102, 2001), (102, 2002), (102, 2003),
  (102, 2004), (102, 2005), (102, 2006), (102, 2007),
  -- 中心简介
  (102, 2010), (102, 2011),
  -- 新闻动态
  (102, 2020), (102, 2021), (102, 2022), (102, 2023), (102, 2024),
  -- 规章制度
  (102, 2030), (102, 2031), (102, 2032), (102, 2033), (102, 2034),
  -- 实验管理
  (102, 2040), (102, 2041), (102, 2042), (102, 2043), (102, 2044),
  -- 课程管理
  (102, 2050), (102, 2051), (102, 2052), (102, 2053), (102, 2054),
  -- 资源管理
  (102, 2060), (102, 2061), (102, 2062), (102, 2063), (102, 2064),
  -- 个人档案
  (102, 2070), (102, 2071);

-- 教师（100）：课程管理（增删改查）+ 实验查询 + 个人档案
INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES
  (100, 2000), (100, 2004), (100, 2005), (100, 2007),
  -- 实验查询/详情
  (100, 2040), (100, 2041),
  -- 课程查询/详情/新增/修改/删除
  (100, 2050), (100, 2051), (100, 2052), (100, 2053), (100, 2054),
  -- 个人档案查询/修改
  (100, 2070), (100, 2071);

-- 学生（101）：实验/课程查询 + 个人档案
INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES
  (101, 2000), (101, 2004), (101, 2005), (101, 2007),
  -- 实验查询/详情
  (101, 2040), (101, 2041),
  -- 课程查询/详情
  (101, 2050), (101, 2051),
  -- 个人档案查询/修改
  (101, 2070), (101, 2071);


-- -----------------------------------------------------------------------
-- 4. 样例初始化数据（可选，用于接口联调测试）
-- -----------------------------------------------------------------------

-- 中心简介初始数据（仅当表为空时插入）
INSERT IGNORE INTO vf_center_info
  (id, center_name, center_slogan, description, update_by, update_time)
SELECT 1, '虚拟仿真实验中心', '以虚拟仿真技术，赋能医学教育创新', '<p>本中心专注于医学虚拟仿真实验教学，致力于提升学生实操能力。</p>', 'admin', NOW()
WHERE NOT EXISTS (SELECT 1 FROM vf_center_info WHERE id = 1);

-- 实验分类初始数据
INSERT IGNORE INTO vf_experiment_category (category_id, category_name, parent_id, sort_order, status)
VALUES
  (1, '基础医学', 0, 1, '0'),
  (2, '临床技能', 0, 2, '0'),
  (3, '护理操作', 0, 3, '0'),
  (4, '解剖学',   1, 1, '0'),
  (5, '生理学',   1, 2, '0'),
  (6, '外科技能', 2, 1, '0'),
  (7, '内科诊断', 2, 2, '0');

-- 示例新闻（仅当表为空时插入）
INSERT IGNORE INTO vf_news
  (news_id, title, summary, content, status, view_count, publish_time, create_by, create_time, del_flag)
SELECT 1, '虚拟仿真实验中心正式上线', '平台经过全面测试，正式对全体师生开放使用。',
  '<p>欢迎使用虚拟仿真实验教学平台！</p>', '1', 0, NOW(), 'admin', NOW(), '0'
WHERE NOT EXISTS (SELECT 1 FROM vf_news WHERE news_id = 1);

-- 示例实验
INSERT IGNORE INTO vf_experiment
  (exp_id, exp_name, category_id, exp_type, description, status, sort_order, create_by, create_time, del_flag)
SELECT 1, '心肺复苏（CPR）虚拟实验', 6, 'web',
  '<p>通过虚拟仿真环境学习标准心肺复苏操作流程。</p>', '0', 1, 'admin', NOW(), '0'
WHERE NOT EXISTS (SELECT 1 FROM vf_experiment WHERE exp_id = 1);

-- 示例课程
INSERT IGNORE INTO vf_course
  (course_id, course_name, description, category, status, sort_order, create_by, create_time, del_flag)
SELECT 1, '外科基本技能训练', '<p>本课程覆盖外科基本操作技能的系统训练。</p>', '临床技能', '0', 1, 'admin', NOW(), '0'
WHERE NOT EXISTS (SELECT 1 FROM vf_course WHERE course_id = 1);
