# CLAUDE.md

本文件为 Claude Code 提供项目相关的指导说明。

## 项目概述

这是一个 WebAR 金色粒子圣诞树项目，使用 Three.js 创建 3D 粒子效果，结合 MediaPipe Hands 实现手势识别交互。用户可以通过手势控制场景旋转、切换视角以及展示图片。

## 技术栈

- **Three.js (r128)** - 3D 渲染引擎
- **MediaPipe Hands** - 手势识别库
- **原生 HTML/CSS/JavaScript** - 单文件 Web 应用

## 项目结构

```
test/
└── index.html    # 主应用文件（包含所有代码）
```

## 运行方式

由于项目使用摄像头和外部 CDN 资源，需要通过 HTTP 服务器运行：

```bash
# 使用 Python 启动本地服务器
python3 -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后在浏览器中访问 `http://localhost:8080`

## 核心功能

### 手势交互状态机

- **IDLE（空闲）**：远景展示圣诞树，握拳状态
- **EXPANDED（展开）**：张开手掌进入沉浸模式，左右移动手掌旋转场景
- **PINCHED（捏合）**：拇指与食指捏合展示图片

### 关键参数配置

位于 `CONFIG` 对象中：
- `treeHeight: 20` - 圣诞树高度
- `treeRadius: 8` - 圣诞树底部半径
- `particleCount: 1500` - 粒子数量
- `spiralCount: 8` - 螺旋照片数量

## 代码规范

- 使用中文注释
- 遵循 ES6+ 语法
- 变量命名使用驼峰命名法
- 常量使用大写下划线命名（如 `CONFIG`、`STATE`）

## 注意事项

- 需要 HTTPS 或 localhost 环境才能使用摄像头
- 移动端需要用户授权摄像头权限
- 建议使用现代浏览器（Chrome、Firefox、Safari）
