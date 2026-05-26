-- =====================================================================
-- SimHub v4-resources — 资源中心模拟数据
-- 依赖：simhub-init.sql / schema-v4-course-fields.sql 已执行
--       课程(course_id 1-6)和章节由 schema-v4 负责，此文件不重复插入
-- 幂等：INSERT IGNORE；section_id 用子查询动态绑定
-- =====================================================================

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- =====================================================================
-- PART 1: 资源分类 (vf_resource_category)
-- =====================================================================

INSERT IGNORE INTO `vf_resource_category`
  (`category_id`, `category_name`, `parent_id`, `sort_order`, `status`)
VALUES
  (1, '人体解剖学',   0, 1, '0'),
  (2, '基础生理学',   0, 2, '0'),
  (3, '病原微生物学', 0, 3, '0'),
  (4, '临床医学',     0, 4, '0'),
  (5, '药理学',       0, 5, '0'),
  (6, '外科学',       0, 6, '0');

-- =====================================================================
-- PART 2: 教学资源 (vf_resource)
-- section_id 暂不在 INSERT 中指定，由 PART 3 子查询 UPDATE 绑定
-- =====================================================================

-- ——— 2A: 电子书 resource_type = ebook ———————————————————————————————

INSERT IGNORE INTO `vf_resource`
  (`resource_id`, `resource_name`, `resource_content`, `file_format`,
   `resource_type`, `file_url`, `cover_image`, `description`,
   `file_size`, `duration`, `category_id`, `course_id`,
   `allow_download`, `download_count`, `view_count`, `status`,
   `create_by`, `create_time`, `del_flag`)
VALUES
  (1, '人体解剖学（第9版）数字教材', '人卫版第九版解剖学教材，含全彩图谱及三维交互模型',
   'pdf', 'ebook', '/uploads/ebooks/anatomy_9e.pdf', '',
   '人民卫生出版社·第9版·含全彩插图与3D模型链接，适用于基础医学各专业',
   47395046, NULL, 1, 1, '0', 2341, 5682, '0', 'admin', NOW(), '0'),

  (2, '生理学（第9版）数字教材', '朱文玉主编，人卫第九版生理学，含实验视频二维码',
   'pdf', 'ebook', '/uploads/ebooks/physiology_9e.pdf', '',
   '人民卫生出版社·第9版·含在线实验视频资源链接',
   40478515, NULL, 1, 2, '0', 1876, 4321, '0', 'admin', NOW(), '0'),

  (3, '病理学（第9版）数字教材', '步宏、李一雷主编，人卫第九版病理学',
   'pdf', 'ebook', '/uploads/ebooks/pathology_9e.pdf', '',
   '人民卫生出版社·第9版·含病理图谱与数字切片资源',
   35651584, NULL, 1, NULL, '0', 1234, 3105, '0', 'admin', NOW(), '0'),

  (4, '药理学（第8版）数字教材', '杨宝峰主编，人卫第八版药理学',
   'pdf', 'ebook', '/uploads/ebooks/pharmacology_8e.pdf', '',
   '人民卫生出版社·第8版·配套药理学虚拟实验课程',
   37480448, NULL, 1, 5, '0', 987, 2456, '0', 'admin', NOW(), '0'),

  (5, '微生物学（第8版）数字教材', '李凡、徐志凯主编，人卫第八版医学微生物学',
   'pdf', 'ebook', '/uploads/ebooks/microbiology_8e.pdf', '',
   '人民卫生出版社·第8版·含微生物实验操作视频资源',
   34078720, NULL, 1, 3, '0', 1432, 3210, '0', 'admin', NOW(), '0'),

  (6, '外科学（第9版）数字教材', '陈孝平、汪建平主编，人卫第九版外科学',
   'pdf', 'ebook', '/uploads/ebooks/surgery_9e.pdf', '',
   '人民卫生出版社·第9版·含手术操作视频与3D解剖图谱',
   54857267, NULL, 1, 6, '0', 1654, 3987, '0', 'admin', NOW(), '0'),

  (7, '诊断学（第9版）数字教材', '万学红、卢雪峰主编，人卫第九版诊断学',
   'pdf', 'ebook', '/uploads/ebooks/diagnostics_9e.pdf', '',
   '人民卫生出版社·第9版·含心肺听诊音频、体格检查视频资源',
   43876966, NULL, 1, 4, '0', 3218, 7654, '0', 'admin', NOW(), '0');

