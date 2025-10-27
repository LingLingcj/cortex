# 微服务开发指南

## 1. 本地开发环境设置

### 1.1 开发模式分层

```yaml
# 开发环境矩阵
modes:
  standalone:    # 单服务开发模式
    focus: 单个服务开发
    impact: 最小
    complexity: 低

  integration:   # 服务集成开发模式
    focus: 跨服务功能
    impact: 中等
    complexity: 中

  full:          # 全栈开发模式
    focus: 端到端测试
    impact: 最大
    complexity: 高
```

### 1.2 开发环境配置

#### 模式1: 单服务开发 (推荐日常使用)

```bash
# 启动基础环境 (1个终端)
cd infra
docker-compose up -d postgres redis minio

# 开发单个服务 (1个终端)
cd services/main-api
npm run start:dev

# 前端Mock模式 (1个终端)
cd frontend
MOCK_API=true npm run dev
```

**优势**:
- 启动快 (< 10秒)
- 资源占用少
- 专注单功能开发
- 前端独立开发

#### 模式2: 集成开发模式

```bash
# 启动多个服务 (使用开发脚本)
./scripts/dev-start.sh --services main-api,habin-service
```

#### 模式3: 完整开发模式

```bash
# 启动所有服务
./scripts/dev-start.sh --all
```

## 2. 服务解耦策略

### 2.1 数据库分离

```sql
-- 按服务拆分数据库
main_db:       -- 主服务
  - users
  - posts
  - tags

habits_db:     -- 习惯服务
  - habits
  - habit_logs

knowledge_db:  -- 知识库服务
  - code_snippets
  - articles
  - notes

media_db:      -- 媒体服务
  - media_items
  - subscriptions
```

### 2.2 共享数据设计

```typescript
// 用户数据 - 主服务拥有，其他服务通过API获取
interface User {
  id: string;
  email: string;
  name: string;
  // 其他服务需要的最小字段
}

// 服务间数据同步策略
const syncStrategies = {
  userId: "通过认证Token获取",
  userBasicInfo: "主服务API查询",
  crossServiceData: "事件驱动同步"
};
```

### 2.3 API契约管理

```typescript
// shared/types/api-contracts.ts
export interface ServiceContracts {
  'main-api': {
    '/auth/login': {
      request: { email: string; password: string };
      response: { token: string; user: User };
    };
    '/posts': { ... };
  };

  'habits-service': {
    '/habits': {
      request: { name: string; frequency: string };
      response: Habit;
    };
  };
}

// 自动生成客户端代码
// npm run generate:api-clients
```

## 3. 测试策略

### 3.1 测试金字塔

```
                /\
               /  \   E2E Tests (少量)
              /____\
             /      \  Integration Tests (适量)
            /__________\ Unit Tests (大量)
```

### 3.2 单元测试 (每个服务独立)

```typescript
// services/main-api/src/auth/auth.service.spec.ts
describe('AuthService', () => {
  describe('register', () => {
    it('should register new user', async () => {
      // 使用Mock数据库
      const result = await authService.register(userData);
      expect(result).toBeDefined();
    });
  });
});
```

### 3.3 集成测试

```typescript
// tests/integration/auth-flow.test.ts
describe('Auth Flow Integration', () => {
  it('should complete full auth flow', async () => {
    // 1. 注册
    const registerResponse = await request(mainApi)
      .post('/auth/register')
      .send(userData);

    // 2. 登录
    const loginResponse = await request(mainApi)
      .post('/auth/login')
      .send(credentials);

    // 3. 访问受保护资源
    const protectedResponse = await request(mainApi)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${loginResponse.token}`);

    expect(protectedResponse.status).toBe(200);
  });
});
```

### 3.4 契约测试

```typescript
// tests/contracts/main-api.contract.test.ts
describe('Main API Contract', () => {
  it('should maintain API contract', async () => {
    const response = await request(mainApi)
      .get('/posts')
      .expect(200);

    // 验证响应结构符合契约
    expect(response.body).toMatchSchema(postListSchema);
  });
});
```

## 4. 开发工作流

### 4.1 Git分支策略

```
main (生产)
├── develop (开发集成分支)
│   ├── feature/blog-editor (功能分支)
│   ├── feature/habit-service (新服务分支)
│   └── fix/auth-bug (修复分支)
```

### 4.2 代码审查检查点

```yaml
PR检查清单:
  backend:
    - [ ] 单元测试覆盖率 > 80%
    - [ ] 集成测试通过
    - [ ] API契约测试通过
    - [ ] 数据库迁移脚本
    - [ ] 环境变量配置

  frontend:
    - [ ] TypeScript编译通过
    - [ ] 组件测试通过
    - [ ] E2E测试通过
    - [ ] Mock API更新

  cross-service:
    - [ ] 服务间通信测试
    - [ ] 数据一致性检查
    - [ ] 性能回归测试
