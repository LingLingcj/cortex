# 开发指南

## 开发环境设置

### 前置要求

确保已安装以下工具：

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** & **Docker Compose**
- **Go** >= 1.21 (可选，用于习惯服务)
- **Rust** >= 1.75 (可选，用于知识库服务)

### 第一次设置

#### 1. 克隆项目

```bash
git clone <repository-url>
cd blog
```

#### 2. 启动基础设施

```bash
cd infra
docker-compose up -d

# 验证服务运行
docker-compose ps
```

#### 3. 配置环境变量

**主 API 服务**:
```bash
cd services/main-api
cp .env.example .env
```

编辑 `.env` 文件:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cortex?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

**前端**:
```bash
cd frontend
cp .env.example .env
```

编辑 `.env` 文件:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

#### 4. 安装依赖并初始化数据库

**主 API**:
```bash
cd services/main-api
npm install
npx prisma generate
npx prisma migrate dev --name init
```

**前端**:
```bash
cd frontend
npm install
```

#### 5. 启动开发服务器

**终端 1 - 主 API**:
```bash
cd services/main-api
npm run start:dev
# 运行在 http://localhost:3000/api
```

**终端 2 - 前端**:
```bash
cd frontend
npm run dev
# 运行在 http://localhost:5173
```

#### 6. 访问应用

- 前端: http://localhost:5173
- API: http://localhost:3000/api/health
- Prisma Studio: `npx prisma studio` (http://localhost:5555)

---

## 常用开发命令

### 前端 (frontend/)

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview

# 代码检查
npm run lint
```

### 主 API (services/main-api/)

```bash
# 开发模式 (热重载)
npm run start:dev

# 生产构建
npm run build

# 生产运行
npm run start:prod

# 测试
npm run test
npm run test:watch
npm run test:cov

# 代码检查
npm run lint
```

### 数据库操作

```bash
cd services/main-api

# 生成 Prisma Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name migration_name

# 应用迁移 (生产)
npx prisma migrate deploy

# 重置数据库 (删除所有数据)
npx prisma migrate reset

# 打开数据库管理界面
npx prisma studio

# 查看数据库状态
npx prisma migrate status
```

---

## 项目结构说明

### 前端 (frontend/)

```
src/
├── pages/              # 页面组件
│   ├── public/         # 公开页面 (首页、博客)
│   └── private/        # 需登录页面 (仪表盘等)
├── components/         # 可复用组件
│   ├── layout/         # 布局组件
│   └── shared/         # 通用组件
├── stores/             # Zustand 状态管理
├── services/           # API 调用
├── hooks/              # 自定义 Hooks
├── utils/              # 工具函数
└── types/              # TypeScript 类型
```

### 后端 (services/main-api/)

```
src/
├── auth/               # 认证模块 (JWT)
├── users/              # 用户管理
├── posts/              # 博客模块
├── dashboard/          # 仪表盘聚合
├── prisma/             # Prisma 服务
└── common/             # 通用模块
    ├── decorators/     # 装饰器
    ├── guards/         # 守卫
    ├── interceptors/   # 拦截器
    └── filters/        # 异常过滤器
```

---

## 代码规范

### TypeScript 规范

**变量命名**:
```typescript
// 使用 camelCase
const userName = 'John';
const isActive = true;

// 常量使用 UPPER_CASE
const API_URL = 'http://localhost:3000';

// 接口使用 PascalCase
interface UserProfile {
  id: string;
  name: string;
}

// 类型使用 PascalCase
type Status = 'active' | 'inactive';
```

**函数规范**:
```typescript
// 使用箭头函数 (推荐)
const fetchUser = async (id: string): Promise<User> => {
  // ...
};

// 或常规函数
async function fetchUser(id: string): Promise<User> {
  // ...
}
```

### React 组件规范

```typescript
// 使用函数组件 + TypeScript
interface Props {
  title: string;
  onSubmit: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {
  // Hooks 放在顶部
  const [state, setState] = useState('');
  const navigate = useNavigate();

  // 事件处理函数
  const handleClick = () => {
    // ...
  };

  // 渲染
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Submit</button>
    </div>
  );
};

export default MyComponent;
```

### NestJS 模块规范

```typescript
// Controller
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }
}

