# 村庄广播项目 - 开发文档

## 项目概述

村庄广播系统 - 基于 HLS 的实时视频直播平台，支持弹幕互动。

**开发时间**: 2025-12-30
**当前状态**: 开发中

---

## 技术栈

### 前端
- **框架**: React 19 + TypeScript + Vite
- **状态管理**: Zustand
- **路由**: react-router-dom
- **视频播放**: hls.js
- **实时通信**: socket.io-client
- **动画**: motion (Framer Motion)

### 后端
- **API 服务**: Express + sql.js (端口 3001)
- **弹幕服务**: Socket.io (端口 3002)
- **数据库**: sql.js (SQLite，无需编译)

### 视频服务
- **服务器**: nginx-rtmp (Arch Linux)
- **推流端口**: 1935 (RTMP)
- **拉流端口**: 8030 (HLS)

---

## 项目架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         局域网测试环境                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  本地开发机 (localhost:5173)                                        │
│  └── 前端 (React + Vite)                                            │
│                                                                     │
│  服务器 (192.168.5.100)                                             │
│  ├── nginx-rtmp  :1935/:8030                                       │
│  ├── API 服务     :3001                                             │
│  └── 弹幕服务     :3002                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 目录结构

```
village-broadcast-frontend/
├── src/
│   ├── components/          # 组件
│   │   ├── AppRouter.tsx    # 路由配置
│   │   ├── VideoPlayer/     # HLS 播放器
│   │   ├── Danmaku/         # 弹幕层
│   │   └── ChatInput/       # 聊天输入
│   ├── pages/               # 页面
│   │   ├── Login/           # 登录/注册
│   │   ├── Live/            # 直播观看
│   │   └── Admin/           # 管理后台
│   ├── services/            # API 服务
│   │   ├── api.ts           # HTTP 接口
│   │   └── socket.ts        # Socket.io 客户端
│   ├── store/               # 状态管理
│   │   └── index.ts         # Zustand stores
│   └── types/               # 类型定义
│       └── index.ts
├── backend/
│   ├── api/                 # API 服务 (端口 3001)
│   │   └── src/
│   │       ├── index.js     # 入口
│   │       ├── db.js        # 数据库 (sql.js)
│   │       ├── routes.js    # 路由
│   │       └── middleware.js # 中间件
│   └── danmu/               # 弹幕服务 (端口 3002)
│       └── src/
│           └── index.js     # Socket.io 服务
└── doc/                     # 文档
    └── DEVELOPMENT.md       # 本文件
```

---

## API 接口定义

### 用户认证
```
POST /api/auth/login      - 用户登录
POST /api/auth/register   - 用户注册
POST /api/auth/logout     - 用户登出
GET  /api/auth/me         - 获取当前用户
```

### 直播管理
```
GET  /api/stream/status     - 获取直播状态
GET  /api/stream/config     - 获取推流配置 (管理员)
POST /api/stream/refresh-key - 刷新推流密钥 (管理员)
```

### Socket.io 事件
```
客户端发送:
  join_room    - 加入房间: { roomId: string }
  leave_room   - 离开房间: { roomId: string }
  send_danmaku - 发送弹幕: { roomId: string, text: string, styleId: string }
  check_stream - 检查直播状态: { roomId: string }

服务端发送:
  stream_status  - 直播状态: { isLive: boolean, viewerCount: number, ... }
  danmaku_list   - 弹幕列表: Danmaku[]
  new_danmaku    - 新弹幕: { id: string, text: string, styleId: string, user: {...}, timestamp: number }
  online_count   - 在线人数: { count: number }
```

**弹幕样式 (styleId)**:
- `normal` - 普通白色弹幕
- `warm` - 温暖橙色
- `fire` - 烈焰红色
- `ocean` - 海洋蓝色
- `forest` - 森林绿色
- `royal` - 皇家紫色

后端只需转发 `styleId`，样式配置完全由前端管理。

---

## 环境配置

### 前端 (.env.local)
```bash
VITE_API_BASE_URL=http://192.168.5.100:3001/api
VITE_VIDEO_BASE_URL=http://192.168.5.100:8030
VITE_SOCKET_URL=http://192.168.5.100:3002
```

### 后端 API (backend/api/.env)
```bash
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
HLS_PATH=/var/lib/nginx/hls
```

### 后端弹幕 (backend/danmu/.env)
```bash
PORT=3002
CORS_ORIGIN=*
API_URL=http://192.168.5.100:3001
```

---

## 默认账户

- **用户名**: admin
- **密码**: admin123

---

## 开发日志

### 2025-01-01 - 登录页面UI重构

**目标**: 将登录页面改造为符合"大明内阁放映厅"主题的文牒风格

#### 完成内容