-- ——— 2B: 实验课件 resource_type = courseware —————————————————————————

INSERT IGNORE INTO `vf_resource`
  (`resource_id`, `resource_name`, `resource_content`, `file_format`,
   `resource_type`, `file_url`, `cover_image`, `description`,
   `file_size`, `duration`, `category_id`, `course_id`,
   `allow_download`, `download_count`, `view_count`, `status`,
   `create_by`, `create_time`, `del_flag`)
VALUES
  (10, '运动系统骨骼与关节—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c1_s1_skeletal.pptx', NULL,
   '运动系统骨骼与关节章节配套课件，含骨骼三维动画演示',
   25690803, NULL, 2, 1, '0', 456, 1203, '0', 'admin', NOW(), '0'),

  (11, '循环系统心脏解剖—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c1_s5_heart.pptx', NULL,
   '心脏解剖章节课件，含三维立体心脏结构图解',
   31457280, NULL, 2, 1, '0', 892, 2341, '0', 'admin', NOW(), '0'),

  (12, '神经系统中枢神经解剖—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c1_s9_nervous.pptx', NULL,
   '大脑、脑干、小脑、脊髓结构综合课件',
   28311552, NULL, 2, 1, '0', 623, 1567, '0', 'admin', NOW(), '0'),

  (13, '心血管生理调节—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c2_s5_cvs.pptx', NULL,
   '心血管生理与调节机制，含压力感受器反射动画',
   22020096, NULL, 2, 2, '0', 378, 987, '0', 'admin', NOW(), '0'),

  (14, '呼吸生理调节—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c2_s6_resp.pptx', NULL,
   '呼吸生理章节课件，含肺容量测定实验内容',
   19922944, NULL, 2, 2, '0', 312, 876, '0', 'admin', NOW(), '0'),

  (15, '细菌形态学观察—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c3_s2_morphology.pptx', NULL,
   '细菌形态与染色技术课件，含革兰染色步骤图解',
   17825792, NULL, 2, 3, '0', 267, 723, '0', 'admin', NOW(), '0'),

  (16, '药物敏感性试验（K-B法）—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c3_s6_drugtest.pptx', NULL,
   '抗生素药敏试验Kirby-Bauer纸片法课件',
   15728640, NULL, 2, 3, '0', 198, 543, '0', 'admin', NOW(), '0'),

  (17, '心肺听诊技能—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c4_s4_auscultation.pptx', NULL,
   '心肺听诊技能课件，含30个经典听诊音例',
   35651584, NULL, 2, 4, '0', 1124, 3456, '0', 'admin', NOW(), '0'),

  (18, '急救基本操作（含CPR）—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c4_s7_cpr.pptx', NULL,
   '成人、儿童CPR规范及常见急救操作课件，符合2020 AHA指南',
   29360128, NULL, 2, 4, '0', 987, 2876, '0', 'admin', NOW(), '0'),

  (19, '量效关系与毒效关系分析—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c5_s3_dose_effect.pptx', NULL,
   '量效曲线、半数有效量ED50、治疗指数TI分析课件',
   18874368, NULL, 2, 5, '0', 234, 678, '0', 'admin', NOW(), '0'),

  (20, '外科缝合技术与打结—课件', NULL, 'pptx', 'courseware',
   '/uploads/courseware/c6_s5_suture.pptx', NULL,
   '各类缝合技术及外科打结图文课件，含间断、连续、减张缝合详解',
   26214400, NULL, 2, 6, '0', 567, 1432, '0', 'admin', NOW(), '0');

-- ——— 2C: 教案 resource_type = lesson_plan ———————————————————————————

INSERT IGNORE INTO `vf_resource`
  (`resource_id`, `resource_name`, `resource_content`, `file_format`,
   `resource_type`, `file_url`, `cover_image`, `description`,
   `file_size`, `duration`, `category_id`, `course_id`,
   `allow_download`, `download_count`, `view_count`, `status`,
   `create_by`, `create_time`, `del_flag`)
