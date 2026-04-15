# SimHub 迭代开发计划总览 (PLANS.md)

## 项目名称
**SimHub 虚拟仿真实验教学平台**

## 迭代路线图

| 阶段 | 名称 | 执行计划 | 状态 |
|------|------|----------|------|
| Phase 0 | 文档架构 & 数据库设计 | — | ✅ 已完成 |
| Phase 1 | 后端 SimHub 模块 | [phase1-backend.md](exec-plans/active/phase1-backend.md) | 🔄 主体完成，待闭环 |
| Phase 2 | 管理前端 SimHub 扩展 | [phase2-admin-frontend.md](exec-plans/active/phase2-admin-frontend.md) | 🔄 主体完成，待闭环 |
| Phase 3 | 门户前端 (medpro-fastapi-portal) | [phase3-portal-frontend.md](exec-plans/active/phase3-portal-frontend.md) | 🔄 主体完成，待闭环 |
| Phase 4 | 教师端功能 | [phase4-teacher-portal.md](exec-plans/active/phase4-teacher-portal.md) | ⏳ 待开始 |
| Phase 5 | 学生端功能 | [phase5-student-portal.md](exec-plans/active/phase5-student-portal.md) | ⏳ 待开始 |
| Phase 6 | 集成测试 & 上线部署 | [phase6-integration-deploy.md](exec-plans/active/phase6-integration-deploy.md) | ⏳ 待开始 |

## 迭代原则

1. **每个 Phase 必须闭环才开始下一个** — 验收标准见各执行计划末尾
2. **Phase 1 → Phase 2/3 可并行** — 后端完成后，管理前端和门户前端可同步推进
3. **Phase 4/5 依赖 Phase 3** — 教师/学生端复用门户基础设施
4. **Phase 6 是最终收尾** — 等所有功能完成后统一测试部署

## 当前活跃执行计划

见 `docs/exec-plans/active/` 目录，共 6 个：
- [phase1-backend.md](exec-plans/active/phase1-backend.md)
- [phase2-admin-frontend.md](exec-plans/active/phase2-admin-frontend.md)
- [phase3-portal-frontend.md](exec-plans/active/phase3-portal-frontend.md)
- [phase4-teacher-portal.md](exec-plans/active/phase4-teacher-portal.md)
- [phase5-student-portal.md](exec-plans/active/phase5-student-portal.md)
- [phase6-integration-deploy.md](exec-plans/active/phase6-integration-deploy.md)

## 已完成基础能力

- ✅ 用户认证（JWT + bcrypt，POST /login）
- ✅ RBAC 权限控制（角色/菜单/权限字符串）
- ✅ 用户/角色/菜单/部门/字典/配置/日志/定时任务/公告 全套管理
- ✅ 文件上传下载（/common/upload, /common/download）
- ✅ AI 流式聊天、代码生成器
- ✅ 管理前端（Vue3 + Element Plus）全套 CRUD 页面
- ✅ 代码生成器（从 DB 表生成 CRUD 代码）
- ✅ module_simhub 后端（16 张表，59 条路由）
- ✅ 门户前端基础设施（Vue3 + Vite + Tailwind，18 个路由，15 个页面）

## 技术决策记录

- 门户前端独立建设（`medpro-fastapi-portal/`，端口 3100，与管理后台风格分离）
- 用户扩展表方案（复用 `sys_user`，新增 `vf_student_profile` / `vf_teacher_profile`）
- SQLAlchemy `metadata.create_all` 自动建表（不使用 Alembic 迁移）
- 实验启动：Web 类型直接跳转 `launchUrl`，exe 类型下载引导
- 图标字体：`material-symbols` npm 本地包（无外网 CDN 依赖）
- 路由 auto-discovery：`common/router.py::auto_register_routers` 扫描 `*/controller/[!_]*.py`
