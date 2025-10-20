# 数据库设计文档

## 概述

Cortex 使用 **PostgreSQL** 作为主数据库，通过 **Prisma ORM** 进行数据建模和访问。

## 数据库连接

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cortex?schema=public"
```

## 数据模型

### ER 图概览

```
User (用户)
 ├─── Post (博客文章)
 ├─── Subscription (订阅)
 ├─── MediaItem (媒体记录)
 ├─── CodeSnippet (代码片段)
 ├─── Article (稍后读文章)
 ├─── Note (笔记)
 └─── Settings (用户设置)

Post ─── Tag (多对多)
```

---

## 1. 用户与认证 (User & Auth)

### User (用户表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| email | String | 邮箱 | UNIQUE, NOT NULL |
| password | String | 密码哈希 (bcrypt) | NOT NULL |
| name | String | 用户名 | NOT NULL |
| avatar | String? | 头像 URL | NULL |
| role | Enum(Role) | 角色 (USER/ADMIN) | DEFAULT: USER |
| createdAt | DateTime | 创建时间 | AUTO |
| updatedAt | DateTime | 更新时间 | AUTO |

**索引**:
- `email` (UNIQUE)

**关系**:
- 一对多: Post, Subscription, MediaItem, etc.
- 一对一: Settings

---

### Settings (用户设置表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| userId | UUID | 用户 ID | FK → User, UNIQUE |
| theme | String | 主题 (light/dark) | DEFAULT: "light" |
| emailNotifications | Boolean | 邮件通知开关 | DEFAULT: true |
| language | String | 语言 | DEFAULT: "en" |
| timezone | String | 时区 | DEFAULT: "UTC" |

---

## 2. 博客 (Blog)

### Post (文章表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| title | String | 标题 | NOT NULL |
| slug | String | URL 别名 | UNIQUE, NOT NULL |
| content | String | Markdown 内容 | NOT NULL |
| excerpt | String? | 摘要 | NULL |
| coverImage | String? | 封面图 URL | NULL |
| isPublic | Boolean | 是否公开 | DEFAULT: false |
| isDraft | Boolean | 是否草稿 | DEFAULT: true |
| views | Int | 浏览次数 | DEFAULT: 0 |
| authorId | UUID | 作者 ID | FK → User |
| createdAt | DateTime | 创建时间 | AUTO |
| updatedAt | DateTime | 更新时间 | AUTO |

**索引**:
- `slug` (UNIQUE)
- `authorId`

**关系**:
- 多对一: User (author)
- 多对多: Tag

---

### Tag (标签表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| name | String | 标签名 | UNIQUE, NOT NULL |

**关系**:
- 多对多: Post

---

## 3. 订阅管理 (Subscriptions)

### Subscription (订阅表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| userId | UUID | 用户 ID | FK → User |
| name | String | 订阅名称 | NOT NULL |
| description | String? | 描述 | NULL |
| amount | Float | 金额 | NOT NULL |
| currency | String | 货币 (USD/CNY) | DEFAULT: "USD" |
| billingCycle | Enum | 计费周期 (MONTHLY/YEARLY) | NOT NULL |
| nextBillingDate | DateTime | 下次扣费日期 | NOT NULL |
| category | String? | 分类 (工具/娱乐/学习) | NULL |
| icon | String? | 图标 URL | NULL |
| isActive | Boolean | 是否启用 | DEFAULT: true |
| createdAt | DateTime | 创建时间 | AUTO |
| updatedAt | DateTime | 更新时间 | AUTO |

**索引**:
- `userId`

---

## 4. 媒体库 (Media)

### MediaItem (媒体记录表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| userId | UUID | 用户 ID | FK → User |
| type | Enum | 类型 (BOOK/MOVIE/TV_SHOW/MUSIC) | NOT NULL |
| title | String | 标题 | NOT NULL |
| creator | String? | 作者/导演/艺术家 | NULL |
| coverUrl | String? | 封面 URL | NULL |
| status | Enum | 状态 (WANT/DOING/DONE) | DEFAULT: WANT |
| rating | Float? | 评分 (0-10) | NULL |
| review | String? | 评论 | NULL |
| startDate | DateTime? | 开始日期 | NULL |
| finishDate | DateTime? | 完成日期 | NULL |
| tags | String[] | 标签数组 | [] |
| externalId | String? | 外部 ID (豆瓣/TMDB) | NULL |
| createdAt | DateTime | 创建时间 | AUTO |
| updatedAt | DateTime | 更新时间 | AUTO |

**索引**:
- `userId`
- `type`

**枚举值**:
```typescript
MediaType: BOOK | MOVIE | TV_SHOW | MUSIC
MediaStatus: WANT | DOING | DONE
```

---

## 5. 知识库 (Knowledge)

### CodeSnippet (代码片段表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| userId | UUID | 用户 ID | FK → User |
| title | String | 标题 | NOT NULL |
| description | String? | 描述 | NULL |
| code | String | 代码内容 | NOT NULL |
| language | String | 编程语言 (js/python/go) | NOT NULL |
| tags | String[] | 标签 | [] |
| isPublic | Boolean | 是否公开 | DEFAULT: false |
| createdAt | DateTime | 创建时间 | AUTO |
| updatedAt | DateTime | 更新时间 | AUTO |

**索引**:
- `userId`

---

### Article (稍后读文章表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| userId | UUID | 用户 ID | FK → User |
| url | String | 文章链接 | NOT NULL |
| title | String | 标题 | NOT NULL |
| excerpt | String? | 摘要 | NULL |
| coverUrl | String? | 封面图 | NULL |
| tags | String[] | 标签 | [] |
| isRead | Boolean | 是否已读 | DEFAULT: false |
| savedAt | DateTime | 保存时间 | AUTO |

**索引**:
- `userId`

---

### Note (笔记表)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PK |
| userId | UUID | 用户 ID | FK → User |
| title | String | 标题 | NOT NULL |
| content | String | Markdown 内容 | NOT NULL |
| tags | String[] | 标签 | [] |
| folder | String? | 文件夹 | NULL |
| createdAt | DateTime | 创建时间 | AUTO |
| updatedAt | DateTime | 更新时间 | AUTO |

**索引**:
- `userId`

---

## 6. 其他服务的数据库 (独立设计)

### Habits Service (Go)
**未在主 Schema 中定义**，由 Go 服务独立管理。

建议表结构:
```sql
habits (习惯定义)
  - id, user_id, name, frequency, target, category, created_at