VALUES
  (30, '人体解剖学虚拟实验课程—完整教案', NULL, 'docx', 'lesson_plan',
   '/uploads/lesson_plan/course1_lesson_plan.docx', NULL,
   '人体解剖学虚拟实验课程教学大纲与完整教案，共12章',
   1048576, NULL, 3, 1, '0', 89, 234, '0', 'admin', NOW(), '0'),

  (31, '基础生理学实验课程—完整教案', NULL, 'docx', 'lesson_plan',
   '/uploads/lesson_plan/course2_lesson_plan.docx', NULL,
   '基础生理学实验课程教学大纲与完整教案，共10章',
   983040, NULL, 3, 2, '0', 76, 198, '0', 'admin', NOW(), '0'),

  (32, '病原微生物学实验—完整教案', NULL, 'docx', 'lesson_plan',
   '/uploads/lesson_plan/course3_lesson_plan.docx', NULL,
   '病原微生物学实验教学大纲与实验教案，共8章',
   786432, NULL, 3, 3, '0', 54, 143, '0', 'admin', NOW(), '0'),

  (33, '临床技能综合训练—完整教案', NULL, 'docx', 'lesson_plan',
   '/uploads/lesson_plan/course4_lesson_plan.docx', NULL,
   '临床技能综合训练教学大纲与教案，含操作评分标准',
   1310720, NULL, 3, 4, '0', 123, 367, '0', 'admin', NOW(), '0'),

  (34, '药理学虚拟实验课程—完整教案', NULL, 'docx', 'lesson_plan',
   '/uploads/lesson_plan/course5_lesson_plan.docx', NULL,
   '药理学虚拟实验课程教学大纲与实验教案，共9章',
   851968, NULL, 3, 5, '0', 48, 134, '0', 'admin', NOW(), '0'),

  (35, '外科手术基础技能—完整教案', NULL, 'docx', 'lesson_plan',
   '/uploads/lesson_plan/course6_lesson_plan.docx', NULL,
   '外科手术基础技能课程教学大纲与教案，含VR实验教学设计',
   1114112, NULL, 3, 6, '0', 67, 187, '0', 'admin', NOW(), '0');

-- ——— 2D: 教学微视频 resource_type = micro_video ———————————————————————

INSERT IGNORE INTO `vf_resource`
  (`resource_id`, `resource_name`, `resource_content`, `file_format`,
   `resource_type`, `file_url`, `cover_image`, `description`,
   `file_size`, `duration`, `category_id`, `course_id`,
   `allow_download`, `download_count`, `view_count`, `status`,
   `create_by`, `create_time`, `del_flag`)
VALUES
  (40, '心脏解剖操作演示视频', NULL, 'mp4', 'micro_video',
   '/uploads/video/heart_anatomy_demo.mp4', NULL,
   '专业解剖操作视频，4K高清录制，时长42分钟',
   536870912, 2520, 4, 1, '0', 1876, 4532, '0', 'admin', NOW(), '0'),

  (41, '心肺复苏（CPR）标准操作视频', NULL, 'mp4', 'micro_video',
   '/uploads/video/cpr_standard_op.mp4', NULL,
   '符合2020 AHA心肺复苏指南的标准操作演示视频，时长28分钟',
   314572800, 1680, 4, 4, '0', 2897, 6784, '0', 'admin', NOW(), '0'),

  (42, '无菌操作技术全流程演示', NULL, 'mp4', 'micro_video',
   '/uploads/video/aseptic_technique.mp4', NULL,
   '手术室无菌操作：刷手、穿手术衣、戴无菌手套全流程，时长18分钟',
   209715200, 1080, 4, 6, '0', 1234, 3456, '0', 'admin', NOW(), '0'),

  (43, '外科缝合打结技术演示', NULL, 'mp4', 'micro_video',
   '/uploads/video/suture_knot_demo.mp4', NULL,
   '常用缝合方式及外科打结（单手结、双手结、器械结）演示，时长35分钟',
   367001600, 2100, 4, 6, '0', 1543, 3897, '0', 'admin', NOW(), '0'),

  (44, '心肺听诊音频库—正常与异常对比', NULL, 'mp4', 'micro_video',
   '/uploads/video/auscultation_sounds.mp4', NULL,
   '30个心肺听诊音频合集：正常心音、各种杂音、异常呼吸音，时长22分钟',
   262144000, 1320, 4, 4, '0', 2134, 5432, '0', 'admin', NOW(), '0'),

  (45, '微生物革兰染色实验操作视频', NULL, 'mp4', 'micro_video',
   '/uploads/video/gram_staining.mp4', NULL,
   '革兰染色全流程实验操作视频，含常见错误及纠正，时长15分钟',
   167772160, 900, 4, 3, '0', 876, 2123, '0', 'admin', NOW(), '0'),

  (46, '药物受体结合三维动画', NULL, 'mp4', 'micro_video',
   '/uploads/video/drug_receptor_animation.mp4', NULL,
   '药物分子与受体结合机制3D动画，展示激动剂、拮抗剂作用，时长12分钟',
   134217728, 720, 4, 5, '0', 654, 1654, '0', 'admin', NOW(), '0'),

  (47, '生理学心血管调节反射演示', NULL, 'mp4', 'micro_video',
   '/uploads/video/cardiovascular_reflex.mp4', NULL,
   '压力感受器反射、化学感受器反射等心血管调节机制演示动画，时长20分钟',
   230686720, 1200, 4, 2, '0', 543, 1432, '0', 'admin', NOW(), '0');

