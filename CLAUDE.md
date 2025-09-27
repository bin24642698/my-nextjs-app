# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个使用 Next.js 15.5.3 构建的现代化AI技术服务平台展示网站，采用 TypeScript、React 19 和 Tailwind CSS v4。

## 开发命令

### 核心命令
```bash
# 启动开发服务器（端口3000）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 运行代码检查
npm run lint
```

## 技术架构

### 技术栈
- **框架**: Next.js 15.5.3 (App Router)
- **UI框架**: React 19.1.0
- **开发语言**: TypeScript 5
- **样式系统**: Tailwind CSS v4 + 自定义CSS变量设计系统
- **代码规范**: ESLint with Next.js configuration

### 项目结构
```
my-nextjs-app/
├── .claude/                    # Claude Code 配置目录
│   └── settings.local.json    # 本地权限设置
├── .git/                      # Git 版本控制
├── .next/                     # Next.js 构建输出目录
├── public/                    # 静态资源目录
│   ├── favicon.ico           # 网站图标
│   ├── file.svg              # SVG 图标文件
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                       # 源代码目录
│   └── app/                   # App Router 目录
│       ├── favicon.ico       # 应用图标
│       ├── globals.css       # 全局样式文件
│       ├── layout.tsx        # 根布局组件
│       └── page.tsx          # 主页组件
├── node_modules/              # 依赖包目录
├── .gitignore                # Git 忽略配置
├── CLAUDE.md                 # Claude Code 指导文档
├── eslint.config.mjs         # ESLint 配置
├── next.config.ts            # Next.js 配置
├── next-env.d.ts             # Next.js 类型定义
├── package.json              # 项目依赖和脚本
├── package-lock.json         # 锁定依赖版本
├── postcss.config.mjs        # PostCSS 配置
├── README.md                 # 项目说明文档
└── tsconfig.json             # TypeScript 配置
```

### 架构特点
- **App Router架构**: 使用 `src/app` 目录结构
- **客户端组件**: 主页使用 'use client' 指令，包含状态管理和交互逻辑
- **路径别名**: 配置了 `@/*` 映射到 `./src/*`

### 设计系统特点
1. **颜色系统**: 基于CSS变量的米白色(`#FBF9F4`)和深黑色(`#1C1C1E`)双色主题
2. **组件样式**:
   - 使用CSS类名系统（`.btn-primary`, `.card` 等）
   - 响应式弹窗组件，支持移动端底部弹出
   - 渐变背景和阴影系统增强视觉层次
3. **字体**: 使用 Geist 和 Geist_Mono 字体

## 重要配置

### Next.js 配置 (next.config.ts)
- 明确指定 `outputFileTracingRoot` 解决多个lockfile警告
- 可扩展实验性功能配置

### TypeScript 配置
- 目标: ES2017
- 严格模式启用
- 模块解析: bundler
- JSX: preserve

### ESLint 配置
- 扩展: next/core-web-vitals, next/typescript
- 忽略: node_modules, .next, out, build, next-env.d.ts

## 核心功能实现

### 主页组件 (src/app/page.tsx)
- **联系表单弹窗**: 包含完整的表单验证和状态管理
- **交互优化**:
  - ESC键关闭弹窗
  - 点击遮罩层关闭（防止误触）
  - 弹窗打开时阻止背景滚动
- **响应式导航栏**: 固定顶部，毛玻璃效果
- **服务展示**: 六大AI服务模块卡片展示

## 开发注意事项

1. **样式开发**: 优先使用已定义的CSS变量和工具类，保持设计一致性
2. **组件开发**: 新组件应遵循现有的命名规范和结构模式
3. **性能优化**: Next.js 自动进行代码分割和优化
4. **类型安全**: 充分利用TypeScript的类型系统