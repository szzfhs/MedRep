# SimHub 虚拟仿真实验教学平台 — 系统架构

## 总体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                       客户端层                                    │
│  ┌──────────────┐  ┌───────────────────┐  ┌────────────────┐   │
│  │  门户/学生/教  │  │  管理员后台         │  │  移动端(uni-app) │  │
│  │  师前端       │  │  (Element Plus)   │  │  H5/小程序      │  │
│  │ medpro-fastapi│  │medpro-fastapi-    │  │ medpro-fastapi │  │
│  │ -portal(Vue3) │  │frontend(Vue3)     │  │ -app           │  │
│  └──────┬───────┘  └────────┬──────────┘  └───────┬────────┘  │
└─────────┼────────────────────┼─────────────────────┼────────────┘
          │  HTTPS/REST JSON   │                     │
┌─────────┼────────────────────┼─────────────────────┼────────────┐
│         │       Nginx 反向代理                       │            │
│         └────────────────────┴─────────────────────┘            │
│                              │                                   │
│              ┌───────────────▼───────────────┐                  │
│              │   FastAPI 后端 (port 9099)     │                  │
│              │   medpro-fastapi-backend       │                  │
│              │                               │                  │
│              │  ┌───────────┐  ┌──────────┐  │                  │
│              │  │module_admin│  │module_   │  │                  │
│              │  │(系统管理)  │  │simhub    │  │                  │
│              │  └───────────┘  │(业务模块) │  │                  │
│              │  ┌───────────┐  └──────────┘  │                  │
│              │  │module_ai  │  ┌──────────┐  │                  │
│              │  │(AI聊天)   │  │module_   │  │                  │
│              │  └───────────┘  │generator │  │                  │
│              │                 └──────────┘  │                  │
│              └───────┬───────────────────────┘                  │
│                      │                                          │
│         ┌────────────┼─────────────┐                            │
│         │            │             │                            │
│   ┌─────▼──┐  ┌──────▼─┐  ┌──────▼──┐                         │
│   │ MySQL  │  │  Redis │  │文件存储   │                         │
│   │ (主库) │  │(缓存/会话│  │(upload  │                         │
│   └────────┘  └────────┘  │ /vf_    │                         │
│                            │ admin)  │                          │
│                            └─────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 后端框架 | FastAPI | 0.115+ |
| ORM | SQLAlchemy (async) | 2.0+ |
| 数据库 | MySQL | 8.0 |
| 缓存/会话 | Redis | 7.0 |
| 认证 | JWT (HS256) + bcrypt | - |
| 任务调度 | APScheduler | 3.x |
| 管理前端 | Vue3 + Element Plus | 3.5 / 2.x |
| 门户前端 | Vue3 + Tailwind CSS | 3.5 / 3.x |
| 移动端 | uni-app | - |
| 容器 | Docker (ARM64) | - |
| Web服务 | Nginx | 1.25+ |

## 目录结构

```
MedPro-Vue3-FastAPI/
├── docs/                         # 项目文档
├── medpro-fastapi-backend/       # FastAPI 后端
│   ├── module_admin/             # 系统管理模块（已完成）
│   ├── module_simhub/            # SimHub 业务模块（新增）
│   ├── module_ai/                # AI 聊天模块
│   ├── module_generator/         # 代码生成器
│   ├── common/                   # 公共工具（认证、路由注册等）
│   └── config/                   # 数据库、Redis、调度器配置
├── medpro-fastapi-frontend/      # Vue3 管理后台
├── medpro-fastapi-portal/        # Vue3 门户（新建）
└── medpro-fastapi-app/           # uni-app 移动端
```

## 认证授权机制

1. **登录**：POST `/login` → JWT Token（存 Redis，24h过期）
2. **请求认证**：`Authorization: Bearer <token>` → `PreAuthDependency` 验证
3. **接口授权**：`UserInterfaceAuthDependency('perms:string')` 按权限字符串控制
4. **角色体系**：
   - `admin` — 系统管理员（全部权限）
   - `simhub:teacher` — 教师
   - `simhub:student` — 学生
   - `simhub:institution` — 学校机构账号

## 数据库设计原则

- 系统管理表：`sys_` 前缀
- SimHub 业务表：`vf_` 前缀
- AI 功能表：`ai_` 前缀
- 代码生成表：`gen_` 前缀
- 软删除：所有主表使用 `del_flag` (0=正常, 2=删除)
- 审计字段：`create_by`, `create_time`, `update_by`, `update_time`