-- ——— 2E: 拓展资料 resource_type = extension ——————————————————————————

INSERT IGNORE INTO `vf_resource`
  (`resource_id`, `resource_name`, `resource_content`, `file_format`,
   `resource_type`, `file_url`, `cover_image`, `description`,
   `file_size`, `duration`, `category_id`, `course_id`,
   `allow_download`, `download_count`, `view_count`, `status`,
   `create_by`, `create_time`, `del_flag`)
VALUES
  (50, 'Netter人体解剖学图谱—精选', NULL, 'pdf', 'extension',
   '/uploads/extension/netter_anatomy_selected.pdf', NULL,
   'Frank H. Netter医学插图精选，涵盖人体主要系统解剖结构，供自学参考',
   10485760, NULL, 5, 1, '0', 1234, 3210, '0', 'admin', NOW(), '0'),

  (51, '心电图判读速查手册', NULL, 'pdf', 'extension',
   '/uploads/extension/ecg_quick_reference.pdf', NULL,
   '临床常见心电图波形识别与判读指南，含正常/异常对比图例',
   5242880, NULL, 5, 4, '0', 1876, 4321, '0', 'admin', NOW(), '0'),

  (52, '外科学手术解剖学参考图谱', NULL, 'pdf', 'extension',
   '/uploads/extension/surgical_anatomy_atlas.pdf', NULL,
   '外科手术相关局部解剖重点，帮助理解手术路径与风险区域',
   8388608, NULL, 5, 6, '0', 765, 1987, '0', 'admin', NOW(), '0'),

  (53, '常用抗菌药物药敏数据速查表', NULL, 'pdf', 'extension',
   '/uploads/extension/antibiotic_resistance_ref.pdf', NULL,
   '中国临床常见菌对各类抗菌药物敏感性参考数据（CHINET年度报告摘要）',
   3145728, NULL, 5, 3, '0', 432, 1123, '0', 'admin', NOW(), '0'),

  (54, '药代动力学公式汇总与计算工具', NULL, 'pdf', 'extension',
   '/uploads/extension/pk_formulas.pdf', NULL,
   '药代动力学常用公式速查表，含半衰期、表观分布容积、清除率计算示例',
   2097152, NULL, 5, 5, '0', 321, 876, '0', 'admin', NOW(), '0'),

  (55, '临床体格检查结果记录模板', NULL, 'docx', 'extension',
   '/uploads/extension/physical_exam_template.docx', NULL,
   '标准化临床体格检查记录表模板（WORD格式），供学生实习报告使用',
   524288, NULL, 5, 4, '0', 1987, 4567, '0', 'admin', NOW(), '0'),

  (56, '生理学实验报告撰写规范与模板', NULL, 'docx', 'extension',
   '/uploads/extension/physiology_report_template.docx', NULL,
   '基础生理学实验报告格式规范说明及空白报告模板',
   471859, NULL, 5, 2, '0', 1098, 2765, '0', 'admin', NOW(), '0');

-- =====================================================================
-- PART 2.5: 按医学专业课程绑定 category_id
--   course_id 1→人体解剖学(1)  2→基础生理学(2)  3→病原微生物学(3)
--             4→临床医学(4)    5→药理学(5)      6→外科学(6)
--   NULL course_id 归入人体解剖学(1)
-- =====================================================================

UPDATE `vf_resource` SET `category_id`=1 WHERE `course_id`=1;
UPDATE `vf_resource` SET `category_id`=2 WHERE `course_id`=2;
UPDATE `vf_resource` SET `category_id`=3 WHERE `course_id`=3;
UPDATE `vf_resource` SET `category_id`=4 WHERE `course_id`=4;
UPDATE `vf_resource` SET `category_id`=5 WHERE `course_id`=5;
UPDATE `vf_resource` SET `category_id`=6 WHERE `course_id`=6;
UPDATE `vf_resource` SET `category_id`=1 WHERE `course_id` IS NULL AND `resource_type`='ebook';