// Service
@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.post.findMany();
  }
}

// DTO
export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  content: string;
}
```

---

## API 开发流程

### 1. 创建新模块

```bash
cd services/main-api

# 使用 NestJS CLI 生成模块
npx nest g module subscriptions
npx nest g service subscriptions
npx nest g controller subscriptions
```

### 2. 更新 Prisma Schema

编辑 `prisma/schema.prisma`:
```prisma
model Subscription {
  id     String @id @default(uuid())
  name   String
  amount Float
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

运行迁移:
```bash
npx prisma migrate dev --name add_subscription
```

### 3. 实现业务逻辑

在 `subscriptions.service.ts` 中实现 CRUD 操作。

### 4. 添加认证守卫

```typescript
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  // ...
}
```

### 5. 测试 API

使用 HTTP 客户端 (Postman/Thunder Client) 或 curl:
```bash
# 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

# 登录获取 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 使用 token 访问受保护接口
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 前端开发流程

### 1. 创建新页面

```bash
cd frontend/src/pages/private
# 创建 Subscriptions.tsx
```

### 2. 添加路由

编辑 `src/router.tsx`:
```typescript
{
  path: '/app/subs',
  element: <Subscriptions />
}
```

### 3. 创建 API 服务

编辑 `src/services/subscriptions.service.ts`:
```typescript
import api from './api';

export const subscriptionsService = {
  getAll: () => api.get('/subscriptions'),
  create: (data) => api.post('/subscriptions', data),
  // ...
};
```

### 4. 使用 TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';

const Subscriptions = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsService.getAll,
  });

  if (isLoading) return <Spin />;

  return (
    <div>
      {data?.map(sub => <Card key={sub.id}>{sub.name}</Card>)}
    </div>
  );
};
```

---

## 调试技巧

### 前端调试

1. **React DevTools**: 安装浏览器扩展
2. **Console Logging**:
```typescript
console.log('Debug:', variable);
```

3. **Network 面板**: 查看 API 请求
4. **Vite 错误提示**: 终端会显示详细错误

### 后端调试

1. **NestJS Logger**:
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('PostsService');
logger.log('Creating post');
logger.error('Error occurred', error.stack);
```

2. **Prisma 查询日志**:
编辑 `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

3. **VS Code 调试**: 创建 `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 常见问题

### Q: 数据库连接失败

**A**: 确保 Docker 服务正在运行:
```bash
cd infra
docker-compose ps
docker-compose logs postgres
```

### Q: 前端请求 API 跨域错误

**A**: 检查 NestJS CORS 配置 (`main.ts`):
```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### Q: Prisma Client 未更新

**A**: 重新生成:
```bash
npx prisma generate
```

### Q: 端口被占用

**A**: 修改端口或停止占用进程:
```bash
# 查找占用进程
lsof -i :3000
# 杀死进程
kill -9 <PID>
```

---

## Git 工作流

### 分支策略

```
main          - 生产分支
develop       - 开发分支
feature/*     - 功能分支
fix/*         - 修复分支
```

### 提交规范

```bash
# 格式: type(scope): message

feat(auth): add JWT refresh token
fix(posts): resolve slug duplication bug
docs(readme): update installation guide
style(ui): improve button spacing
refactor(api): simplify user service
test(posts): add unit tests for CRUD
chore(deps): upgrade nestjs to v10
```

### 工作流程

```bash
# 1. 创建功能分支
git checkout -b feature/add-subscriptions

# 2. ���发并提交
git add .
git commit -m "feat(subs): implement subscription management"

# 3. 推送到远程
git push origin feature/add-subscriptions

# 4. 创建 Pull Request
# 5. 合并到 develop
```

---

**最后更新**: 2025-10-20
**维护者**: lingrj
