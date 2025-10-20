# 架构设计文档

## 1. 系统架构概览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Vite + React 前端 (SPA)                   │
│  Ant Design + React Router + Zustand + TanStack Query       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                ┌──────────▼──────────┐
                │   Nginx (Gateway)    │
                │   - 反向代理          │
                │   - 负载均衡          │
                │   - SSL 终止          │
                └──────────┬──────────┘
                           │
        ┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
        ┃         服务网格 (Service Mesh)        ┃
        ┗━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━┛
                  │                   │
    ┌─────────────┼───────────────────┼────────────┐
    │             │                   │            │
┌───▼────┐   ┌───▼────┐   ┌──────▼──────┐   ┌────▼─────┐
│Node.js │   │   Go   │   │    Rust     │   │   Go     │
│主服务  │   │习惯服务│   │  知识库服务  │   │工具服务  │
│:3000   │   │:3001   │   │   :3003     │   │:3004     │
└───┬────┘   └───┬────┘   └──────┬──────┘   └────┬─────┘
    │            │               │               │
    └────────────┴───────────────┴───────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────┐   ┌─────▼──────┐   ┌────▼─────┐
    │PostgreSQL│   │   Redis    │   │  MinIO   │
    │  :5432   │   │   :6379    │   │  :9000   │
    └──────────┘   └────────────┘   └──────────┘
```

### 1.2 设计原则

1. **关注点分离**: 每个服务专注于特定领域
2. **语言选型**: 根据场景特性选择最优语言
3. **渐进式架构**: 支持从单体到微服务的演进
4. **学习优先**: 在实践中掌握多种技术栈
5. **性能可扩展**: 支持水平扩展和独立部署

## 2. 前端架构

### 2.1 技术栈

```json
{
  "runtime": "React 18.2+",
  "builder": "Vite 5",
  "language": "TypeScript 5",
  "router": "React Router 6",
  "state": "Zustand",
  "ui": "Ant Design 5",
  "request": "Axios + TanStack Query",
  "charts": "Recharts",
  "editor": {
    "code": "Monaco Editor",
    "markdown": "TipTap"
  }
}
```

### 2.2 目录结构

```
frontend/
├── src/
│   ├── pages/                    # 页面组件
│   │   ├── public/               # 公开页面
│   │   │   ├── Home.tsx          # 首页
│   │   │   ├── Blog.tsx          # 博客列表
│   │   │   └── BlogPost.tsx      # 文章详情
│   │   └── private/              # 需认证页面
│   │       ├── Dashboard.tsx     # 仪表盘
│   │       ├── Habits.tsx        # 习惯追踪
│   │       ├── Subscriptions.tsx # 订阅管理
│   │       ├── Media.tsx         # 媒体库
│   │       ├── Knowledge.tsx     # 知识库
│   │       └── Tools.tsx         # 工具箱
│   │
│   ├── components/               # 可复用组件
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   ├── habits/
│   │   └── shared/               # 通用组件
│   │       ├── Card.tsx
│   │       ├── Chart.tsx
│   │       └── Modal.tsx
│   │
│   ├── stores/                   # Zustand 状态管理
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   └── notificationStore.ts
│   │
│   ├── services/                 # API 调用层
│   │   ├── api.ts                # Axios 实例
│   │   ├── auth.service.ts
│   │   ├── blog.service.ts
│   │   ├── habits.service.ts
│   │   └── ...
│   │
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useQuery.ts
│   │   └── useWebSocket.ts
│   │
│   ├── utils/                    # 工具函数
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   └── constants.ts
│   │
│   ├── types/                    # TypeScript 类型
│   │   └── index.ts
│   │
│   ├── App.tsx                   # 根组件
│   ├── main.tsx                  # 入口文件
│   └── router.tsx                # 路由配置
│
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 2.3 路由设计

```typescript
// 公开路由
/                     # 首页
/blog                 # 博客列表
/blog/:slug           # 文章详情
/login                # 登录
/register             # 注册

// 私有路由 (需认证)
/dashboard            # 仪表盘
/habits               # 习惯追踪
/subs                 # 订阅管理
/media                # 媒体库
/knowledge            # 知识库
  /knowledge/snippets # 代码片段
  /knowledge/articles # 稍后读
  /knowledge/notes    # 笔记
/tools                # 工具箱
  /tools/price        # 价格追踪
/settings             # 设置
```

### 2.4 状态管理策略

```typescript
// 全局状态 (Zustand)
- authStore: 用户认证状态、Token
- themeStore: 主题配置 (亮/暗)
- notificationStore: 通知消息

// 服务端状态 (TanStack Query)
- 数据缓存
- 自动重新获取
- 乐观更新
- 分页/无限滚动
```

## 3. 后端架构

### 3.1 服务拆分策略

#### 主 API 服务 (Node.js + NestJS)

**职责**:
- 用户认证与授权 (JWT)
- 博客内容管理
- 仪表盘数据聚合
- 作为 API Gateway 调用其他服务

**技术选型理由**:
- NestJS 架构成熟,模块化开发
- TypeScript 类型安全
- Prisma ORM 开发效率高
- 生态丰富 (Passport, Bull 等)

**核心模块**:
```
main-api/
├── src/
│   ├── auth/              # 认证模块
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── guards/
│   ├── users/             # 用户管理
│   ├── posts/             # 博客
│   ├── dashboard/         # 仪表盘聚合
│   ├── gateway/           # 服务网关
│   └── common/            # 通用模块
│       ├── decorators/
│       ├── filters/
│       └── interceptors/
├── prisma/
│   └── schema.prisma
└── test/
```

#### 习惯追踪服务 (Go + Fiber)