habit_logs (打卡记录)
  - id, habit_id, date, completed, note, created_at
```

### Tools Service (Go)
价格追踪器数据:
```sql
price_trackers
  - id, user_id, product_url, current_price, target_price, created_at

price_history
  - id, tracker_id, price, checked_at
```

---

## 数据迁移

### 创建迁移
```bash
cd services/main-api
npx prisma migrate dev --name init
```

### 应用迁移
```bash
npx prisma migrate deploy
```

### 重置数据库
```bash
npx prisma migrate reset
```

### 生成 Prisma Client
```bash
npx prisma generate
```

---

## 性能优化

### 1. 索引策略
- 所有外键添加索引
- 频繁查询的字段添加索引 (slug, email)
- 复合索引 (userId + createdAt)

### 2. 查询优化
```typescript
// 使用 select 减少数据量
await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    excerpt: true,
  },
});

// 使用 include 减少查询次数
await prisma.user.findUnique({
  where: { id },
  include: {
    posts: true,
    settings: true,
  },
});
```

### 3. 分页
```typescript
const posts = await prisma.post.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

---

## 备份策略

### 定期备份 (生产环境)
```bash
# 导出数据
pg_dump -U postgres cortex > backup.sql

# 恢复数据
psql -U postgres cortex < backup.sql
```

### Docker 数据卷备份
```bash
docker run --rm \
  -v cortex_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

**文档版本**: v1.0
**最后更新**: 2025-10-20
**维护者**: lingrj
