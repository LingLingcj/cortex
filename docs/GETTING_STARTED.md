# 快速开始

本指南将帮助你在 10 分钟内启动 Personal Hub 项目。

## 第一步: 环境准备

确保已安装:
- **Node.js** (v18+)
- **Docker Desktop** 或 Docker Engine

验证安装:
```bash
node --version  # v18.0.0 或更高
npm --version   # v9.0.0 或更高
docker --version
docker-compose --version
```

---

## 第二步: 启动数据库

```bash
cd infra
docker-compose up -d
```

验证服务运行:
```bash
docker-compose ps
# 应该看到 postgres, redis, minio 三个服务都是 "Up" 状态
```

---

## 第三步: 启动后端

```bash
cd services/main-api

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 默认配置可直接使用，无需修改

# 初始化数据库
npx prisma generate
npx prisma migrate dev --name init

# 启动开发服务器
npm run start:dev
```

成功后会看到:
```
✅ Database connected
🚀 Main API service running on http://localhost:3000/api
```

测试 API:
```bash
curl http://localhost:3000/api/health
# 应该返回: {"status":"ok","timestamp":"..."}
```

---

## 第四步: 启动前端

**新开一个终端窗口**:

```bash
cd frontend

# 已在初始化时安装过依赖，如果没有则运行:
# npm install

# 配置环境变量
cp .env.example .env
# 默认配置可直接使用

# 启动开发服务器
npm run dev
```

成功后会看到:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 第五步: 访问应用

打开浏览器访问:
- **前端**: http://localhost:5173
- **API Health**: http://localhost:3000/api/health
- **Prisma Studio** (数据库可视化): `cd services/main-api && npx prisma studio` → http://localhost:5555

---

## 第六步: 创建第一个用户

### 方式 1: 通过前端界面

1. 访问 http://localhost:5173
2. 点击 "Login"
3. 使用演示账号登录 (任意邮箱 + 密码)
   - 当前实现的是 Mock 登录,真实注册功能需要通过 API

### 方式 2: 通过 API (推荐)

```bash
# 注册新用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456",
    "name": "Admin User"
  }'

# 会返回用户信息和 token:
{
  "user": { "id": "...", "email": "admin@example.com", ... },
  "token": "eyJhbGc..."
}
```

保存这个 token，后续请求需要用到。

---

## 第七步: 创建第一篇博客

```bash
# 使用上一步获取的 token
TOKEN="your-token-here"

curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello Personal Hub",
    "slug": "hello-personal-hub",
    "content": "# Welcome\n\nThis is my first post!",
    "excerpt": "My first blog post",
    "isPublic": true,
    "isDraft": false,
    "tags": ["welcome", "first-post"]
  }'
```

查看文章:
```bash
curl http://localhost:3000/api/posts?public=true
```

---

## 故障排查

### 问题 1: Docker 服务启动失败

**解决**:
```bash
cd infra
docker-compose down -v  # 清理所有数据
docker-compose up -d    # 重新启动
```

### 问题 2: 数据库连接错误

**检查**:
```bash
docker-compose logs postgres
```

**确保** `.env` 文件中的连接字符串正确:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/personal_hub?schema=public"
```

### 问题 3: 前端无法请求后端

**检查 CORS 配置**:
- 确保后端 `main.ts` 中 CORS 允许 `http://localhost:5173`
- 或在前端 `vite.config.ts` 中配置代理 (已配置)

### 问题 4: Prisma 报错

```bash
cd services/main-api
rm -rf node_modules prisma/.prisma  # 清理
npm install
npx prisma generate
npx prisma migrate reset  # 重置数据库
```

---

## 下一步

现在你已经成功运行了 Personal Hub！可以:

1. 📖 阅读 [开发指南](./DEVELOPMENT.md) 了解如何开发新功能
2. 🏗️ 查看 [架构文档](./architecture/ARCHITECTURE.md) 理解系统设计
3. 📝 参考 [API 文档](./api/API.md) 调用接口
4. 🔧 尝试添加新的功能模块

---

## 项目目录导航

```
blog/
├── frontend/          # 前端代码 (React + Vite)
├── services/
│   └── main-api/      # 主 API (NestJS)
├── infra/             # Docker 配置
└── docs/              # 文档
```

---

## 常用命令速查

```bash
# 启动所有服务
cd infra && docker-compose up -d
cd services/main-api && npm run start:dev
cd frontend && npm run dev

# 停止所有服务
docker-compose down

# 查看数据库
cd services/main-api && npx prisma studio

# 运行测试
cd services/main-api && npm test

# 构建生产版本
cd frontend && npm run build
cd services/main-api && npm run build
```

---

祝开发愉快! 🚀