```

## 5. Mock策略

### 5.1 前端Mock

```typescript
// frontend/src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Mock未开发的服务
  rest.get('/api/habits', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: '早起', frequency: 'daily' },
        { id: '2', name: '运动', frequency: 'weekly' }
      ])
    );
  }),
];
```

### 5.2 服务Mock

```typescript
// services/main-api/src/mocks/external-services.ts
export class MockHabitsService {
  async getUserHabits(userId: string): Promise<Habit[]> {
    // 返回模拟数据
    return mockHabits;
  }
}
```

## 6. 环境管理

### 6.1 多环境配置

```bash
# 环境变量管理
.env.local          # 本地开发 (不提交)
.env.development    # 开发环境
.env.staging        # 预发布环境
.env.production     # 生产环境
```

### 6.2 Docker开发环境

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  main-api:
    build:
      context: ./services/main-api
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/main-api:/app  # 热重载
      - /app/node_modules

  habits-service:
    build:
      context: ./services/habits-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/habits-service:/app
```

## 7. CI/CD流程

### 7.1 开发流程

```yaml
# .github/workflows/develop.yml
name: Development Pipeline

on:
  push:
    branches: [develop, feature/*]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci && npm test

  test-backend:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [main-api, habits-service]
    steps:
      - uses: actions/checkout@v3
      - run: cd services/${{ matrix.service }} && npm ci && npm test

  integration-test:
    needs: [test-frontend, test-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Start services
        run: docker-compose -f docker-compose.test.yml up -d
      - name: Run integration tests
        run: npm run test:integration
```

### 7.2 部署策略

```yaml
# 滚动部署策略
deployment:
  strategy: rolling
  maxUnavailable: 1
  maxSurge: 1

  # 蓝绿部署 (关键服务)
  production:
    strategy: blue-green
    switch Traffic: 100%
```

## 8. 监控和调试

### 8.1 服务健康检查

```typescript
// 每个服务的健康检查端点
@app.Get('/health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      external: await this.checkExternalServices()
    }
  };
}
```

### 8.2 分布式追踪

```typescript
// 使用OpenTelemetry
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('main-api');

@app.Post('/posts')
async createPost(@Body() createPostDto: CreatePostDto) {
  const span = tracer.startSpan('create-post');

  try {
    span.setAttributes({
      'user.id': createPostDto.userId,
      'post.title': createPostDto.title
    });

    const result = await this.postsService.create(createPostDto);

    span.setAttributes({ 'post.id': result.id });
    return result;
  } finally {
    span.end();
  }
}
```

## 9. 最佳实践

### 9.1 开发原则

1. **独立开发**: 每个服务应该能独立开发和测试
2. **API优先**: 先定义API契约，再实现功能
3. **向后兼容**: API变更保持向后兼容
4. **文档同步**: API文档与代码同步更新
5. **监控第一**: 每个服务都要有监控和日志

### 9.2 代码组织

```
项目结构优化:
├── services/
│   ├── main-api/          # 主服务
│   ├── habits-service/    # 习惯服务
│   └── knowledge-service/ # 知识库服务
├── shared/
│   ├── types/             # 共享类型定义
│   ├── contracts/         # API契约
│   └── utils/             # 共享工具
├── frontend/
│   └── src/
│       ├── services/      # API客户端
│       └── mocks/         # Mock数据
├── tests/
│   ├── integration/       # 集成测试
│   ├── e2e/              # 端到端测试
│   └── contracts/        # 契约测试
└── scripts/
    ├── dev-start.sh      # 开发启动脚本
    ├── test-all.sh       # 全量测试脚本
    └── deploy.sh         # 部署脚本
```

### 9.3 开发工具配置

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

---

## 快速开始

1. **单服务开发**:
   ```bash
   ./scripts/dev-start.sh --service main-api
   ```

2. **集成开发**:
   ```bash
   ./scripts/dev-start.sh --services main-api,habits-service
   ```

3. **运行测试**:
   ```bash
   ./scripts/test.sh --unit        # 单元测试
   ./scripts/test.sh --integration # 集成测试
   ./scripts/test.sh --all         # 所有测试
   ```

4. **代码提交**:
   ```bash
   ./scripts/pre-commit.sh         # 预提交检查
   ```

这个指南将帮助你更高效地进行微服务开发测试！