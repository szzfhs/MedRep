# SimHub UI Design System
> 医学虚拟仿真实验平台 · 前端设计规范文档  
> 版本：v1.0 · 2026-05-02  
> 技术栈：React + TypeScript + Tailwind CSS v4 + Motion/React

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
9. [通用组件模式](#九通用组件模式)
10. [页面布局模式](#十页面布局模式)
11. [导航组件](#十一导航组件)
12. [表单设计](#十二表单设计)
13. [数据展示](#十三数据展示)
14. [状态反馈](#十四状态反馈)
15. [弹窗与覆盖层](#十五弹窗与覆盖层)
16. [响应式设计](#十六响应式设计)
17. [设计模式速查](#十七设计模式速查)

---

## 一、设计哲学

### 核心理念
**专业 · 可信 · 沉浸**

SimHub 面向高校医学教育场景，界面设计以「专业医疗仪器质感 + 现代教育平台易用性」为核心，传达严谨可信的学术氛围，同时保持低认知负担的操作体验。

### 三条设计准则

| 准则 | 描述 |
|------|------|
| **深邃专业** | 深海蓝主色调营造专业医学感，避免轻浮的娱乐化配色 |
| **层次清晰** | 通过颜色深浅、卡片投影、边框构建三级视觉层次 |
| **数据优先** | 统计卡、进度条、图表始终置于视觉焦点，信息密度高但不拥挤 |

### 视觉语言关键词
深邃 · 冷静 · 精准 · 可信赖 · 学术感 · 现代简洁

---

## 二、色彩系统

### 2.1 品牌主色

```
主色   深医学蓝    #0B5394   —— 核心品牌色，用于主按钮、选中态、关键数字
辅色   医学青绿    #00897B   —— 强调色，用于教师端、成功态、辅助按钮
亮蓝   信息蓝      #1E88E5   —— 渐变辅助、链接高亮、进度条
浅蓝   高亮蓝      #42A5F5   —— Hero 文字渐变、点缀光效
```

### 2.2 中性色阶（灰白系）

```css
/* 背景层 */
页面底色      #F0F4F8    /* 全局背景，冷灰白 */
卡片底色      #FFFFFF    /* 白色卡片 */
表格斑马行    #FAFBFD    /* 轻微偏灰 */
输入框背景    #F8FAFC    /* 极浅灰 */
悬停背景      #F0F4F8    /* 与页面底色相同，用于行 hover */

/* 边框层 */
标准边框      #E2E8F0    /* 卡片、输入框边框 */
内分割线      #F0F4F8    /* 卡片内部分隔 */
暗色边框      #1E2D3D    /* 深色背景上的分隔线 */

/* 文字层 */
主文字        #1A2332    /* 标题、重要内容 */
次要文字      #475569    /* 正文描述 */
辅助文字      #64748B    /* 副标题、说明 */
占位文字      #94A3B8    /* 输入框 placeholder、标签 */
禁用文字      #CBD5E1    /* 禁用态 */
```

### 2.3 深色背景系（后台/Hero/Footer）

```css
最深背景      #0B1929    /* 侧栏背景、Footer 底色 */
深色2         #0B2848    /* Hero 渐变中间 */
深色3         #0B3A6B    /* 深色 Hero 渐变末端 */
深色卡片      #1E2D3D    /* 深色侧栏悬停 */
深色面板      #142030    /* 深色面板分区 */
```

### 2.4 语义色（功能色）

```css
成功绿        #2E7D32 / #43A047   /* 已完成、正常状态 */
成功背景      #E8F5E9 / #E0F2F1
警告橙        #FB8C00 / #F57F17   /* 进行中、待处理 */
警告背景      #FFF8E1 / #FFF3E0
危险红        #E53935 / #EF5350   /* 删除、错误、停用 */
危险背景      #FFEBEE / #FFF0F0
信息蓝        #0B5394             /* 信息提示 */
信息背景      #E3F2FD / #DBEAFE
```

### 2.5 扩展辅助色（硬件平台标签等）

```css
紫色系        #6D28D9 / #EDE9FE   /* VR头盔标签、神经科学 */
绿色系        #065F46 / #D1FAE5   /* zSpace标签 */
琥珀色系      #92400E / #FEF3C7   /* WebGL标签 */
深紫          #4527A0 / #EDE7F6   /* 神经科学类别 */
洋红          #880E4F / #FCE4EC   /* 外科学类别 */
橙红          #E65100 / #FFF3E0   /* 药理学类别 */
深绿          #1B5E20 / #E8F5E9   /* 生理学类别 */
```

### 2.6 渐变规范

```css
/* 主品牌渐变（按钮、图标背景） */
from-[#0B5394] to-[#1E88E5]        /* 蓝色主渐变 */
from-[#1E88E5] to-[#00897B]        /* 蓝绿过渡 */
from-[#00695C] to-[#00897B]        /* 绿色渐变 */

/* Hero 背景渐变 */
from-[#0B1929]/95 via-[#0B2848]/85 to-[#0B3A6B]/60   /* 深色 Hero 覆盖层 */
from-[#0B1929] via-[#0B3A6B] to-[#063B33]            /* 应用中心 Hero */
from-[#0B1929] to-[#0B3A6B]                           /* 实验/课程页 Header */

/* 顶部装饰条（固定规范） */
from-[#0B5394] via-[#1E88E5] to-[#00897B]

/* 状态渐变 */
from-[#2E7D32] to-[#43A047]        /* 完成状态进度条 */
from-[#0B5394] to-[#1E88E5]        /* 学习进度条 */

/* Hero 文字渐变 */
from-[#42A5F5] to-[#26C6DA]        /* 强调词 clip 渐变 */
```

### 2.7 颜色使用原则

- **一个页面只用一个主色点缀**：前台用蓝（#0B5394），教师工作台用青绿（#00897B）
- **背景不超过三层**：页面底（#F0F4F8）→ 卡片（#FFFFFF）→ 输入框内（#F8FAFC）
- **深色背景上的文字透明度**：主文字 `white`、次要 `white/70`、辅助 `white/50`、最弱 `white/30`
- **禁止在浅色背景上使用纯黑色文字**，统一使用 `#1A2332`

---

## 三、字体与排版

### 3.1 字体栈

```css
/* 中文优先系统字体栈 */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             "PingFang SC", "Hiragino Sans GB", 
             "Microsoft YaHei", "Helvetica Neue", sans-serif;
```

### 3.2 字号规范

> **重要**：遵守 `theme.css` 中 `h1~h4`、`button`、`label` 已设置的默认样式；  
> 需要覆盖时使用 `style={{ fontSize, fontWeight }}` 内联样式，而非 Tailwind `text-*` 类。

| 用途 | 尺寸 | 字重 | 颜色 | 写法 |
|------|------|------|------|------|
| 页面大标题 | 2.5rem | 700 | #1A2332 / white | `style={{ fontSize:'2.5rem', fontWeight:700 }}` |
| 列表页标题 | 1.75rem | 700 | white（深色 header） | `style={{ fontSize:'1.75rem', fontWeight:700 }}` |
| 模块标题 | 1.4rem | 700 | #1A2332 | `style={{ fontSize:'1.4rem', fontWeight:700 }}` |
| 卡片标题 | `text-sm font-semibold` | 600 | #1A2332 | Tailwind 类 |
| 正文描述 | `text-sm` | 400 | #475569 | Tailwind 类 |
| 辅助标注 | `text-xs` | 400/500 | #64748B / #94A3B8 | Tailwind 类 |
| 数字统计 | `text-2xl font-bold` | 700 | #1A2332 | Tailwind 类 |
| 徽章/标签 | `text-xs font-medium` | 500 | 语义色 | Tailwind 类 |
| 表头 | `text-xs font-medium` | 500 | #64748B | Tailwind 类 |

### 3.3 行高与间距

```css
正文段落     leading-relaxed    /* 1.625，大段文字必用 */
标题         line-height: 1.2   /* 大号标题内联 */
列表项       leading-snug       /* 卡片标题 2 行省略时 */
```

### 3.4 文字截断

```css
单行截断     truncate           /* overflow:hidden + text-overflow:ellipsis */
多行截断     line-clamp-1/2/3   /* WebKit 多行 */
```

---

## 四、间距与尺寸

### 4.1 页面容器

```css
最大宽度     max-w-7xl mx-auto px-4 sm:px-6    /* 所有页面统一 */
内容 padding p-6                                /* 后台页面内容区 */
页面 padding py-8 / py-10 / py-16              /* 前台页面视觉权重递增 */
```

### 4.2 组件内间距（卡片、面板）

```css
大卡片内边距    p-5 / p-6
中卡片内边距    p-4
小卡片内边距    p-3
表格单元格      px-4 py-3
```

### 4.3 间距节奏（竖向 space-y）

```css
页面各 section 间距    space-y-6 / space-y-8
卡片内各行间距         space-y-4
表单字段间距           space-y-4 / space-y-5
列表项间距             space-y-2.5 / space-y-3
微间距（标签行）       gap-1.5 / gap-2
```

### 4.4 常用元素尺寸

```css
/* 图标容器 */
大图标容器    w-11 h-11 / w-12 h-12    统计卡图标
中图标容器    w-9 h-9 / w-10 h-10     功能图标
小图标容器    w-8 h-8                  行内图标

/* 头像/Logo */
大头像        w-16 h-16                工作台个人头像
中头像        w-9 h-9 / w-10 h-10      顶栏用户头像
小头像        w-7 h-7 / w-8 h-8        列表行头像

/* 按钮高度 */
大按钮        py-3 px-6               Hero CTA
中按钮        py-2.5 px-4/5           通用操作按钮
小按钮        py-2 px-3               表格行操作
图标按钮      p-1.5 / p-2             仅图标的操作按钮

/* 输入框 */
标准输入      px-3.5 py-2.5
行内搜索      pl-9 pr-4 py-2          左侧有搜索图标偏移
```

---

## 五、圆角系统

```css
/* 圆角层级（由小到大） */
rounded-lg      8px     微元素：普通按钮（兼容旧代码）
rounded-xl      12px    ★ 核心层级：输入框、小卡片、表格行操作区
rounded-2xl     16px    ★ 核心层级：内容卡片、模态框、工作台侧栏卡片
rounded-3xl     24px    大尺寸模态框（少用）
rounded-full          全圆：头像、标签徽章、分页按钮

/* 具体映射 */
卡片/面板         rounded-2xl
输入框/选择框      rounded-xl
按钮（主要）       rounded-xl
按钮（小型）       rounded-lg / rounded-xl
标签/徽章          rounded-full / rounded-lg
图标容器           rounded-xl / rounded-2xl（正方形）
头像               rounded-full（圆形） / rounded-2xl（方形）
顶部导航搜索输入   rounded-xl
```

---

## 六、阴影与层次

### 6.1 阴影规范

```css
/* 卡片阴影 */
默认卡片        shadow-sm           border-[#E2E8F0] 配合使用
悬停卡片        shadow-lg           hover:shadow-lg transition-shadow
模态框/下拉      shadow-2xl          白色背景弹层

/* 有色阴影（主按钮） */
主色按钮        shadow-md shadow-[#0B5394]/20
悬停增强        hover:shadow-[#0B5394]/30

/* 图标容器 */
统计卡图标      shadow-md           渐变背景图标容器
工作台头像      shadow-lg
```

### 6.2 视觉层次（z-index）

```
z-50    模态框、确认对话框
z-30    吸顶筛选栏
z-10    顶部导航栏、后台顶栏
z-0     内容区
```

### 6.3 边框使用原则

```css
/* 卡片边框（代替重阴影） */
border border-[#E2E8F0]              标准白色卡片
border border-[#1E2D3D]              深色背景上的分隔
border border-white/15               深色背景上的半透明卡片

/* 交互态边框变化 */
focus:border-[#0B5394]               输入框聚焦（主色）
focus:border-[#00897B]               教师端输入框聚焦（辅色）
hover:border-[#CBD5E1]               卡片轻微悬停边框加深
```

---

## 七、图标系统

### 7.1 图标库

**统一使用 `lucide-react`**，禁止混用其他图标库。

```tsx
import { FlaskConical, BookOpen, Users, ... } from 'lucide-react';
```

### 7.2 图标尺寸规范

```css
导航/大按钮内    size={18} / size={20}
卡片标题旁       size={15} / size={16}
正文段落旁       size={14}
表格操作列       size={15}
行内小标注       size={12} / size={13}
徽章内           size={10} / size={11}
```

### 7.3 图标颜色规范

```css
深色背景上       text-white / text-white/80
主色点缀         text-[#0B5394]
辅色点缀         text-[#00897B]
灰色辅助         text-[#64748B] / text-[#94A3B8]
危险操作         text-[#E53935]
带渐变的容器内   text-white（始终白色）
```

### 7.4 图标 + 文字组合

```tsx
/* 标准写法：图标与文字间隔 gap-2 / gap-1.5 */
<div className="flex items-center gap-2">
  <FlaskConical size={16} className="text-[#0B5394]" />
  <span>虚拟仿真实验</span>
</div>
```

---

## 八、动效规范

### 8.1 动效库

**统一使用 `motion/react`**（原 Framer Motion），禁止使用 `framer-motion` 包名。

```tsx
import { motion, AnimatePresence } from 'motion/react';
```

### 8.2 标准动效参数

```tsx
/* 页面/卡片进入 */
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

/* 轻微进入（列表项/子元素） */
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}

/* 退出 */
exit={{ opacity: 0, y: -8 }}

/* 模态框弹出 */
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
transition={{ duration: 0.2 }}

/* 侧滑进入（右侧内容） */
initial={{ opacity: 0, x: 40 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.7, delay: 0.2 }}

/* 级联延迟（列表子项） */
transition={{ delay: 0.3 + i * 0.1 }}

/* 进度条动画 */
initial={{ width: 0 }}
animate={{ width: `${progress}%` }}
transition={{ duration: 0.8, ease: 'easeOut' }}

/* 浮动点（Hero 背景装饰） */
animate={{ y: [-8, 8, -8], opacity: [0.3, 0.8, 0.3] }}
transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
```

### 8.3 Tailwind 过渡类

```css
/* 所有交互元素的基础过渡 */
transition-colors          颜色变化（导航链接、按钮）
transition-all             复合变化（卡片 hover）
transition-shadow          仅阴影（卡片悬停）
transition-transform       位移（卡片图片缩放）
duration-200 / 300 / 500   时长
```

### 8.4 hover 动效模式

```css
/* 卡片悬停上浮 */
hover:-translate-y-1 hover:shadow-lg transition-all duration-200

/* 图片缩放（卡片内） */
group-hover:scale-105 transition-transform duration-500

/* 图标按钮颜色变化 */
hover:text-[#0B5394] hover:bg-[#E3F2FD] transition-colors

/* 主按钮按下态 */
whileTap={{ scale: 0.97 }}    /* motion 组件 */
```

---

## 九、通用组件模式

### 9.1 统计卡（Stat Card）

```tsx
/* 渐变图标 + 数字 + 标签，用于仪表盘、工作台、Hero 下方 */
<div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex items-center gap-4">
  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0B5394] to-[#1E88E5] 
                  flex items-center justify-center flex-shrink-0 shadow-md">
    <IconName size={20} className="text-white" />
  </div>
  <div>
    <div className="text-[#1A2332] font-bold text-2xl leading-none">数值</div>
    <div className="text-[#64748B] text-xs mt-0.5">标签</div>
  </div>
</div>
```

**变体：深色背景统计格（Hero 内）**
```tsx
<div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
  <IconName size={18} className="text-[#90CAF9] mx-auto mb-1.5" />
  <div className="text-white font-bold text-xl">数值</div>
  <div className="text-white/50 text-xs">标签</div>
</div>
```

### 9.2 内容卡片（Content Card）

```tsx
/* 标准白色内容卡片 */
<div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden 
                hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
  {/* 封面图区域 */}
  <div className="relative h-44 overflow-hidden">
    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
    {/* 标签浮层 */}
    <div className="absolute top-3 left-3">
      <span className="px-2.5 py-1 bg-[#0B5394]/90 text-white text-xs font-medium rounded-lg">
        类别
      </span>
    </div>
  </div>
  {/* 内容区 */}
  <div className="p-4 flex flex-col flex-1">
    <h3 className="text-[#1A2332] font-semibold text-sm leading-snug mb-2 line-clamp-2">标题</h3>
    {/* ...元数据行、操作按钮 */}
  </div>
</div>
```

### 9.3 状态徽章（Status Badge）

```tsx
/* 通用徽章模式：bg + text 配对，rounded-full */
const statusMap = {
  success: 'bg-[#E8F5E9] text-[#2E7D32]',
  warning: 'bg-[#FFF8E1] text-[#FB8C00]',
  danger:  'bg-red-50 text-[#E53935]',
  info:    'bg-[#E3F2FD] text-[#0B5394]',
  draft:   'bg-[#F0F4F8] text-[#64748B]',
};

<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[type]}`}>
  <IconName size={10} /> 标签文字
</span>
```

### 9.4 操作按钮组（Action Buttons）

```tsx
/* 主操作 */
<button className="flex items-center gap-2 px-4 py-2.5 bg-[#0B5394] text-white 
                   rounded-xl text-sm font-medium hover:bg-[#1565C0] 
                   transition-colors shadow-md shadow-[#0B5394]/20">
  <Plus size={16} /> 新增
</button>

/* 次要操作 */
<button className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl 
                   text-sm hover:bg-[#F0F4F8] transition-colors">
  取消
</button>

/* 危险操作 */
<button className="flex-1 py-2.5 bg-[#E53935] text-white rounded-xl text-sm 
                   font-medium hover:bg-[#C62828] transition-colors">
  确认删除
</button>

/* 表格行图标按钮 */
<button className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] 
                   rounded-lg transition-colors">
  <Edit size={15} />
</button>
```

### 9.5 进度条（Progress Bar）

```tsx
/* 标准进度条 */
<div className="flex items-center gap-2">
  <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="h-full bg-gradient-to-r from-[#0B5394] to-[#1E88E5] rounded-full"
    />
  </div>
  <span className="text-[#94A3B8] text-xs flex-shrink-0">{progress}%</span>
</div>

/* 完成状态进度条（绿色） */
className="h-full bg-gradient-to-r from-[#2E7D32] to-[#43A047] rounded-full"

/* 卡片底部进度条（白色，用于深色封面图上） */
<div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
  <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
</div>
```

### 9.6 Hero 区域装饰

```tsx
/* 网格背景装饰（用于深色 Hero 和应用中心 Banner） */
<div className="absolute inset-0 opacity-[0.06]" style={{
  backgroundImage: 'linear-gradient(#1E88E5 1px, transparent 1px), linear-gradient(90deg, #1E88E5 1px, transparent 1px)',
  backgroundSize: '48px 48px',
}} />

/* 光晕装饰圆 */
<div className="absolute -right-24 -top-24 w-96 h-96 bg-[#1E88E5]/10 rounded-full blur-3xl" />
<div className="absolute -left-16 bottom-0 w-80 h-80 bg-[#00897B]/10 rounded-full blur-3xl" />

/* 在线状态标签（Hero 顶部 badge） */
<div className="inline-flex items-center gap-2 bg-white/10 text-white/80 
                px-4 py-1.5 rounded-full text-sm border border-white/15">
  <span className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
  标题文字
</div>
```

### 9.7 分段标题装饰线

```tsx
/* Section 标题左侧竖线装饰（工作台页面头部） */
<div className="flex items-center gap-2 mb-5">
  <div className="h-5 w-1 rounded-full bg-[#0B5394]" />  {/* 教师端用 bg-[#00897B] */}
  <h2 className="text-[#1A2332] font-bold text-lg">标题</h2>
</div>

/* Footer 列标题竖线 */
<h4 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
  <span className="w-1 h-4 bg-[#1E88E5] rounded-full inline-block" />
  快速导航
</h4>
```

### 9.8 搜索输入框（带图标）

```tsx
<div className="relative">
  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
  <input
    type="text"
    placeholder="搜索..."
    className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl 
               text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] transition-colors"
  />
</div>
```

### 9.9 空状态（Empty State）

```tsx
<div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
  <IconName size={48} className="text-[#CBD5E1] mb-4" />
  <p className="text-[#94A3B8] text-lg font-medium">暂无匹配的内容</p>
  <p className="text-[#CBD5E1] text-sm mt-1">请尝试调整搜索条件</p>
  <button className="mt-4 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-sm 
                     hover:bg-[#1565C0] transition-colors">
    重置筛选
  </button>
</div>
```

---

## 十、页面布局模式

### 10.1 前台列表页布局

```
┌─────────────────────────────────────────┐
│  深色 Header（渐变背景 + 面包屑 + 标题）    │  from-[#0B1929] to-[#0B3A6B]
├─────────────────────────────────────────┤
│  吸顶筛选栏（白色 sticky，border-b）       │  sticky top-[65px] z-30
├─────────────────────────────────────────┤
│                                         │
│  内容网格区（max-w-7xl px-6 py-8）        │  bg-[#F0F4F8]
│  grid-cols-1 sm:cols-2 lg:cols-3/4      │
│                                         │
└─────────────────────────────────────────┘
```

### 10.2 前台 Hero 页布局（首页）

```
┌─────────────────────────────────────────┐
│  全屏 Hero（min-h-[calc(100vh-65px)]）   │  深色背景图 + 覆盖渐变
│  grid lg:grid-cols-2 gap-12             │
│  左：文字 + CTA + 统计    右：特性卡片   │
├─────────────────────────────────────────┤
│  统计数字条（白色背景）                   │
├─────────────────────────────────────────┤
│  内容 Section 1（实验卡片网格）           │
├─────────────────────────────────────────┤
│  内容 Section 2（课程卡片）              │
├─────────────────────────────────────────┤
│  内容 Section 3（新闻/公告）             │
└─────────────────────────────────────────┘
```

### 10.3 工作台布局（学生/教师）

```
┌─ Navbar（fixed top） ────────────────────┐
├─────────────────────────────────────────┤
│  max-w-7xl px-6 py-6                    │
│  ┌──────────┐ ┌───────────────────────┐ │
│  │          │ │  内容区               │ │
│  │ 侧栏     │ │  - 分段标题装饰线     │ │
│  │ w-56     │ │  - AnimatePresence    │ │
│  │ sticky   │ │    tab 切换动效       │ │
│  │ hidden   │ │                       │ │
│  │ lg:block │ │                       │ │
│  └──────────┘ └───────────────────────┘ │
└─────────────────────────────────────────┘
```

### 10.4 后台管理布局

```
┌─────────────────────────────────────────┐
│  ┌──────┐  ┌──────────────────────────┐ │
│  │ 侧栏 │  │ 顶栏（h-16，sticky z-10）│ │
│  │ w-60 │  ├──────────────────────────┤ │
│  │ bg-  │  │                          │ │
│  │[#0B  │  │  页面内容（p-6 space-y-5）│ │
│  │1929] │  │                          │ │
│  └──────┘  └──────────────────────────┘ │
└─────────────────────────────────────────┘
```

侧栏宽度：展开 `w-60`，折叠 `w-16`，`transition-all duration-300`

---

## 十一、导航组件

### 11.1 顶部导航栏（Navbar）

**结构**：固定定位 `fixed top-0 z-50` + 顶部 `h-1` 渐变装饰条

```tsx
/* 滚动态变化 */
isScrolled
  ? 'bg-white shadow-md border-b border-[#E2E8F0]'
  : 'bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]'

/* 导航链接激活态 */
isActive ? 'text-[#0B5394] bg-[#E3F2FD]' : 'text-[#1A2332] hover:text-[#0B5394] hover:bg-[#F0F4F8]'
```

**导航项间距**：`gap-1`，单项 `px-3 py-2 rounded-lg text-sm`

**顶栏下方页面内容偏移**：`pt-[65px]`（Layout 中统一处理）

### 11.2 后台侧栏菜单

```tsx
/* 菜单项激活 */
isActive ? 'bg-[#0B5394] text-white' : 'text-[#94A3B8] hover:bg-[#1E2D3D] hover:text-white'

/* 菜单分组标题 */
className="text-[#475569] text-xs font-medium px-3 mb-1.5 uppercase tracking-wider"

/* 单个菜单项 */
className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm"
```

### 11.3 工作台侧栏导航

```tsx
/* 学生端（蓝色主色） */
activeTab === tab.key
  ? 'bg-[#0B5394] text-white'
  : 'text-[#475569] hover:bg-[#F0F4F8] hover:text-[#0B5394]'

/* 教师端（青绿主色） */
activeTab === tab.key
  ? 'bg-[#00897B] text-white'
  : 'text-[#475569] hover:bg-[#F0F4F8] hover:text-[#00897B]'
```

### 11.4 面包屑（Breadcrumb）

```tsx
<div className="flex items-center gap-2 text-white/50 text-sm mb-3">
  <Link to="/" className="hover:text-white transition-colors">首页</Link>
  <ChevronRight size={14} />
  <span className="text-white/80">当前页</span>
</div>
```

### 11.5 分页控件

```tsx
/* 页码按钮 */
p === page
  ? 'bg-[#0B5394] text-white'        /* 激活 */
  : 'text-[#64748B] hover:bg-[#F0F4F8]'  /* 默认 */

/* 尺寸 */
className="w-7 h-7 rounded-lg text-xs font-medium"

/* 上/下页按钮 */
className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] 
           rounded-lg transition-colors disabled:opacity-30"
```

---

## 十二、表单设计

### 12.1 输入框

```tsx
/* 标准文本输入框 */
className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl 
           text-sm text-[#1A2332] focus:outline-none focus:bg-white 
           focus:border-[#0B5394] transition-all"

/* 错误态 */
error ? 'border-red-400' : 'border-[#E2E8F0] focus:border-[#0B5394]'

/* Textarea */
className="... resize-none"
rows={4}

/* Select */
className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm 
           focus:outline-none focus:border-[#0B5394]"
```

### 12.2 错误提示

```tsx
{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
```

### 12.3 字段标签

```tsx
<label className="block text-[#1A2332] text-sm font-medium mb-1.5">
  字段名称 {required && '*'}
</label>
```

### 12.4 表单布局

```tsx
/* 两列布局（弹窗表单常用） */
<div className="grid grid-cols-2 gap-4">
  <Field label="字段A" />
  <Field label="字段B" />
</div>

/* 三列信息展示（详情面板） */
<div className="grid grid-cols-3 items-center gap-4">
  <label className="text-[#64748B] text-sm col-span-1">标签</label>
  <span className="col-span-2 text-[#1A2332] text-sm">值</span>
</div>
```

### 12.5 Toggle / 开关

```tsx
/* 状态切换按钮（非 input[type=checkbox]） */
<button
  onClick={() => set('status', form.status === '0' ? '1' : '0')}
  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
    form.status === '0'
      ? 'bg-[#E8F5E9] text-[#2E7D32]'
      : 'bg-[#F0F4F8] text-[#64748B]'
  }`}
>
  {form.status === '0'
    ? <><ToggleRight size={18} className="text-[#43A047]" /> 正常</>
    : <><ToggleLeft size={18} /> 停用</>
  }
</button>
```

### 12.6 多选标签组（硬件平台等）

```tsx
{options.map(opt => {
  const active = selected.includes(opt.value);
  return (
    <button
      key={opt.value}
      type="button"
      onClick={() => toggle(opt.value)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium 
                  border-2 transition-all ${
        active
          ? `${opt.bg} ${opt.color} border-current`
          : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:border-[#CBD5E1]'
      }`}
    >
      {opt.label}
    </button>
  );
})}
```

---

## 十三、数据展示

### 13.1 数据表格（Admin Table）

```tsx
/* 表格容器 */
<div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] whitespace-nowrap">
            列名
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className={`border-b border-[#F0F4F8] hover:bg-[#F8FAFC] transition-colors 
                        ${idx % 2 ? 'bg-[#FAFBFD]' : ''}`}>
          <td className="px-4 py-3">单元格内容</td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* 分页 footer */}
  <div className="flex items-center justify-between px-4 py-3 
                  border-t border-[#E2E8F0] bg-[#F8FAFC]">
    {/* 分页信息 + 控件 */}
  </div>
</div>
```

### 13.2 信息面板格子（Detail Grid）

```tsx
/* 用于详情面板中的快速信息展示 */
<div className="bg-[#F8FAFC] rounded-xl p-3">
  <span className="text-[#94A3B8] text-xs block mb-0.5">字段名</span>
  <span className="text-[#1A2332] font-medium">字段值</span>
</div>
```

### 13.3 数据分组卡片

```tsx
/* 三列元数据格子（实验详情、Modal 中常用） */
<div className="grid grid-cols-3 gap-3">
  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
    <IconName size={16} className="text-[#64748B] mx-auto mb-1" />
    <div className="text-[#1A2332] font-semibold text-sm">数值</div>
    <div className="text-[#94A3B8] text-xs">标签</div>
  </div>
</div>
```

### 13.4 图表配色（Recharts）

```tsx
const chartColors = {
  primary:   '#0B5394',   /* Bar/Line 主色 */
  secondary: '#00897B',   /* 双系列副色 */
  accent:    '#1E88E5',   /* 渐变 */
};

/* Tooltip 样式 */
<Tooltip
  contentStyle={{
    background: '#1E2D3D',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
  }}
/>
```

---

## 十四、状态反馈

### 14.1 状态色彩速查表

| 状态 | 前景色 | 背景色 | 图标 |
|------|--------|--------|------|
| 已完成 / 正常 | `#2E7D32` | `#E8F5E9` | `CheckCircle` |
| 已发布 | `#2E7D32` | `#E8F5E9` | `CheckCircle` |
| 进行中 / 审核中 | `#FB8C00` | `#FFF8E1` | `Clock` |
| 草稿 / 未开始 | `#64748B` | `#F0F4F8` | `Clock` |
| 错误 / 停用 / 删除 | `#E53935` | `#FFF0F0` | `XCircle` |
| 信息 / 主色 | `#0B5394` | `#E3F2FD` | `Info` |
| 警告 / 待处理 | `#B45309` | `#FFF8E1` | `AlertCircle` |

### 14.2 加载态

```tsx
/* 行内 spinner */
<svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>

/* 按钮加载态 */
disabled={loading}
className="... disabled:opacity-80"
```

### 14.3 系统运行状态指示

```tsx
/* 绿色心跳点（Footer / 状态栏） */
<span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-pulse" />
系统运行正常

/* Hero 在线状态点 */
<span className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
```

---

## 十五、弹窗与覆盖层

### 15.1 标准 Modal

```tsx
{/* 遮罩层 */}
<div className="fixed inset-0 z-50 flex items-center justify-center 
                bg-black/40 backdrop-blur-sm p-4">
  {/* 弹窗体 */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl 
               max-h-[90vh] overflow-hidden flex flex-col"
  >
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 
                    border-b border-[#E2E8F0] flex-shrink-0">
      <h3 className="text-[#1A2332] font-semibold">标题</h3>
      <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-[#1A2332] 
                                           hover:bg-[#F0F4F8] rounded-lg transition-colors">
        <X size={18} />
      </button>
    </div>
    {/* Body（可滚动） */}
    <div className="flex-1 overflow-y-auto p-6">内容</div>
    {/* Footer（可选） */}
    <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] 
                    flex items-center justify-end gap-3">
      操作按钮
    </div>
  </motion.div>
</div>
```

### 15.2 确认对话框（Confirm Dialog）

```tsx
/* 小尺寸 max-w-sm，图标居中，按钮两列 */
<motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center 
                  justify-center mx-auto mb-4">
    <Trash2 size={22} className="text-[#E53935]" />
  </div>
  <h3 className="text-[#1A2332] font-semibold text-center mb-2">确认删除</h3>
  <p className="text-[#64748B] text-sm text-center mb-6">描述文字</p>
  <div className="flex gap-3">
    <button className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl 
                       text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
    <button className="flex-1 py-2.5 bg-[#E53935] text-white rounded-xl 
                       text-sm font-medium hover:bg-[#C62828]">确认删除</button>
  </div>
</motion.div>
```

### 15.3 下拉菜单（Dropdown）

```tsx
<motion.div
  initial={{ opacity: 0, y: -8, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -8, scale: 0.96 }}
  transition={{ duration: 0.15 }}
  className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl 
             shadow-lg border border-[#E2E8F0] overflow-hidden"
>
  {/* 选项：px-4 py-2.5 text-sm hover:bg-[#F0F4F8] */}
</motion.div>
```

---

## 十六、响应式设计

### 16.1 断点规范

```css
sm    640px    手机横屏 / 小平板
md    768px    平板
lg    1024px   桌面（主要断点）
xl    1280px   宽屏
2xl   1536px   超宽屏
```

### 16.2 核心响应规则

```css
/* 网格列数 */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4   /* 卡片网格 */
grid-cols-2 lg:grid-cols-4                                  /* 统计卡 */
grid-cols-1 lg:grid-cols-2                                  /* 双列布局 */

/* 侧栏 */
hidden lg:block    /* 工作台侧栏，小屏隐藏 */
w-60 折叠→w-16    /* 后台侧栏 */

/* 工作台小屏备用导航 */
lg:hidden ... overflow-x-auto    /* 横向滚动 Tab 栏 */

/* 文字/按钮 */
hidden sm:block    /* 非关键文字大屏显示 */
hidden sm:flex     /* 登录按钮 */
```

### 16.3 图片自适应

```css
/* 卡片封面图（固定高度，object-cover） */
h-44 / h-36 / h-48 / h-52    /* 根据卡片尺寸选择 */
w-full h-full object-cover
```

---

## 十七、设计模式速查

### 快速参考：不同页面类型对应模板

| 页面类型 | 背景 | Header 样式 | 主色 |
|----------|------|-------------|------|
| 门户首页 | `#F0F4F8` | 全屏 Hero 深色 | `#0B5394` |
| 实验/课程列表页 | `#F0F4F8` | 深色渐变 Banner | `#0B5394` |
| 应用中心 | `#F0F4F8` | 深色渐变 Hero（居中） | `#0B5394` |
| 学生工作台 | `#F0F4F8` | 无独立 Header，侧栏 | `#0B5394` |
| 教师工作台 | `#F0F4F8` | 无独立 Header，侧栏 | `#00897B` |
| 后台管理 | `#F0F4F8` | 深色侧栏 `#0B1929` | `#0B5394` |
| 登录/注册页 | 深色 Hero | 全屏左右分栏 | `#0B5394` |

### 快速参考：常用色值组合

```
主按钮:    bg-[#0B5394] hover:bg-[#1565C0]
辅按钮:    bg-[#00897B] hover:bg-[#00796B]
危险:      bg-[#E53935] hover:bg-[#C62828]
次要:      border-[#E2E8F0] text-[#64748B] hover:bg-[#F0F4F8]
卡片:      bg-white border-[#E2E8F0] rounded-2xl
输入框:    bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#0B5394]
页面背景:  bg-[#F0F4F8]
深色背景:  bg-[#0B1929]
```

### 快速参考：图标尺寸配对

```
size={20} → w-11 h-11 容器（统计卡）
size={18} → w-9 h-9 容器（Hero 按钮）
size={16} → 卡片标题旁、侧栏菜单
size={15} → 表格操作区、段落内图标
size={14} → 下拉菜单项、表单标签
size={13} → 小按钮内图标
size={12} → 行内说明文字旁
size={10} → 徽章内、状态点旁
```

### 快速参考：动效时长

```
页面级动画:    duration: 0.5 ~ 0.7
卡片/元素:     duration: 0.2 ~ 0.3
微交互:        duration: 0.15
进度条填充:    duration: 0.8, ease: 'easeOut'
过渡类:        transition-colors（即时感知）
下拉菜单:      duration: 0.15
```

---

> **文档维护说明**  
> 本文档随项目迭代更新。每次新增组件或修改全局设计决策时，请同步更新对应章节。  
> 色值、间距、动效参数以本文档为准，代码实现为辅助参考。
