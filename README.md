# Cortex - 多功能个人网站系统

> 一个集博客、习惯追踪、订阅管理、媒体库、知识库和工具箱于一体的现代化个人中心

## 📋 项目概述

这是一个采用**微服务混合架构**的全栈项目，旨在通过实践学习多种后端语言（Node.js、Go、Rust），同时构建一个功能完善的个人数字空间。

### 核心特性

- **🏠 仪表盘**: 聚合所有模块的关键信息，一站式概览
- **✍️ 博客**: Markdown 编辑器，支持草稿/公开，标签分类
- **✅ 习惯追踪**: 日历打卡、统计分析、自动提醒
- **💰 订阅管理**: 财务跟踪、续费提醒、开销统计
- **🎬 媒体库**: 书影音记录，豆瓣集成，年度报告
- **📚 知识库**: 代码片段、稍后读、Markdown 笔记
- **🛠️ 工具箱**: 价格追踪器等实用小工具

## 🏗️ 技术架构

### 前端
- **React 19** + **TypeScript**
- **Vite 7** 构建工具
- **React Router 7** 路由管理
- **Zustand** 状态管理
- **Ant Design** UI 组件库
- **TanStack Query** 数据请求

### 后端 (微服务)

| 服务 | 语言/框架 | 职责 | 端口 |
|------|-----------|------|------|
| 主 API | Node.js (NestJS) | 认证、博客、仪表盘聚合 | 3000 |
| 习惯追踪 | Go (Fiber) | 打卡记录、统计、定时提醒 | 3001 |
| 媒体/订阅 | Node.js (Express) | 外部 API 调用、数据管理 | 3002 |
| 知识库 | Rust (Axum) | 搜索索引、代码高亮 | 3003 |
| 工具服务 | Go (Colly) | 价格爬虫、数据分析 | 3004 |

### 数据存储
- **PostgreSQL** - 主数据库
- **Redis** - 缓存和任务队列
- **MinIO/S3** - 文件存储


## 📂 项目结构

```
blog/
├── frontend/              # Vite + React 前端
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 可复用组件
│   │   ├── stores/        # Zustand 状态
│   │   └── services/      # API 调用
│   └── package.json
│
├── services/              # 后端微服务
│   ├── main-api/          # Node.js 主服务
│   ├── habits-service/    # Go 习惯服务
│   ├── media-service/     # Node.js 媒体服务
│   ├── knowledge-service/ # Rust 知识库
│   └── tools-service/     # Go 工具服务
│
├── shared/                # 共享代码
│   ├── types/             # TypeScript 类型
│   └── proto/             # gRPC 定义
│
├── infra/                 # 基础设施配置
│   ├── docker-compose.yml
│   └── nginx.conf
│
└── docs/                  # 文档
    ├── architecture/      # 架构设计
    └── api/               # API 文档
```

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18
- **Go** >= 1.21
- **Rust** >= 1.75
- **Docker** & **Docker Compose**
- **PostgreSQL** 15
- **Redis** 7

### 安装步骤

1. **克隆仓库**


2. **启动基础设施**
```bash
cd infra
docker-compose up -d
```

3. **启动前端**
```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

4. **启动主 API 服务**
```bash
cd services/main-api
npm install
npx prisma migrate dev
npm run start:dev
# API 运行在 http://localhost:3000
```

5. **启动 Go 习惯服务**
```bash
cd services/habits-service
go mod download
go run cmd/main.go
# 服务运行在 http://localhost:3001
```

6. **启动 Rust 知识库服务**
```bash
cd services/knowledge-service
cargo build
cargo run
# 服务运行在 http://localhost:3003
```

## 📚 文档导航

- [架构设计文档](./docs/architecture/ARCHITECTURE.md)
- [API 接口文档](./docs/api/API.md)
- [数据库设计](./docs/architecture/DATABASE.md)
- [开发指南](./docs/DEVELOPMENT.md)
- [部署指南](./docs/DEPLOYMENT.md)

## 🛠️ 开发命令

### 前端
```bash
npm run dev          # 开发模式
npm run build        # 生产构建
npm run preview      # 预览构建结果
npm run lint         # 代码检查
```

### 主 API (NestJS)
```bash
npm run start:dev    # 开发模式
npm run build        # 生产构建
npm run test         # 运行测试
npx prisma studio    # 数据库管理界面
```

### Go 服务
```bash
go run cmd/main.go   # 运行
go build             # 构建
go test ./...        # 测试
```

### Rust 服务
```bash
cargo run            # 运行
cargo build --release # 发布构建
cargo test           # 测试
```

## 📈 开发路线图

### Phase 1: 基础搭建 ✅
- [x] 项目结构初始化
- [x] 前端框架搭建
- [x] NestJS 主服务
- [ ] 数据库设计
- [ ] 认证系统
- [ ] 博客模块

### Phase 2: 核心功能 (进行中)
- [ ] 仪表盘聚合
- [ ] Go 习惯追踪服务
- [ ] 订阅管理
- [ ] 通知系统

### Phase 3: 扩展功能
- [ ] 媒体库
- [ ] Rust 知识库服务
- [ ] 工具箱 (价格追踪)

### Phase 4: 优化部署
- [ ] 性能优化
- [ ] Docker 镜像
- [ ] CI/CD 流程
- [ ] 监控告警


