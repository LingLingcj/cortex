#!/bin/bash

# Cortex - 一键启动脚本
# 用法: ./start.sh [选项]
# 选项:
#   --full    启动所有服务 (基础设施 + 后端 + 前端)
#   --infra   仅启动基础设施 (Docker)
#   --backend 启动基础设施 + 后端
#   --frontend 仅启动前端
#   --help    显示帮助

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示 Banner
show_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║     Cortex - 一键启动脚本                ║"
    echo "║   多功能个人网站系统 (React+NestJS+Go)   ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js (v18+)"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低 (当前: v$NODE_VERSION)，需要 v18+"
        exit 1
    fi
    log_success "Node.js $(node -v) ✓"

    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    log_success "npm $(npm -v) ✓"

    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    log_success "Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1) ✓"

    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    log_success "Docker Compose ✓"
}

# 启动基础设施 (Docker)
start_infrastructure() {
    log_info "启动基础设施 (PostgreSQL, Redis, MinIO)..."

    cd "$PROJECT_ROOT/infra"

    # 检查是否已经运行
    if docker-compose ps | grep -q "Up"; then
        log_warning "基础设施服务已在运行"
    else
        docker-compose up -d

        # 等待服务启动
        log_info "等待数据库启动..."
        sleep 5

        # 检查健康状态
        MAX_RETRIES=30
        RETRY=0
        while [ $RETRY -lt $MAX_RETRIES ]; do
            if docker-compose ps | grep -q "healthy\|Up"; then
                break
            fi
            RETRY=$((RETRY+1))
            echo -n "."
            sleep 1
        done
        echo ""

        log_success "基础设施启动成功"
    fi

    # 显示服务状态
    log_info "服务状态:"
    docker-compose ps

    echo ""
    log_info "服务访问地址:"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis:      localhost:6379"
    echo "  MinIO:      http://localhost:9001 (admin/admin)"
}

# 安装后端依赖
install_backend_deps() {
    log_info "检查后端依赖..."

    cd "$PROJECT_ROOT/services/main-api"

    if [ ! -d "node_modules" ]; then
        log_info "首次运行，安装后端依赖 (这可能需要几分钟)..."
        npm install
        log_success "后端依赖安装完成"
    else
        log_success "后端依赖已安装"
    fi
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."

    cd "$PROJECT_ROOT/services/main-api"

    # 生成 Prisma Client
    if [ ! -d "node_modules/.prisma" ]; then
        log_info "生成 Prisma Client..."
        npx prisma generate
    fi

    # 检查是否需要运行迁移
    if ! npx prisma migrate status | grep -q "Database schema is up to date"; then
        log_info "运行数据库迁移..."
        npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
        log_success "数据库迁移完成"
    else
        log_success "数据库已是最新版本"
    fi
}

# 启动后端
start_backend() {
    log_info "启动后端服务 (NestJS)..."

    cd "$PROJECT_ROOT/services/main-api"

    # 检查环境变量
    if [ ! -f ".env" ]; then
        log_warning ".env 文件不存在，从 .env.example 复制..."
        cp .env.example .env
    fi

    # 在后台启动
    log_info "后端正在启动..."
    npm run start:dev > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"

    # 等待后端启动
    log_info "等待后端服务启动 (约 10 秒)..."
    sleep 10

    # 检查健康状态
    MAX_RETRIES=30
    RETRY=0
    while [ $RETRY -lt $MAX_RETRIES ]; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "后端服务启动成功 ✓"
            echo "  API: http://localhost:3000/api"
            echo "  Health: http://localhost:3000/api/health"
            return 0
        fi
        RETRY=$((RETRY+1))
        echo -n "."
        sleep 1
    done
    echo ""

    log_warning "后端启动可能较慢，请检查日志: tail -f logs/backend.log"
}

# 安装前端依赖
install_frontend_deps() {
    log_info "检查前端依赖..."

    cd "$PROJECT_ROOT/frontend"

    if [ ! -d "node_modules" ]; then
        log_info "首次运行，安装前端依赖 (这可能需要几分钟)..."
        npm install
        log_success "前端依赖安装完成"
    else
        log_success "前端依赖已安装"
    fi
}

# 启动前端
start_frontend() {
    log_info "启动前端服务 (Vite + React)..."

    cd "$PROJECT_ROOT/frontend"

    # 检查环境变量
    if [ ! -f ".env" ]; then
        log_warning ".env 文件不存在，从 .env.example 复制..."
        cp .env.example .env
    fi

    # 在后台启动
    log_info "前端正在启动..."
    npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"

    # 等待前端启动
    log_info "等待前端服务启动 (约 5 秒)..."
    sleep 5

    # 检查健康状态
    MAX_RETRIES=20
    RETRY=0
    while [ $RETRY -lt $MAX_RETRIES ]; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            log_success "前端服务启动成功 ✓"
            echo "  前端: http://localhost:5173"
            return 0
        fi
        RETRY=$((RETRY+1))
        echo -n "."
        sleep 1
    done
    echo ""

    log_warning "前端启动可能较慢，请检查日志: tail -f logs/frontend.log"
}

# 显示访问信息
show_access_info() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          🎉 启动成功！                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}访问地址:${NC}"
    echo "  📱 前端应用:    http://localhost:5173"
    echo "  🔧 API 接口:    http://localhost:3000/api"
    echo "  💊 健康检查:    http://localhost:3000/api/health"
    echo "  🗄️  Prisma Studio: cd services/main-api && npx prisma studio"
    echo "  📦 MinIO 控制台: http://localhost:9001 (minioadmin/minioadmin)"
    echo ""
    echo -e "${BLUE}日志查看:${NC}"
    echo "  tail -f logs/backend.log   # 后端日志"
    echo "  tail -f logs/frontend.log  # 前端日志"
    echo ""
    echo -e "${BLUE}停止服务:${NC}"
    echo "  ./stop.sh                  # 停止所有服务"
    echo ""
}

# 显示帮助
show_help() {
    echo "Cortex - 一键启动脚本"
    echo ""
    echo "用法: ./start.sh [选项]"
    echo ""
    echo "选项:"
    echo "  --full       启动所有服务 (默认)"
    echo "  --infra      仅启动基础设施 (Docker)"
    echo "  --backend    启动基础设施 + 后端"
    echo "  --frontend   仅启动前端"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start.sh              # 启动所有服务"
    echo "  ./start.sh --infra      # 仅启动 Docker 服务"
    echo "  ./start.sh --backend    # 启动后端和数据库"
}

# 主函数
main() {
    show_banner

    # 创建日志目录
    mkdir -p "$PROJECT_ROOT/logs"

    # 解析参数
    MODE="${1:---full}"

    case "$MODE" in
        --help)
            show_help
            exit 0
            ;;
        --infra)
            check_dependencies
            start_infrastructure
            ;;
        --backend)
            check_dependencies
            start_infrastructure
            install_backend_deps
            init_database
            start_backend
            ;;
        --frontend)
            install_frontend_deps
            start_frontend
            ;;
        --full)
            check_dependencies
            start_infrastructure
            echo ""
            install_backend_deps
            init_database
            start_backend
            echo ""
            install_frontend_deps
            start_frontend
            show_access_info
            ;;
        *)
            log_error "未知选项: $MODE"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