-- =====================================================================
-- PART 3: 绑定章节 section_id — 子查询动态匹配，兼容任意 auto_increment 值
--         依赖 schema-v4-course-fields.sql 已插入章节数据
-- =====================================================================


-- 课件绑定
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=1 AND `title`='运动系统：骨骼与关节' LIMIT 1) WHERE `resource_id`=10;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=1 AND `title`='循环系统：心脏解剖' LIMIT 1) WHERE `resource_id`=11;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=1 AND `title`='神经系统：中枢神经' LIMIT 1) WHERE `resource_id`=12;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=2 AND `title`='心血管生理' LIMIT 1) WHERE `resource_id`=13;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=2 AND `title`='呼吸生理' LIMIT 1) WHERE `resource_id`=14;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=3 AND `title`='细菌形态学观察' LIMIT 1) WHERE `resource_id`=15;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=3 AND `title`='药物敏感性试验' LIMIT 1) WHERE `resource_id`=16;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=4 AND `title`='心肺听诊技能' LIMIT 1) WHERE `resource_id`=17;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=4 AND `title`='急救基本操作' LIMIT 1) WHERE `resource_id`=18;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=5 AND `title`='量效关系与毒效关系' LIMIT 1) WHERE `resource_id`=19;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=6 AND `title`='缝合技术与打结' LIMIT 1) WHERE `resource_id`=20;

-- 微视频绑定
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=1 AND `title`='循环系统：心脏解剖' LIMIT 1) WHERE `resource_id`=40;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=4 AND `title`='急救基本操作' LIMIT 1) WHERE `resource_id`=41;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=6 AND `title`='无菌操作技术' LIMIT 1) WHERE `resource_id`=42;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=6 AND `title`='缝合技术与打结' LIMIT 1) WHERE `resource_id`=43;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=4 AND `title`='心肺听诊技能' LIMIT 1) WHERE `resource_id`=44;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=3 AND `title`='细菌形态学观察' LIMIT 1) WHERE `resource_id`=45;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=5 AND `title`='受体与药物相互作用' LIMIT 1) WHERE `resource_id`=46;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=2 AND `title`='心血管生理' LIMIT 1) WHERE `resource_id`=47;

-- 拓展资料绑定
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=1 AND `title`='运动系统：骨骼与关节' LIMIT 1) WHERE `resource_id`=50;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=4 AND `title`='心肺听诊技能' LIMIT 1) WHERE `resource_id`=51;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=6 AND `title`='外科基本原则与手术室规范' LIMIT 1) WHERE `resource_id`=52;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=3 AND `title`='药物敏感性试验' LIMIT 1) WHERE `resource_id`=53;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=5 AND `title`='药物作用的基本原理' LIMIT 1) WHERE `resource_id`=54;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=4 AND `title`='一般状态体格检查' LIMIT 1) WHERE `resource_id`=55;
UPDATE `vf_resource` SET `section_id` = (SELECT `section_id` FROM `vf_course_section` WHERE `course_id`=2 AND `title`='绪论：生理学研究方法' LIMIT 1) WHERE `resource_id`=56;

-- =====================================================================
-- PART 4: 同步课程资源计数 (total_resources)
-- =====================================================================

UPDATE `vf_course` SET `total_resources` = (
  SELECT COUNT(*) FROM `vf_resource`
  WHERE `vf_resource`.`course_id` = `vf_course`.`course_id`
    AND `vf_resource`.`del_flag` = '0'
    AND `vf_resource`.`status`   = '0'
) WHERE `course_id` IN (1, 2, 3, 4, 5, 6);

SET foreign_key_checks = 1;

-- =====================================================================
-- 完成摘要:
--   vf_resource_category : 5 条
--   vf_resource:
--     ebook        7 条 (ID 1-7)   → 数字教材书架
--     courseware  11 条 (ID 10-20) → 绑定课程章节
--     lesson_plan  6 条 (ID 30-35) → 按课程挂载
--     micro_video  8 条 (ID 40-47) → 绑定课程章节
--     extension    7 条 (ID 50-56) → 绑定课程章节
--              合计 39 条
-- =====================================================================