**1. 配色方案调整**
- 从传统棕色系改为水墨丹青风格
- 背景：淡米白 (#f7f4ed) + 墨色晕染效果
- 文牒纸张：宣纸白 (#fafafa)
- 边框/装饰：墨黑色 (#2d2d2d)
- 点缀：朱红印章 (#c41e3a)

**2. 背景动画效果**
- 墨滴晕染扩散动画 (4个墨点)
- 云雾飘动效果 (3层)
- 远山浮动动画
- 竹叶飘落动画 (5片竹叶)

**3. 文牒展开动画**
- 使用 motion 库实现
- 从中间向上下展开 (scaleY)
- 先慢后快的缓动曲线 (duration: 1.5s)
- 配合透明度变化

**4. 密码输入框云纹遮罩**
- 使用波浪符号 (≋) 替代传统星星符号
- 双层输入框实现：透明真实输入 + 云纹显示层
- 保持原生输入行为的同时展示云纹效果

**5. 朱红印章发光效果**
- SVG 印章位于右上角
- 多层 drop-shadow 发光效果
- 呼吸动画 (3秒循环)
- 透明度 0.25 → 0.5 + 缩放 1 → 1.05

#### 技术细节

**依赖新增**:
```bash
pnpm add motion
```

**文件修改**:
- `src/pages/Login/index.tsx` - 完整重构

**关键实现**:
```tsx
// 文牒展开动画
<motion.div
  initial={{ scaleY: 0, opacity: 0 }}
  animate={{ scaleY: 1, opacity: 1 }}
  transition={{
    duration: 1.5,
    ease: [0.6, 0.01, 0.2, 0.02]
  }}
>

// 云纹密码显示
const cloudChar = '≋';
const passwordDisplay = password ? cloudChar.repeat(password.length) : '';

// 印章发光动画
@keyframes svgGlow {
  0%, 100% { filter: drop-shadow(...) }
  50% { filter: drop-shadow(...) }
}
```

#### 设计理念

整体设计遵循"水墨丹青"美学：
- **留白**: 大量留白，不堆砌元素
- **淡雅**: 墨色为主，朱红点缀
- **写意**: 抽象的竹影、远山、云雾
- **古朴**: 宣纸纹理、祥云纹样

#### 效果预览

- 文牒从中间向上下缓慢展开，最后"唰"地完全打开
- 背景墨滴慢慢晕染扩散，云雾缓缓飘过
- 竹叶从右上角飘落，旋转摆动
- 朱红印章微微发光呼吸

---

## 当前进度

### ✅ 已完成
- [x] 前端项目搭建
- [x] 后端 API 服务 (Express + sql.js)
- [x] 后端弹幕服务 (Socket.io)
- [x] nginx-rtmp 配置
- [x] admin 账户登录
- [x] 数据库存储功能
- [x] 登录页面文牒风格UI重构 (2025-01-01)

### ⚠️ 进行中
- [ ] 用户注册功能调试

### ❌ 待完成
- [ ] OBS 推流测试
- [ ] 弹幕收发测试
- [ ] 直播状态检测
- [ ] 在线人数统计
- [ ] Docker 化部署

---

## 遗留问题

### 1. 注册功能问题

**现象**: 新用户注册后数据库没有新记录

**分析**:
- 注册请求返回 200
- userQueries.create() 执行但数据未写入

**可能原因**:
- sql.js 的 saveDatabase() 执行时机问题
- 数据库事务未正确提交

**位置**: `backend/api/src/db.js` 的 `userQueries.create()`

### 2. 测试流程问题

**问题**: 我无法直接看到服务器日志和浏览器 Network 请求

**影响**: 调试效率低，需要反复询问用户

**改进方案**:
1. 添加前端 DebugPanel 组件显示请求/响应
2. 本地 Docker 运行完整环境
3. 统一日志收集

### 3. 部署流程问题

**问题**: 手动上传文件到服务器太繁琐

**改进方案**:
- Docker Compose 一键部署
- CI/CD 自动化部署

---

## 下次计划

1. **修复注册功能**
   - 检查 userQueries.create() 的 saveDatabase() 调用
   - 添加更详细的日志

2. **完善测试流程**
   - 添加 DebugPanel 组件
   - 实现本地 Docker 开发环境

3. **端到端测试**
   - OBS 推流
   - 视频播放
   - 弹幕收发

4. **Docker 化**
   - 编写 Dockerfile
   - docker-compose.yml 配置

---

## 快速启动

### 前端
```bash
cd village-broadcast-frontend
pnpm install
pnpm dev
# 访问 http://localhost:5173
```

### 后端 (服务器)
```bash
cd /opt/village-broadcast/api
pnpm install
pnpm start

cd /opt/village-broadcast/danmu
pnpm install
pnpm start
```

### nginx-rtmp (服务器)
```bash
sudo systemctl restart nginx
```

---

## 服务器信息

- **地址**: 192.168.5.100
- **系统**: Arch Linux
- **包管理**: pacman / paru
- **Node.js**: v25.2.1
- **部署路径**: /opt/village-broadcast/

---

## 技术决策记录

### 为什么选择 sql.js 而不是 better-sqlite3？

**原因**: better-sqlite3 是原生模块，需要 gcc/Python 等构建工具编译。在 Arch Linux 上安装构建工具比较麻烦。

**权衡**: sql.js 是纯 JS 实现，性能略低但对于小型项目完全够用，且无需编译。

### 为什么使用 bcryptjs 而不是 bcrypt？

**原因**: 同上，bcrypt 是原生模块需要编译。

### 为什么端口是 8030 而不是 8080？

**原因**: 8080 端口可能与其他服务冲突，改为 8030。

---

## 参考资料

- [nginx-rtmp 配置](https://github.com/arut/nginx-rtmp-module)
- [sql.js 文档](https://sql.js.org/)
- [Socket.io 文档](https://socket.io/docs/)
- [hls.js 文档](https://github.com/video-dev/hls.js/)
