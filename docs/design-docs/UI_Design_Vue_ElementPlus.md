# SimHub Admin UI Design System
> 医学虚拟仿真实验平台 · 后台管理前端设计规范文档  
> 版本：v1.0 · 2026-05-27  
> 技术栈：Vue 3 + Element Plus + SCSS

---

## 目录

1. [设计哲学](#一设计哲学)
2. [色彩系统](#二色彩系统)
3. [字体与排版](#三字体与排版)
4. [间距与尺寸](#四间距与尺寸)
5. [圆角系统](#五圆角系统)
6. [阴影与层次](#六阴影与层次)
7. [图标系统](#七图标系统)
8. [动效规范](#八动效规范)
9. [Element Plus 组件定制](#九element-plus-组件定制)
10. [页面布局模式](#十页面布局模式)
11. [导航组件](#十一导航组件)
12. [表单设计](#十二表单设计)
13. [数据表格](#十三数据表格)
14. [状态反馈](#十四状态反馈)
15. [弹窗与覆盖层](#十五弹窗与覆盖层)
16. [响应式设计](#十六响应式设计)
17. [SCSS 变量速查](#十七scss-变量速查)
18. [设计模式速查](#十八设计模式速查)

---

## 一、设计哲学

### 核心理念
**专业 · 可信 · 高效**

SimHub 后台管理界面面向平台运营人员和教师管理员，设计以「专业医疗级别的精准感 + 企业级管理系统的高效性」为核心，传达严谨可信的学术氛围，同时确保管理操作流程清晰、认知负担低。

### 三条设计准则

| 准则 | 描述 |
|------|------|
| **深邃专业** | 深海蓝主色营造专业感，Element Plus 组件统一定制，规避默认的通用感 |
| **信息密度适中** | 表格行高、卡片内边距精准控制，在有限视口内展示更多数据而不产生拥挤感 |
| **操作路径最短** | 常用操作就近放置，筛选/搜索常驻可见，减少页面跳转层级 |

### 视觉语言关键词
深邃 · 冷静 · 精准 · 高效 · 学术感 · 企业级

---

## 二、色彩系统

### 2.1 Element Plus CSS 变量覆盖

在 `src/assets/styles/element-ui.scss` 或全局样式中注入以下 CSS 变量，统一覆盖 Element Plus 默认主题色：

```scss
:root {
  // ── 品牌主色 ──────────────────────────────
  --el-color-primary:         #0B5394;
  --el-color-primary-light-3: #3B77B3;
  --el-color-primary-light-5: #85AAC9;
  --el-color-primary-light-7: #B8CFDF;
  --el-color-primary-light-8: #D3E1EC;
  --el-color-primary-light-9: #E9F0F5;
  --el-color-primary-dark-2:  #093F72;

  // ── 功能色 ────────────────────────────────
  --el-color-success:         #2E7D32;
  --el-color-success-light-3: #5EA362;
  --el-color-success-light-9: #E8F5E9;
  --el-color-success-dark-2:  #1B5E20;

  --el-color-warning:         #FB8C00;
  --el-color-warning-light-3: #FCAB40;
  --el-color-warning-light-9: #FFF8E1;
  --el-color-warning-dark-2:  #E65100;

  --el-color-danger:          #E53935;
  --el-color-danger-light-3:  #EE6D6A;
  --el-color-danger-light-9:  #FFEBEE;
  --el-color-danger-dark-2:   #C62828;

  --el-color-info:            #64748B;
  --el-color-info-light-3:    #8EA0B8;
  --el-color-info-light-9:    #F0F4F8;
  --el-color-info-dark-2:     #475569;

  // ── 文字色 ────────────────────────────────
  --el-text-color-primary:    #1A2332;
  --el-text-color-regular:    #475569;
  --el-text-color-secondary:  #64748B;
  --el-text-color-placeholder:#94A3B8;
  --el-text-color-disabled:   #CBD5E1;

  // ── 边框色 ────────────────────────────────
  --el-border-color:          #E2E8F0;
  --el-border-color-light:    #F0F4F8;
  --el-border-color-lighter:  #F8FAFC;
  --el-border-color-extra-light: #FAFBFD;
  --el-border-color-dark:     #D1D9E0;
  --el-border-color-darker:   #B8C5D0;

  // ── 背景色 ────────────────────────────────
  --el-bg-color:              #FFFFFF;
  --el-bg-color-page:         #F0F4F8;
  --el-bg-color-overlay:      #FFFFFF;

  // ── 填充色 ────────────────────────────────
  --el-fill-color-blank:      #FFFFFF;
  --el-fill-color:            #F8FAFC;
  --el-fill-color-light:      #FAFBFD;
  --el-fill-color-lighter:    #F0F4F8;
  --el-fill-color-extra-light:#F8FAFC;
  --el-fill-color-dark:       #EEF2F6;
  --el-fill-color-darker:     #E2E8F0;
  --el-fill-color-disabled:   #F5F7FA;

  // ── 圆角 ──────────────────────────────────
  --el-border-radius-base:    8px;
  --el-border-radius-small:   6px;
  --el-border-radius-round:   20px;
  --el-border-radius-circle:  100%;

  // ── 阴影 ──────────────────────────────────
  --el-box-shadow:            0 2px 8px rgba(11, 83, 148, 0.08);
  --el-box-shadow-light:      0 1px 4px rgba(0, 0, 0, 0.06);
  --el-box-shadow-lighter:    0 0 6px rgba(0, 0, 0, 0.04);
  --el-box-shadow-dark:       0 4px 16px rgba(11, 83, 148, 0.15);

  // ── 组件尺寸 ──────────────────────────────
  --el-component-size-large:  40px;
  --el-component-size:        36px;
  --el-component-size-small:  28px;

  // ── 字号 ──────────────────────────────────
  --el-font-size-extra-large: 20px;
  --el-font-size-large:       16px;
  --el-font-size-medium:      14px;
  --el-font-size-base:        13px;
  --el-font-size-small:       12px;
  --el-font-size-extra-small: 11px;
}
```

### 2.2 品牌主色语义

```
主色   深医学蓝    #0B5394   —— 主按钮、选中态、关键数字、侧栏激活
辅色   医学青绿    #00897B   —— 教师端、成功态辅助、次要强调
亮蓝   信息蓝      #1E88E5   —— 进度条、渐变辅助、链接高亮
浅蓝   高亮蓝      #42A5F5   —— 顶部装饰条、点缀色
```

### 2.3 中性色阶

```scss
// 背景层级（由深到浅）
$page-bg:      #F0F4F8;  // 全局页面背景
$card-bg:      #FFFFFF;  // 卡片、面板、弹窗背景
$input-bg:     #F8FAFC;  // 输入框、表格斑马行（偶数）
$stripe-bg:    #FAFBFD;  // 表格奇数行淡斑马色

// 边框层级
$border-base:  #E2E8F0;  // 标准边框（卡片、输入框）
$border-light: #F0F4F8;  // 内部分割线（卡片内、表格行间）
$border-dark:  #1E2D3D;  // 深色背景上的分隔线（侧栏）

// 文字层级
$text-title:   #1A2332;  // 标题、重要内容
$text-body:    #475569;  // 正文描述
$text-sub:     #64748B;  // 副标题、说明文字
$text-hint:    #94A3B8;  // 占位符、标注
$text-disable: #CBD5E1;  // 禁用态
```

### 2.4 深色侧栏色系

```scss
$sidebar-bg:      #0B1929;  // 侧栏背景（深色主题）
$sidebar-hover:   #1E2D3D;  // 侧栏悬停
$sidebar-active:  #0B5394;  // 侧栏激活项背景
$sidebar-text:    #94A3B8;  // 侧栏默认文字
$sidebar-active-text: #FFFFFF; // 侧栏激活文字

// 浅色主题侧栏
$sidebar-light-bg:     #FFFFFF;
$sidebar-light-hover:  #F0F4F8;
$sidebar-light-text:   #475569;
$sidebar-light-active: #E9F0F5;
$sidebar-light-active-text: #0B5394;
```

### 2.5 顶部装饰条渐变（固定规范）

```scss
// 所有页面顶部装饰条统一使用
.top-accent-bar {
  height: 3px;
  background: linear-gradient(90deg, #0B5394, #1E88E5, #00897B);
}
```

---

## 三、字体与排版

### 3.1 字体栈

```scss
// 全局字体（已在 index.scss 中设置）
$font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
```

### 3.2 字号规范

| 用途 | 尺寸 | 字重 | 颜色 | Element Plus 相关 |
|------|------|------|------|-------------------|
| 页面主标题 | 18px | 700 | #1A2332 | 页面 header 区域 |
| 卡片/模块标题 | 15px | 600 | #1A2332 | `el-card` header |
| 正文/表格内容 | 13px | 400 | #1A2332 | `el-table` 默认 |
| 表头 | 13px | 500 | #64748B | `el-table__header th` |
| 标签/辅助说明 | 12px | 400 | #64748B | `el-tag`、说明文字 |
| 小徽章/提示 | 11px | 500 | 语义色 | 状态徽章 |
| 数字统计 | 28px | 700 | #1A2332 | 仪表盘统计卡 |
| 侧栏菜单 | 13px | 400/500 | #94A3B8 / white | `el-menu` |
| 表单标签 | 13px | 600 | #1A2332 | `el-form-item__label` |
| 按钮文字 | 13px | 500 | 对应主色 | `el-button` |

### 3.3 关键文字样式

```scss
// 页面标题区域
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #1A2332;
  line-height: 1.3;
  
  // 左侧竖线装饰
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #0B5394, #1E88E5);
    border-radius: 2px;
    margin-right: 10px;
    vertical-align: middle;
  }
}

// 模块副标题
.section-subtitle {
  font-size: 12px;
  color: #64748B;
  margin-top: 2px;
}
```

---

## 四、间距与尺寸

### 4.1 页面内容区

```scss
// 主内容区统一内边距
.app-main .main-content {
  padding: 16px 20px 20px;
  min-height: calc(100vh - 84px); // 顶栏50px + 标签栏34px
}

// 搜索/筛选区域
.search-form-wrapper {
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  padding: 16px 20px 4px;
  margin-bottom: 16px;
}

// 数据卡片区域
.data-card {
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}
```

### 4.2 卡片内边距规范

```scss
// el-card 默认内边距覆盖
.el-card__body {
  padding: 16px 20px; // 标准面板
}

.el-card.compact .el-card__body {
  padding: 12px 16px; // 紧凑型（仪表盘小卡片）
}

.el-card.spacious .el-card__body {
  padding: 20px 24px; // 宽松型（详情页）
}
```

### 4.3 表单元素间距

```scss
// 搜索表单（水平排列）
.el-form--inline {
  .el-form-item {
    margin-bottom: 12px;
    margin-right: 12px;
    
    .el-input,
    .el-select,
    .el-date-editor {
      width: 200px;
    }
  }
}

// 弹窗表单（垂直排列）
.dialog-form {
  .el-form-item {
    margin-bottom: 18px;
  }
}
```

### 4.4 常用元素尺寸

```scss
/* 按钮尺寸 */
// 搜索/主操作          default(36px)
// 表格行操作           small(28px)
// 图标按钮             small + circle

/* 输入框高度 */
// 搜索筛选区           default(36px)
// 弹窗表单             default(36px)
// 紧凑型               small(28px)

/* 表格行高 */
// 标准                 48px（含 padding）
// 紧凑                 40px

/* 统计卡图标容器 */
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

/* 头像 */
.avatar-lg { width: 48px; height: 48px; }
.avatar-md { width: 36px; height: 36px; }
.avatar-sm { width: 28px; height: 28px; }
```

---

## 五、圆角系统

```scss
// 全局圆角层级（覆盖 Element Plus 变量）
--el-border-radius-base:  8px;   // 按钮、输入框、小卡片
--el-border-radius-small: 6px;   // 标签、小徽章
--el-border-radius-round: 20px;  // 全圆标签（el-tag round）

// 自定义扩展
$radius-xs:   4px;   // 细节圆角：代码块内联、小 badge
$radius-sm:   6px;   // 标签、徽章
$radius-base: 8px;   // ★ 核心：按钮、输入框、下拉框
$radius-md:   10px;  // 卡片内子面板
$radius-lg:   12px;  // 统计图标容器、数据卡片
$radius-xl:   16px;  // 主要内容卡片、弹窗
$radius-full: 9999px; // 全圆（进度条、头像、状态点）

// 具体映射
// el-card          → border-radius: $radius-lg;
// el-dialog        → border-radius: $radius-xl;
// el-table         → border-radius: $radius-lg;（外层容器）
// el-button        → border-radius: $radius-base;
// el-input         → border-radius: $radius-base;
// el-tag           → border-radius: $radius-sm; / round 时 $radius-full
// el-tag (badge)   → border-radius: $radius-full;
// 统计图标          → border-radius: $radius-lg;
// 头像             → border-radius: $radius-full; / $radius-md（方形）
```

---

## 六、阴影与层次

### 6.1 阴影规范

```scss
// 标准卡片阴影（含品牌色调）
$shadow-card:    0 1px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px #E2E8F0;
$shadow-hover:   0 4px 16px rgba(11, 83, 148, 0.10);
$shadow-float:   0 8px 24px rgba(11, 83, 148, 0.12);
$shadow-dialog:  0 20px 60px rgba(0, 0, 0, 0.15);

// 侧栏右侧阴影
.sidebar-container {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.12);
}

// 顶栏下方阴影
.navbar {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

// 统计卡图标渐变阴影
.stat-icon-wrapper {
  box-shadow: 0 4px 12px rgba(11, 83, 148, 0.25);
}
```

### 6.2 视觉层次（z-index）

```
z-index: 2001  → el-dialog（弹窗）
z-index: 2000  → el-overlay（遮罩）
z-index: 1001  → 侧栏（sidebar-container）
z-index: 1000  → 顶栏（navbar）
z-index:  100  → 标签栏（tags-view）
z-index:   10  → 吸顶筛选区
z-index:    0  → 内容区
```

### 6.3 边框使用原则

```scss
// 白色卡片标准边框
border: 1px solid #E2E8F0;

// 聚焦态（输入框、选择器）
border-color: #0B5394;    // 主色聚焦

// 深色侧栏内分隔
border-color: rgba(255, 255, 255, 0.08);

// 表格行分隔（覆盖 Element Plus）
.el-table td { border-bottom: 1px solid #F0F4F8; }
.el-table th { border-bottom: 1px solid #E2E8F0; }
```

---

## 七、图标系统

### 7.1 图标库

项目使用 **Element Plus Icons**（`@element-plus/icons-vue`）为主要图标库，配合项目已有的 **SVG Icon 系统**（`/src/assets/icons/svg/`）。

```vue
<!-- Element Plus 图标 -->
<el-icon :size="16" color="#0B5394">
  <Search />
</el-icon>

<!-- 项目 SVG 图标（已封装 SvgIcon 组件） -->
<svg-icon icon-class="user" />
```

### 7.2 图标尺寸规范

```
导航侧栏菜单项    16px
顶栏功能图标      18px
卡片标题旁        15px / 16px
表格操作按钮      14px / 15px
表单标签旁        14px
按钮内图标        14px（配合文字时）
统计卡大图标      22px / 24px（在 48×48 容器内）
标签/徽章内       12px
面包屑分隔        13px
```

### 7.3 图标颜色规范

```scss
.icon-primary     { color: #0B5394; }  // 主色图标
.icon-secondary   { color: #00897B; }  // 辅色图标
.icon-muted       { color: #64748B; }  // 灰色辅助
.icon-hint        { color: #94A3B8; }  // 极淡辅助
.icon-white       { color: #FFFFFF; }  // 深色背景上
.icon-danger      { color: #E53935; }  // 删除/危险
.icon-success     { color: #2E7D32; }  // 成功
.icon-warning     { color: #FB8C00; }  // 警告
```

### 7.4 图标 + 文字组合

```vue
<!-- el-button 内图标（推荐写法） -->
<el-button type="primary">
  <el-icon :size="14"><Plus /></el-icon>
  <span>新增</span>
</el-button>

<!-- 纯图标按钮（表格操作） -->
<el-tooltip content="编辑" placement="top">
  <el-button type="primary" link :icon="Edit" size="small" />
</el-tooltip>
```

---

## 八、动效规范

### 8.1 Element Plus 过渡类

```scss
// Element Plus 内置过渡（保留使用）
.el-fade-in-linear { ... }  // 下拉菜单
.el-fade-in        { ... }  // 弹窗遮罩
.el-zoom-in-center { ... }  // 弹窗主体
.el-zoom-in-top    { ... }  // 下拉弹层

// 自定义过渡：页面切换
.router-slide-enter-active,
.router-slide-leave-active {
  transition: all 0.2s ease-in-out;
}
.router-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.router-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
```

### 8.2 标签栏（TagsView）滑动动效

```scss
// 标签栏入场
.tags-view-wrapper .tags-view-item {
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
}
```

### 8.3 侧栏展开/折叠

```scss
// 已在 sidebar.scss 中设置
.sidebar-container {
  transition: width 0.28s ease-in-out;
}
.main-container {
  transition: margin-left 0.28s ease-in-out;
}
```

### 8.4 卡片/列表 hover 动效

```scss
.stat-card {
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(11, 83, 148, 0.12);
  }
}

// 表格行 hover
.el-table__body tr:hover > td {
  background-color: #F0F6FF !important; // 带蓝调的悬停色
}
```

### 8.5 进度条动画

```scss
// 统计卡进度条
.progress-bar-inner {
  animation: progress-grow 0.8s ease-out forwards;
}
@keyframes progress-grow {
  from { width: 0; }
  to   { width: var(--progress); }
}
```

---

## 九、Element Plus 组件定制

### 9.1 el-button 定制

```scss
.el-button {
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
  
  // 主按钮
  &--primary {
    background: linear-gradient(135deg, #0B5394, #1565C0);
    border-color: #0B5394;
    box-shadow: 0 2px 6px rgba(11, 83, 148, 0.30);
    
    &:hover {
      background: linear-gradient(135deg, #1565C0, #1976D2);
      box-shadow: 0 4px 12px rgba(11, 83, 148, 0.40);
      transform: translateY(-1px);
    }
    &:active { transform: translateY(0); }
  }
  
  // 成功按钮（教师端）
  &--success {
    background: linear-gradient(135deg, #00695C, #00897B);
    border-color: #00897B;
    box-shadow: 0 2px 6px rgba(0, 137, 123, 0.30);
    
    &:hover {
      background: linear-gradient(135deg, #00796B, #00A99A);
    }
  }
  
  // 危险按钮
  &--danger {
    &:hover { background-color: #C62828; }
  }
  
  // 文字链接按钮（表格操作）
  &--primary.is-link {
    color: #0B5394;
    &:hover { color: #1565C0; background-color: #E9F0F5; border-radius: 6px; }
  }
  &--danger.is-link {
    color: #E53935;
    &:hover { color: #C62828; background-color: #FFEBEE; border-radius: 6px; }
  }
}
```

### 9.2 el-input 定制

```scss
.el-input {
  .el-input__wrapper {
    background-color: #F8FAFC;
    border-radius: 8px;
    box-shadow: 0 0 0 1px #E2E8F0 inset;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px #B8C5D0 inset;
    }
    
    &.is-focus {
      background-color: #FFFFFF;
      box-shadow: 0 0 0 2px #0B5394 inset;
    }
  }
  
  .el-input__inner {
    font-size: 13px;
    color: #1A2332;
    
    &::placeholder { color: #94A3B8; }
  }
}

// 搜索框前缀图标色
.el-input__prefix-inner .el-icon {
  color: #94A3B8;
}
.el-input.is-focus .el-input__prefix-inner .el-icon {
  color: #0B5394;
}
```

### 9.3 el-select 定制

```scss
.el-select .el-input__wrapper {
  background-color: #F8FAFC;
  border-radius: 8px;
}

// 下拉面板
.el-select__popper {
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
  
  .el-select-dropdown__item {
    font-size: 13px;
    height: 36px;
    line-height: 36px;
    border-radius: 6px;
    margin: 0 4px;
    padding: 0 12px;
    
    &.is-selected {
      color: #0B5394;
      font-weight: 600;
      background-color: #E9F0F5;
    }
    
    &:hover {
      background-color: #F0F4F8;
    }
  }
}
```

### 9.4 el-table 定制

```scss
.el-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
  
  // 表头
  .el-table__header-wrapper th {
    background-color: #F8FAFC !important;
    color: #64748B;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    height: 42px !important;
    border-bottom: 2px solid #E2E8F0 !important;
  }
  
  // 数据行
  .el-table__body tr {
    td {
      color: #1A2332;
      font-size: 13px;
      border-bottom: 1px solid #F0F4F8 !important;
      transition: background-color 0.15s;
    }
    
    // 斑马纹（偶数行）
    &.el-table__row--striped td {
      background-color: #FAFBFD;
    }
    
    // hover 态
    &:hover > td {
      background-color: #EFF4FB !important;
    }
  }
  
  // 操作列按钮组
  .table-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .el-button {
      padding: 4px 8px;
      height: 26px;
      font-size: 12px;
    }
  }
}
```

### 9.5 el-card 定制

```scss
.el-card {
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
  
  &:hover { box-shadow: 0 4px 16px rgba(11, 83, 148, 0.08); }
  
  .el-card__header {
    padding: 14px 20px;
    border-bottom: 1px solid #F0F4F8;
    font-size: 14px;
    font-weight: 600;
    color: #1A2332;
    background: linear-gradient(135deg, #FAFBFD, #FFFFFF);
  }
  
  .el-card__body {
    padding: 16px 20px;
  }
}
```

### 9.6 el-dialog 定制

```scss
.el-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  
  .el-dialog__header {
    background: linear-gradient(135deg, #F8FAFC, #FFFFFF);
    border-bottom: 1px solid #E2E8F0;
    padding: 16px 20px;
    margin: 0; // 覆盖 Element Plus 默认
    
    .el-dialog__title {
      font-size: 15px;
      font-weight: 600;
      color: #1A2332;
    }
    
    .el-dialog__headerbtn {
      top: 14px;
      right: 16px;
      
      .el-icon { color: #94A3B8; }
      &:hover .el-icon { color: #1A2332; }
    }
  }
  
  .el-dialog__body {
    padding: 20px;
    max-height: 65vh;
    overflow-y: auto;
    
    // 滚动条美化
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 2px;
    }
  }
  
  .el-dialog__footer {
    padding: 12px 20px 16px;
    border-top: 1px solid #F0F4F8;
    background-color: #FAFBFD;
  }
}

// 遮罩层
.el-overlay {
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}
```

### 9.7 el-tag 定制

```scss
// 覆盖 el-tag 基础样式
.el-tag {
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  height: 22px;
  line-height: 20px;
  padding: 0 8px;
  
  // 全圆形徽章
  &.is-round {
    border-radius: 9999px;
    padding: 0 10px;
  }
}

// 语义色扩展（自定义 type 映射）
// 在代码中通过 :style 或自定义 class 实现非标准颜色
.tag-draft    { background: #F0F4F8; color: #64748B; border-color: #E2E8F0; }
.tag-success  { background: #E8F5E9; color: #2E7D32; border-color: #C8E6C9; }
.tag-warning  { background: #FFF8E1; color: #FB8C00; border-color: #FFE082; }
.tag-danger   { background: #FFEBEE; color: #E53935; border-color: #FFCDD2; }
.tag-info     { background: #E3F2FD; color: #0B5394; border-color: #BBDEFB; }
.tag-purple   { background: #EDE9FE; color: #6D28D9; border-color: #DDD6FE; }
.tag-teal     { background: #D1FAE5; color: #065F46; border-color: #A7F3D0; }
```

### 9.8 el-form 定制

```scss
.el-form {
  // 表单标签
  .el-form-item__label {
    font-size: 13px;
    font-weight: 600;
    color: #1A2332;
    line-height: 36px;
  }
  
  // 必填星号颜色
  .el-form-item__label::before {
    color: #E53935 !important;
  }
  
  // 错误提示
  .el-form-item__error {
    font-size: 11px;
    color: #E53935;
    padding-top: 3px;
  }
}
```

### 9.9 el-pagination 定制

```scss
.el-pagination {
  font-size: 13px;
  
  .el-pager li {
    border-radius: 6px;
    min-width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 13px;
    
    &.is-active {
      background: #0B5394;
      color: #FFFFFF;
    }
    
    &:not(.is-active):hover {
      color: #0B5394;
      background: #E9F0F5;
    }
  }
  
  .btn-prev, .btn-next {
    border-radius: 6px;
    &:hover { background: #E9F0F5; color: #0B5394; }
  }
}
```

### 9.10 el-menu（侧栏）定制

```scss
// 深色主题侧栏（theme-dark）
.sidebar-container .theme-dark {
  .el-menu {
    background-color: #0B1929;
    border: none;
  }
  
  .el-menu-item,
  .el-sub-menu__title {
    color: #94A3B8;
    height: 44px;
    line-height: 44px;
    font-size: 13px;
    border-radius: 8px;
    margin: 1px 8px;
    padding-left: 12px !important;
    
    .el-icon { color: #64748B; margin-right: 8px; }
    
    &:hover {
      background-color: #1E2D3D !important;
      color: #FFFFFF;
      .el-icon { color: #94A3B8; }
    }
    
    &.is-active {
      background: linear-gradient(135deg, #0B5394, #1565C0) !important;
      color: #FFFFFF;
      font-weight: 500;
      .el-icon { color: #FFFFFF; }
    }
  }
  
  // 子菜单背景
  .el-sub-menu .el-menu {
    background-color: #0B1929;
    
    .el-menu-item {
      padding-left: 36px !important;
      height: 38px;
      line-height: 38px;
      font-size: 12px;
      margin: 0 8px 1px;
      
      &.is-active {
        background: rgba(11, 83, 148, 0.6) !important;
        color: #FFFFFF;
      }
    }
  }
  
  // 分组标题
  .menu-group-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.25);
    padding: 12px 20px 4px;
  }
}

// 浅色主题侧栏（theme-light）
.sidebar-container .theme-light {
  .el-menu { background-color: #FFFFFF; border-right: 1px solid #E2E8F0; }
  
  .el-menu-item,
  .el-sub-menu__title {
    color: #475569;
    border-radius: 8px;
    margin: 1px 8px;
    
    &:hover {
      background-color: #F0F4F8 !important;
      color: #0B5394;
    }
    
    &.is-active {
      background-color: #E9F0F5 !important;
      color: #0B5394 !important;
      font-weight: 600;
      
      // 激活指示条
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background: #0B5394;
        border-radius: 2px 0 0 2px;
      }
    }
  }
}
```

### 9.11 el-tabs 定制

```scss
.el-tabs {
  .el-tabs__header { margin-bottom: 16px; }
  
  .el-tabs__nav-wrap::after {
    background-color: #E2E8F0;
    height: 1px;
  }
  
  .el-tabs__item {
    font-size: 13px;
    color: #64748B;
    height: 40px;
    padding: 0 16px;
    
    &.is-active {
      color: #0B5394;
      font-weight: 600;
    }
    
    &:hover { color: #0B5394; }
  }
  
  .el-tabs__active-bar {
    background-color: #0B5394;
    height: 2px;
    border-radius: 1px;
  }
}

// 卡片型 tabs（用于详情页分区）
.el-tabs--card {
  .el-tabs__item {
    border-radius: 8px 8px 0 0;
    background: #F0F4F8;
    border-color: #E2E8F0 !important;
    
    &.is-active {
      background: #FFFFFF;
      border-bottom-color: #FFFFFF !important;
      color: #0B5394;
    }
  }
}
```

### 9.12 el-badge 定制

```scss
.el-badge__content {
  background-color: #E53935;
  border: 2px solid #FFFFFF;
  border-radius: 9999px;
  font-size: 10px;
  height: 16px;
  line-height: 12px;
  padding: 0 4px;
  min-width: 16px;
}
```

### 9.13 el-breadcrumb 定制

```scss
.el-breadcrumb {
  font-size: 13px;
  
  .el-breadcrumb__inner {
    color: #64748B;
    font-weight: 400 !important;
    
    &:hover { color: #0B5394; }
    
    a { color: #64748B; &:hover { color: #0B5394; } }
  }
  
  .el-breadcrumb__item:last-child .el-breadcrumb__inner {
    color: #1A2332;
    font-weight: 500;
  }
  
  .el-breadcrumb__separator {
    color: #CBD5E1;
    margin: 0 6px;
  }
}
```

### 9.14 el-tooltip 定制

```scss
.el-tooltip__trigger { outline: none; }

// 深色 tooltip（默认）
.el-popper.is-dark {
  background: #1A2332;
  border-color: #1E2D3D;
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

---

## 十、页面布局模式

### 10.1 全局布局框架

```
┌── 顶部装饰条（3px 渐变，固定）─────────────────┐
├── 侧栏（固定，w-200px → w-54px 折叠）─────────┤
│   ├── Logo 区（50px）                          │
│   └── 菜单滚动区                               │
├── 主内容区（margin-left: 200px）────────────────┤
│   ├── 顶栏 Navbar（50px，sticky top）          │
│   ├── 标签栏 TagsView（34px，可选）            │
│   └── 内容区 AppMain（padding: 16px 20px）     │
└─────────────────────────────────────────────────┘
```

### 10.2 标准管理页面结构（以用户管理为例）

```vue
<template>
  <div class="page-wrapper">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">用户管理</h1>
        <p class="section-subtitle">管理系统中的所有用户账户</p>
      </div>
      <div class="page-header-right">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
        <el-button :icon="Upload">导入</el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 搜索/筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline>
        <el-form-item label="用户名称">
          <el-input v-model="queryForm.userName" placeholder="请输入用户名称" clearable :prefix-icon="Search" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="queryForm.phonenumber" placeholder="请输入手机号码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="用户状态" clearable>
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格区域 -->
    <el-card class="table-card" shadow="never">
      <!-- 工具栏 -->
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <el-button type="danger" plain :icon="Delete" :disabled="!selection.length" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
        <div class="table-toolbar-right">
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="用户编号" prop="userId" width="80" align="center" />
        <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small" round>
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" class-name="table-actions">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryForm.pageNum"
        v-model:limit="queryForm.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>
```

**对应 SCSS：**

```scss
.page-wrapper {
  padding: 16px 20px;
  background: #F0F4F8;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  
  .page-header-right {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

.search-card, .table-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  
  .el-card__body { padding: 16px 20px 4px; }
}

.table-card .el-card__body {
  padding: 0;
  
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #F0F4F8;
  }
}
```

### 10.3 仪表盘页面布局

```
┌─ 页面头部（欢迎语 + 日期）──────────────────────┐
├─ 统计卡行（4列网格）──────────────────────────── │
│  [总用户] [活跃课程] [实验次数] [完成率]          │
├─ 图表 + 列表区（两栏）──────────────────────────┤
│  左（2/3宽）折线图 / 柱状图                      │
│  右（1/3宽）快捷操作 / 待办列表                  │
├─ 近期记录表格（全宽）────────────────────────────┤
└─────────────────────────────────────────────────┘
```

### 10.4 详情/配置页面布局

```
┌─ 面包屑 + 返回按钮 ─────────────────────────────┐
├─ 详情头部卡片（头像 + 基本信息 + 状态徽章）──────┤
├─ el-tabs 分区 ──────────────────────────────────┤
│  [基本信息] [权限配置] [操作日志]                │
│  ─────────────────────────────────────          │
│  当前 Tab 内容卡片                               │
└─────────────────────────────────────────────────┘
```

---

## 十一、导航组件

### 11.1 顶栏 Navbar

```scss
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  
  // 顶部装饰条
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #0B5394, #1E88E5, #00897B);
  }
  
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    padding: 0 15px;
    color: #64748B;
    transition: color 0.2s;
    
    &:hover { color: #0B5394; background: #F0F4F8; }
  }
  
  .right-menu {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 2px;
    padding-right: 16px;
    
    .right-menu-item {
      padding: 0 8px;
      height: 34px;
      display: flex;
      align-items: center;
      border-radius: 8px;
      cursor: pointer;
      color: #64748B;
      font-size: 20px;
      transition: all 0.2s;
      
      &.hover-effect:hover {
        background: #F0F4F8;
        color: #0B5394;
      }
    }
  }
  
  // 用户头像区
  .avatar-container {
    .avatar-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      
      &:hover { background: #F0F4F8; }
      
      .user-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #E2E8F0;
      }
      
      .user-nickname {
        font-size: 13px;
        color: #1A2332;
        font-weight: 500;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
```

### 11.2 侧栏 Logo 区

```scss
.sidebar-logo-container {
  position: relative;
  height: 50px;
  overflow: hidden;
  
  // 深色侧栏 logo 区
  &.theme-dark {
    background: #0B1929;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  
  // 浅色侧栏 logo 区
  &.theme-light {
    background: #FFFFFF;
    border-bottom: 1px solid #E2E8F0;
  }
  
  .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 16px;
    gap: 10px;
    text-decoration: none;
    
    .sidebar-logo {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .sidebar-title {
      font-size: 14px;
      font-weight: 700;
      color: #FFFFFF; // 深色主题
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
    }
    
    // 浅色主题文字色
    &.theme-light .sidebar-title { color: #0B5394; }
  }
}
```

### 11.3 标签栏 TagsView

```scss
.tags-view-container {
  width: 100%;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  height: 34px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  
  .tags-view-wrapper {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 0;
    
    // 隐藏滚动条
    &::-webkit-scrollbar { height: 0; }
  }
  
  .tags-view-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 10px;
    height: 24px;
    font-size: 12px;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    color: #64748B;
    background: #F0F4F8;
    border: 1px solid transparent;
    transition: all 0.15s ease;
    flex-shrink: 0;
    
    &.active-tag {
      background: #E9F0F5;
      color: #0B5394;
      border-color: rgba(11, 83, 148, 0.2);
      font-weight: 500;
      
      // 激活小圆点
      &::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background: #0B5394;
        border-radius: 50%;
      }
    }
    
    &:not(.active-tag):hover {
      background: #E9F0F5;
      color: #0B5394;
    }
    
    .el-icon-close {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      font-size: 10px;
      color: inherit;
      opacity: 0.6;
      
      &:hover {
        background: rgba(11, 83, 148, 0.15);
        opacity: 1;
      }
    }
  }
}
```

---

## 十二、表单设计

### 12.1 搜索表单（水平内联）

```vue
<!-- 搜索区卡片：带搜索/重置按钮 -->
<el-card shadow="never" class="search-card">
  <el-form ref="queryFormRef" :model="queryForm" :inline="true" label-width="68px">
    
    <el-form-item label="用户名" prop="userName">
      <el-input
        v-model="queryForm.userName"
        placeholder="请输入用户名称"
        clearable
        :prefix-icon="Search"
        @keyup.enter="handleQuery"
      />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-select v-model="queryForm.status" placeholder="全部状态" clearable>
        <el-option
          v-for="opt in statusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="创建时间" prop="dateRange">
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 240px"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
      <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
    </el-form-item>

  </el-form>
</el-card>
```

### 12.2 新增/编辑弹窗表单

```vue
<el-dialog
  v-model="dialogVisible"
  :title="isEdit ? '编辑用户' : '新增用户'"
  width="600px"
  :close-on-click-modal="false"
  destroy-on-close
>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80px"
    class="dialog-form"
  >
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="用户性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择">
            <el-option label="男" value="0" />
            <el-option label="女" value="1" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>

  <template #footer>
    <div class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认新增' }}
      </el-button>
    </div>
  </template>
</el-dialog>
```

### 12.3 表单验证规则规范

```js
const rules = {
  userName: [
    { required: true, message: '用户名称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phonenumber: [
    { required: false, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ]
}
```

### 12.4 Toggle 开关 / 状态切换

```vue
<!-- el-switch 定制（替代原生 checkbox） -->
<el-switch
  v-model="row.status"
  active-value="0"
  inactive-value="1"
  active-text="正常"
  inactive-text="停用"
  style="--el-switch-on-color: #2E7D32; --el-switch-off-color: #CBD5E1"
  @change="handleStatusChange(row)"
/>
```

---

## 十三、数据表格

### 13.1 完整表格模板

```vue
<el-table
  v-loading="loading"
  :data="tableData"
  stripe
  border
  highlight-current-row
  row-key="id"
  @selection-change="handleSelectionChange"
  @sort-change="handleSortChange"
  style="width: 100%"
>
  <!-- 选择列 -->
  <el-table-column type="selection" width="50" align="center" fixed="left" />
  
  <!-- 序号列（可选） -->
  <el-table-column type="index" width="55" align="center" label="序号">
    <template #default="{ $index }">
      {{ (queryForm.pageNum - 1) * queryForm.pageSize + $index + 1 }}
    </template>
  </el-table-column>

  <!-- 数据列 -->
  <el-table-column
    prop="userName"
    label="用户名称"
    min-width="120"
    :show-overflow-tooltip="true"
    sortable="custom"
  />

  <!-- 状态列（带 Tag） -->
  <el-table-column label="状态" align="center" width="90">
    <template #default="{ row }">
      <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small" round>
        {{ row.status === '0' ? '正常' : '停用' }}
      </el-tag>
    </template>
  </el-table-column>

  <!-- 时间列 -->
  <el-table-column
    prop="createTime"
    label="创建时间"
    width="165"
    align="center"
    :formatter="(row) => parseTime(row.createTime)"
  />
  
  <!-- 操作列（固定右侧） -->
  <el-table-column label="操作" align="center" width="160" fixed="right" class-name="table-actions">
    <template #default="{ row }">
      <el-tooltip content="编辑" placement="top">
        <el-button
          v-hasPermi="['system:user:edit']"
          type="primary"
          link
          :icon="Edit"
          size="small"
          @click="handleEdit(row)"
        />
      </el-tooltip>
      <el-tooltip content="分配角色" placement="top">
        <el-button
          v-hasPermi="['system:user:edit']"
          type="warning"
          link
          :icon="CircleCheck"
          size="small"
          @click="handleAuthRole(row)"
        />
      </el-tooltip>
      <el-tooltip content="删除" placement="top">
        <el-button
          v-hasPermi="['system:user:remove']"
          type="danger"
          link
          :icon="Delete"
          size="small"
          @click="handleDelete(row)"
        />
      </el-tooltip>
    </template>
  </el-table-column>
</el-table>

<!-- 分页 -->
<div class="table-pagination">
  <pagination
    v-show="total > 0"
    :total="total"
    v-model:page="queryForm.pageNum"
    v-model:limit="queryForm.pageSize"
    @pagination="getList"
  />
</div>
```

### 13.2 空状态

```vue
<!-- el-table 内置 empty-text 定制 -->
<el-table :data="tableData" :empty-text="'暂无数据'">
  <template #empty>
    <div class="table-empty">
      <el-icon :size="40" color="#CBD5E1"><DocumentRemove /></el-icon>
      <p>暂无匹配的数据</p>
      <el-button size="small" type="primary" plain @click="resetQuery">清除筛选</el-button>
    </div>
  </template>
</el-table>
```

```scss
.table-empty {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  p {
    font-size: 13px;
    color: #94A3B8;
    margin: 0;
  }
}
```

### 13.3 树形表格

```vue
<el-table
  :data="treeData"
  row-key="id"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  default-expand-all
>
  <!-- 树形列（带缩进展开图标） -->
  <el-table-column prop="label" label="名称" />
</el-table>
```

---

## 十四、状态反馈

### 14.1 状态徽章速查

```vue
<!-- 用户状态 -->
<el-tag :type="status === '0' ? 'success' : 'danger'" size="small" round>
  {{ status === '0' ? '正常' : '停用' }}
</el-tag>

<!-- 任务状态（自定义色） -->
<span :class="['status-badge', `status-${jobStatus}`]">
  {{ statusLabel }}
</span>
```

```scss
// 自定义状态徽章样式
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  
  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }
  
  &.status-0 { color: #2E7D32; background: #E8F5E9; } // 正常
  &.status-1 { color: #E53935; background: #FFEBEE; } // 异常
  &.status-2 { color: #FB8C00; background: #FFF8E1; } // 进行中
  &.status-3 { color: #64748B; background: #F0F4F8; } // 草稿
}
```

### 14.2 统一 Message 提示

```js
// 全局封装（在 plugins/modal.js 中）
// 成功
proxy.$modal.msgSuccess('操作成功')
// 错误
proxy.$modal.msgError('操作失败')
// 警告
proxy.$modal.msgWarning('请先选择数据')

// 对应 Element Plus 样式已通过 CSS 变量定制
```

### 14.3 确认对话框

```js
// 推荐使用项目封装的 modal 方法
proxy.$modal.confirm('是否确认删除该数据？').then(() => {
  // 确认逻辑
}).catch(() => {})

// 自定义标题
proxy.$modal.confirm('此操作将永久删除该文件, 是否继续？', '删除确认').then(...)
```

对应 SCSS 覆盖：

```scss
// 确认弹窗图标区域
.el-message-box {
  border-radius: 16px;
  overflow: hidden;
  
  .el-message-box__header {
    background: linear-gradient(135deg, #F8FAFC, #FFFFFF);
    padding: 16px 20px;
    border-bottom: 1px solid #F0F4F8;
    
    .el-message-box__title { font-size: 15px; font-weight: 600; }
  }
  
  .el-message-box__content {
    padding: 20px;
    color: #475569;
    font-size: 13px;
  }
  
  .el-message-box__btns {
    padding: 12px 20px 16px;
    
    .el-button { border-radius: 8px; }
  }
}
```

### 14.4 加载状态

```vue
<!-- 表格加载 -->
<el-table v-loading="loading" element-loading-text="数据加载中..." />

<!-- 骨架屏（详情页） -->
<el-skeleton :rows="5" animated v-if="pageLoading" />

<!-- 按钮加载 -->
<el-button type="primary" :loading="submitting" @click="handleSubmit">
  {{ submitting ? '保存中...' : '保存修改' }}
</el-button>
```

---

## 十五、弹窗与覆盖层

### 15.1 标准操作弹窗尺寸

| 场景 | 宽度 | 描述 |
|------|------|------|
| 简单表单（4字段内）  | `480px`  | 新增/编辑少量字段 |
| 标准表单            | `600px`  | 新增/编辑通用 |
| 复杂表单（多分组）   | `780px`  | 多列表单、分组字段 |
| 详情预览            | `900px`  | 只读信息展示 |
| 全屏（可选）         | `90vw`   | 代码编辑、富文本 |

### 15.2 弹窗内容结构规范

```
┌── header（标题 + 关闭按钮）─────────────────────┐
│   背景: linear-gradient(#F8FAFC → #FFFFFF)      │
│   border-bottom: 1px solid #F0F4F8              │
├── body（表单/详情内容，可滚动）──────────────────┤
│   padding: 20px                                  │
│   max-height: 65vh; overflow-y: auto            │
├── footer（操作按钮）─────────────────────────────┤
│   背景: #FAFBFD                                  │
│   border-top: 1px solid #F0F4F8                 │
│   内容右对齐：[取消] [确认主操作]               │
└─────────────────────────────────────────────────┘
```

### 15.3 抽屉组件（Drawer）

```vue
<!-- 用于较多字段的编辑、设置面板 -->
<el-drawer
  v-model="drawerVisible"
  title="用户详情"
  direction="rtl"
  size="480px"
>
  <div class="drawer-body">
    <!-- 内容 -->
  </div>
  <template #footer>
    <div class="drawer-footer">
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary">保存</el-button>
    </div>
  </template>
</el-drawer>
```

```scss
.el-drawer {
  .el-drawer__header {
    border-bottom: 1px solid #E2E8F0;
    padding: 16px 20px;
    margin-bottom: 0;
    
    .el-drawer__title {
      font-size: 15px;
      font-weight: 600;
      color: #1A2332;
    }
  }
  
  .el-drawer__body {
    padding: 20px;
    overflow-y: auto;
  }
  
  .el-drawer__footer {
    border-top: 1px solid #F0F4F8;
    padding: 12px 20px;
    background: #FAFBFD;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
```

---

## 十六、响应式设计

### 16.1 断点规范

```scss
// 对齐 Element Plus 内置断点
$bp-xs:  480px;
$bp-sm:  576px;
$bp-md:  768px;
$bp-lg:  992px;   // 侧栏折叠临界点
$bp-xl:  1200px;
$bp-xxl: 1920px;
```

### 16.2 侧栏自适应

```js
// 已在 layout/index.vue 中实现
// 视口 < 992px 时自动隐藏侧栏（移动端抽屉模式）
// 视口 >= 992px 时恢复固定侧栏
```

### 16.3 表格响应式

```vue
<!-- 关键列固定，非关键列在小屏隐藏 -->
<el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" min-width="150"
  :class-name="isMobile ? 'hidden-xs-only' : ''" />
```

```scss
// 移动端隐藏辅助列
@media (max-width: 768px) {
  .hidden-xs-only { display: none !important; }
  
  // 操作列文字收起，仅保留图标
  .table-actions .el-button span { display: none; }
}
```

### 16.4 表单响应式

```vue
<!-- el-row/col 响应式布局 -->
<el-row :gutter="16">
  <el-col :xs="24" :sm="12" :lg="8">
    <el-form-item label="字段A" />
  </el-col>
  <el-col :xs="24" :sm="12" :lg="8">
    <el-form-item label="字段B" />
  </el-col>
</el-row>
```

---

## 十七、SCSS 变量速查

在 `src/assets/styles/variables.module.scss` 中统一维护以下变量，覆盖原有默认值：

```scss
// ── 品牌色 ────────────────────────────────────
$color-primary:        #0B5394;
$color-primary-light:  #1E88E5;
$color-secondary:      #00897B;
$color-secondary-dark: #00695C;

// ── 侧栏（深色主题） ──────────────────────────
$menuText:       #94A3B8;       // 覆盖原 #bfcbd9
$menuActiveText: #FFFFFF;       // 覆盖原 #409eff
$menuBg:         #0B1929;       // 覆盖原 #304156
$menuHover:      #1E2D3D;       // 覆盖原 #263445

// ── 侧栏（浅色主题） ──────────────────────────
$menuLightBg:         #FFFFFF;
$menuLightHover:      #F0F4F8;  // 覆盖原 #f0f1f5
$menuLightText:       #475569;  // 覆盖原 #303133
$menuLightActiveText: #0B5394;  // 覆盖原 #409EFF

// ── Element Plus 功能色 ───────────────────────
$--color-primary: #0B5394;      // 覆盖原 #409EFF
$--color-success: #2E7D32;      // 覆盖原 #67C23A
$--color-warning: #FB8C00;      // 覆盖原 #E6A23C
$--color-danger:  #E53935;      // 覆盖原 #F56C6C
$--color-info:    #64748B;      // 覆盖原 #909399

// ── 布局尺寸 ──────────────────────────────────
$base-sidebar-width: 200px;
$sideBarWidth:       200px;
$navbar-height:      50px;
$tags-view-height:   34px;
$content-padding:    16px 20px;
```

---

## 十八、设计模式速查

### 快速参考：页面类型对应样式

| 页面类型 | 页面背景 | 侧栏主题 | 主色 | 特点 |
|----------|----------|----------|------|------|
| 系统管理页 | `#F0F4F8` | 深色/浅色可选 | `#0B5394` | 搜索卡 + 表格 + 分页 |
| 仪表盘首页 | `#F0F4F8` | 深色/浅色可选 | `#0B5394` | 统计卡 + 图表 + 快捷操作 |
| 监控页面 | `#F0F4F8` | 深色 | `#0B5394` | 实时数据 + 进度条 + 状态点 |
| AI 聊天页 | `#F0F4F8` | 深色 | `#0B5394` | 左侧会话列表 + 右侧对话区 |
| 登录/注册 | `#0B1929` 渐变 | 无侧栏 | `#0B5394` | 全屏居中卡片 |

### 快速参考：Element Plus 组件尺寸

```
// el-button
large  → 40px 高，用于重要 CTA
default → 36px 高，用于搜索、工具栏
small  → 28px 高，用于表格操作、标签内

// el-input
large  → 40px 高，少用
default → 36px 高，搜索/表单标准
small  → 28px 高，紧凑场景

// el-table
// 推荐设置行高
--el-table-row-height: 48px;
```

### 快速参考：常用色值组合

```scss
// 主操作按钮
.btn-primary: background linear-gradient(#0B5394, #1565C0), box-shadow rgba(11,83,148,0.30)

// 卡片
.card: background #FFFFFF, border 1px solid #E2E8F0, border-radius 12px

// 搜索输入框
.input: background #F8FAFC, border #E2E8F0, focus-border #0B5394

// 表格
.table-header: background #F8FAFC, color #64748B, border-bottom 2px solid #E2E8F0
.table-row-hover: background #EFF4FB
.table-stripe: background #FAFBFD

// 状态徽章（以 el-tag 为基础）
success: bg #E8F5E9, text #2E7D32
warning: bg #FFF8E1, text #FB8C00
danger:  bg #FFEBEE, text #E53935
info:    bg #E3F2FD, text #0B5394
draft:   bg #F0F4F8, text #64748B
```

### 快速参考：弹窗规范

```scss
dialog:  border-radius 16px, header gradient #F8FAFC→#FFFFFF
confirm: max-width 420px, border-radius 16px
drawer:  size 480px, direction rtl（右侧滑出）
```

### 快速参考：间距节奏

```
页面内边距:          padding: 16px 20px
卡片与卡片间距:       margin-bottom: 16px
搜索 Form 字段间距:  margin-right: 12px; margin-bottom: 12px
弹窗 Form 字段间距:  margin-bottom: 18px
表格工具栏间距:       padding: 12px 16px
操作按钮间距:        gap: 8px
表格操作列按钮间距:  gap: 4px
```

---

> **文档维护说明**  
> 本文档随项目迭代更新，与 `UI_Design.md`（React 端设计规范）保持色彩体系一致。  
> 修改 Element Plus 组件样式时，优先通过 CSS 变量覆盖，其次使用 SCSS 定制，  
> 避免使用 `!important` 滥用（仅在覆盖第三方组件内联样式时允许）。  
> 色值、组件规格、间距以本文档为准。
