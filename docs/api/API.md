# API 接口文档

Base URL: `http://localhost:3000/api`

## 认证

所有需要认证的接口需要在请求头中携带 JWT Token:

```
Authorization: Bearer <token>
```

---

## 1. 认证 (Auth)

### 1.1 注册用户

**POST** `/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "role": "USER",
    "createdAt": "2025-10-20T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.2 用户登录

**POST** `/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "role": "USER",
    "createdAt": "2025-10-20T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 获取当前用户信息

**GET** `/auth/profile` 🔒

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "role": "USER",
  "createdAt": "2025-10-20T10:00:00.000Z",
  "settings": {
    "theme": "light",
    "emailNotifications": true,
    "language": "en",
    "timezone": "UTC"
  }
}
```

---

## 2. 用户 (Users)

### 2.1 获取用户详情

**GET** `/users/:id` 🔒

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "role": "USER",
  "createdAt": "2025-10-20T10:00:00.000Z",
  "settings": { ... }
}
```

---

### 2.2 更新用户信息

**PATCH** `/users/:id` 🔒

**Request Body**:
```json
{
  "name": "Jane Doe",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar": "https://example.com/new-avatar.jpg",
  "role": "USER",
  "updatedAt": "2025-10-20T11:00:00.000Z"
}
```

---

## 3. 博客 (Posts)

### 3.1 获取所有文章

**GET** `/posts?public=true`

**Query Parameters**:
- `public` (optional): `true` 只返回公开文章，不传则返回所有

**Response** (200):
```json
[
  {
    "id": "uuid",
    "title": "Getting Started with NestJS",
    "slug": "getting-started-nestjs",
    "excerpt": "A comprehensive guide to NestJS...",
    "coverImage": "https://example.com/cover.jpg",
    "isPublic": true,
    "isDraft": false,
    "views": 120,
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "tags": [
      { "id": "uuid", "name": "nestjs" },
      { "id": "uuid", "name": "tutorial" }
    ],
    "createdAt": "2025-10-15T10:00:00.000Z",
    "updatedAt": "2025-10-15T10:00:00.000Z"
  }
]
```

---

### 3.2 获取文章详情 (通过 ID)

**GET** `/posts/:id`

**Response** (200):
```json
{
  "id": "uuid",
  "title": "Getting Started with NestJS",
  "slug": "getting-started-nestjs",
  "content": "# Introduction\n\nThis is the full content...",
  "excerpt": "A comprehensive guide...",
  "coverImage": "https://example.com/cover.jpg",
  "isPublic": true,
  "isDraft": false,
  "views": 121,
  "author": { ... },
  "tags": [ ... ],
  "createdAt": "2025-10-15T10:00:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z"
}
```

---

### 3.3 获取文章详情 (通过 Slug)

**GET** `/posts/slug/:slug`

**Response**: 同上

---

### 3.4 创建文章

**POST** `/posts` 🔒

**Request Body**:
```json
{
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "# Hello World\n\nThis is my post content...",
  "excerpt": "A short summary",
  "coverImage": "https://example.com/cover.jpg",
  "isPublic": false,
  "isDraft": true,
  "tags": ["nestjs", "tutorial"]
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "# Hello World\n\n...",
  "excerpt": "A short summary",
  "coverImage": "https://example.com/cover.jpg",
  "isPublic": false,
  "isDraft": true,
  "views": 0,
  "author": { ... },
  "tags": [ ... ],
  "createdAt": "2025-10-20T10:00:00.000Z",
  "updatedAt": "2025-10-20T10:00:00.000Z"
}
```

---

### 3.5 更新文章

**PATCH** `/posts/:id` 🔒

**Request Body**: 同创建文章 (所有字段可选)

**Response** (200): 同创建文章响应

---

### 3.6 删除文章

**DELETE** `/posts/:id` 🔒

**Response** (200):
```json
{
  "message": "Post deleted successfully"
}
```

---

## 4. 仪表盘 (Dashboard)

### 4.1 获取统计数据

**GET** `/dashboard/stats` 🔒

**Response** (200):
```json
{
  "posts": 15,
  "subscriptions": 8,
  "monthlySubscriptionTotal": 156.50,
  "media": 45,
  "snippets": 23,
  "articles": 67,
  "unreadArticles": 12
}
```

---

### 4.2 获取最近活动

**GET** `/dashboard/activity` 🔒

**Response** (200):
```json
{
  "recentPosts": [
    {
      "id": "uuid",
      "title": "Recent Post",
      "updatedAt": "2025-10-20T10:00:00.000Z",
      "isDraft": true
    }
  ],
  "recentMedia": [
    {
      "id": "uuid",
      "title": "The Matrix",
      "type": "MOVIE",
      "updatedAt": "2025-10-19T15:30:00.000Z"
    }
  ],
  "recentSnippets": [
    {
      "id": "uuid",
      "title": "React Hook Example",
      "language": "typescript",
      "createdAt": "2025-10-18T09:00:00.000Z"
    }
  ]
}
```

---

## 5. 健康检查

### 5.1 服务健康状态

**GET** `/health`

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T10:00:00.000Z"
}
```

---

## 错误响应格式

所有错误响应遵循以下格式:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["title must be longer than or equal to 3 characters"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 未来计划的接口 (待实现)

### 订阅管理 (Subscriptions)
- `GET /subscriptions` - 获取订阅列表
- `POST /subscriptions` - 创建订阅
- `PATCH /subscriptions/:id` - 更新订阅
- `DELETE /subscriptions/:id` - 删除订阅
- `GET /subscriptions/stats` - 订阅统计

### 媒体库 (Media)
- `GET /media` - 获取媒体列表
- `POST /media` - 添加媒体
- `PATCH /media/:id` - 更新媒体
- `DELETE /media/:id` - 删除媒体

### 知识库 (Knowledge)
- `GET /snippets` - 代码片段列表
- `POST /snippets` - 创建代码片段
- `GET /articles` - 稍后读文章列表
- `POST /articles` - 保存文章
- `GET /notes` - 笔记列表
- `POST /notes` - 创建笔记

### 习惯追踪 (由 Go 服务实现)
- `GET /habits` - 习惯列表
- `POST /habits` - 创建习惯
- `POST /habits/:id/log` - 打卡记录
- `GET /habits/stats` - 统计数据

---

## 测试示例

### 使用 curl

```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

# 登录
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}' | jq -r '.token')

# 获取个人信息
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 创建文章
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My First Post",
    "slug":"my-first-post",
    "content":"Hello World",
    "isPublic":true,
    "isDraft":false,
    "tags":["test"]
  }'
```

### 使用 JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// 登录
const { data } = await api.post('/auth/login', {
  email: 'test@example.com',
  password: '123456',
});

// 设置 token
api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

// 获取文章
const posts = await api.get('/posts?public=true');
console.log(posts.data);
```

---

**文档版本**: v1.0
**最后更新**: 2025-10-20
**维护者**: lingrj
