# Infrastructure

This directory contains infrastructure configurations for the Personal Hub project.

## Services

### PostgreSQL (Port 5432)
- **User**: postgres
- **Password**: postgres
- **Database**: personal_hub
- **Connection URL**: `postgresql://postgres:postgres@localhost:5432/personal_hub`

### Redis (Port 6379)
- **Host**: localhost
- **Port**: 6379
- **No authentication** (development only)

### MinIO (Ports 9000, 9001)
- **API Port**: 9000
- **Console Port**: 9001
- **Root User**: minioadmin
- **Root Password**: minioadmin
- **Console URL**: http://localhost:9001

## Quick Start

### Start all services
```bash
cd infra
docker-compose up -d
```

### Check service status
```bash
docker-compose ps
```

### View logs
```bash
docker-compose logs -f [service-name]
# Example: docker-compose logs -f postgres
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove data
```bash
docker-compose down -v
```

## Database Management

### Access PostgreSQL CLI
```bash
docker exec -it personal-hub-db psql -U postgres -d personal_hub
```

### Run migrations (from main-api directory)
```bash
cd ../services/main-api
npx prisma migrate dev
```

### View database with Prisma Studio
```bash
cd ../services/main-api
npx prisma studio
# Opens at http://localhost:5555
```

## Redis Management

### Access Redis CLI
```bash
docker exec -it personal-hub-redis redis-cli
```

### Common Redis commands
```bash
# Check connection
PING

# List all keys
KEYS *

# Get a value
GET key-name

# Flush all data (use carefully!)
FLUSHALL
```

## MinIO Setup

1. Access MinIO Console at http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. Create a bucket named `personal-hub`
4. Set bucket policy to public (for images)

## Troubleshooting

### Port already in use
If you get port conflicts, change the port mapping in docker-compose.yml:
```yaml
ports:
  - "5433:5432"  # Change 5432 to 5433 for PostgreSQL
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
cd ../services/main-api
npx prisma migrate dev
```

### Check container health
```bash
docker-compose ps
# Look for "healthy" status
```