**职责**:
- 习惯 CRUD 操作
- 打卡记录 (高频写入)
- 统计计算 (连续天数、完成率)
- 定时提醒任务

**技术选型理由**:
- Goroutine 高效处理并发打卡
- 内存占用低,适合常驻后台
- 编译后单文件部署方便
- Cron 定时任务成熟

**核心结构**:
```
habits-service/
├── cmd/
│   └── main.go
├── internal/
│   ├── handler/           # HTTP 处理器
│   ├── service/           # 业务逻辑
│   ├── repository/        # 数据访问
│   ├── model/             # 数据模型
│   └── cron/              # 定时任务
├── pkg/
│   └── utils/
├── config/
│   └── config.yaml
└── go.mod
```

#### 知识库服务 (Rust + Axum)

**职责**:
- 代码片段存储与检索
- 全文搜索引擎
- 语法高亮处理
- Markdown 渲染

**技术选型理由**:
- 文本处理性能极致
- 内存安全 (处理用户代码)
- 异步 I/O 高效
- 正则引擎速度快

**核心结构**:
```
knowledge-service/
├── src/
│   ├── main.rs
│   ├── handlers/          # 路由处理
│   ├── services/          # 业务逻辑
│   ├── models/            # 数据模型
│   ├── db/                # 数据库操作
│   └── search/            # 搜索引擎
├── migrations/
├── Cargo.toml
└── config.toml
```

#### 工具服务 (Go + Colly)

**职责**:
- 价格追踪爬虫
- 历史数据分析
- 价格变动检测
- 通知触发

**技术选型理由**:
- Colly 爬虫框架强大
- 并发爬取效率高
- 反爬策略支持好

### 3.2 服务间通信

#### 通信方式

```
阶段 1 (初期): HTTP/REST + JSON
- 实现简单
- 调试方便
- 工具支持好

阶段 2 (优化): gRPC (可选)
- 性能更高
- 类型安全
- 双向流支持
```

#### API Gateway 模式

```typescript
// 主 API 作为网关
前端请求 → Nginx → 主 API →
  ├─ 直接处理 (认证、博客)
  └─ 转发到其他服务
      ├─ GET /api/habits/* → habits-service:3001
      ├─ GET /api/knowledge/* → knowledge-service:3003
      └─ GET /api/tools/* → tools-service:3004
```

## 4. 数据架构

### 4.1 数据库设计

**PostgreSQL 主库**:
- 用户数据
- 博客内容
- 习惯记录
- 订阅数据
- 媒体记录
- 知识库内容

**Redis 缓存**:
- Session 存储
- 仪表盘聚合数据 (TTL 1小时)
- 任务队列 (Bull/Asynq)
- 热点数据缓存

**MinIO 对象存储**:
- 用户头像
- 博客图片
- 媒体封面
- 代码截图

### 4.2 核心表结构

详见 [数据库设计文档](./DATABASE.md)

## 5. 认证与授权

### 5.1 认证流程

```
1. 用户登录 → 验证用户名密码
2. 签发 JWT Token (Access + Refresh)
3. 前端存储 Token (localStorage)
4. 请求携带 Authorization: Bearer <token>
5. 后端验证 Token 有效性
6. Token 过期 → 使用 Refresh Token 刷新
```

### 5.2 权限控制

```typescript
// 基于角色的访问控制 (RBAC)
Role: Admin, User

// 资源权限
- 公开资源: 博客文章 (isPublic=true)
- 私有资源: 草稿、习惯数据、个人设置
- 管理资源: 用户管理 (仅 Admin)
```

## 6. 部署架构

### 6.1 开发环境

```yaml
# docker-compose.yml
services:
  postgres, redis, minio
  main-api (热重载)
  其他服务 (可选启动)
```

### 6.2 生产环境

```
方案 1: 单服务器 (初期)
- Docker Compose 管理所有服务
- Nginx 反向代理
- Let's Encrypt SSL

方案 2: 云原生 (扩展期)
- Kubernetes 编排
- Istio 服务网格
- Prometheus 监控
- Grafana 可视化
```

## 7. 监控与日志

### 7.1 日志策略

```
前端:
- Sentry 错误追踪
- Google Analytics 行为分析

后端:
- 结构化日志 (JSON)
- Winston/Zap/Tracing
- 日志聚合 (ELK/Loki)
```

### 7.2 性能监控

```
- API 响应时间
- 数据库慢查询
- Redis 命中率
- 服务健康检查 (/health)
```

## 8. 安全考虑

1. **HTTPS**: 全站加密
2. **CORS**: 严格配置跨域
3. **Rate Limiting**: 接口限流
4. **SQL Injection**: ORM 参数化查询
5. **XSS**: 前端输入过滤
6. **CSRF**: Token 验证
7. **密码**: bcrypt 哈希存储

## 9. 可扩展性设计

### 9.1 水平扩展

```
- 无状态服务设计
- Session 存储在 Redis
- 文件存储在对象存储
- 数据库读写分离 (后期)
```

### 9.2 插件化架构

```typescript
// 工具箱模块支持插件
interface Tool {
  name: string
  icon: string
  component: React.ComponentType
  api: string
}

// 注册新工具
registerTool(PriceTrackerTool)
registerTool(WeatherTool)
```

## 10. 开发规范

### 10.1 代码规范

- **前端**: ESLint + Prettier
- **Node.js**: ESLint + Prettier
- **Go**: gofmt + golangci-lint
- **Rust**: rustfmt + clippy

### 10.2 Git 工作流

```
main: 生产分支
develop: 开发分支
feature/*: 功能分支
fix/*: 修复分支
```

### 10.3 提交规范

```
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 构建
```

---

**文档版本**: v1.0
**最后更新**: 2025-10-20
**维护者**: lingrj
