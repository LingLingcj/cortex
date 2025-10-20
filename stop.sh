#!/bin/bash

# Cortex - 一键停止脚本
# 用法: ./stop.sh [选项]
# 选项:
#   --all      停止所有服务 (默认)
#   --infra    仅停止基础设施 (Docker)
#   --backend  仅停止后端
#   --frontend 仅停止前端
#   --clean    停止所有服务并清理数据
#   --help     显示帮助

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    echo "║     Cortex - 一键停止脚本                ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 停止前端
stop_frontend() {
    log_info "停止前端服务..."

    if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
        PID=$(cat "$PROJECT_ROOT/.frontend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            sleep 2
            # 强制杀死
            kill -9 $PID 2>/dev/null || true
            log_success "前端服务已停止"
        else
            log_warning "前端服务未运行"
        fi
        rm -f "$PROJECT_ROOT/.frontend.pid"
    else
        log_warning "未找到前端 PID 文件"
    fi

    # 额外检查 5173 端口
    if lsof -ti:5173 > /dev/null 2>&1; then
        log_info "发现 5173 端口仍被占用，强制关闭..."
        kill -9 $(lsof -ti:5173) 2>/dev/null || true
    fi
}

# 停止后端
stop_backend() {
    log_info "停止后端服务..."

    if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
        PID=$(cat "$PROJECT_ROOT/.backend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            sleep 3
            # 强制杀死
            kill -9 $PID 2>/dev/null || true
            log_success "后端服务已停止"
        else
            log_warning "后端服务未运行"
        fi
        rm -f "$PROJECT_ROOT/.backend.pid"
    else
        log_warning "未找到后端 PID 文件"
    fi

    # 额外检查 3000 端口
    if lsof -ti:3000 > /dev/null 2>&1; then
        log_info "发现 3000 端口仍被占用，强制关闭..."
        kill -9 $(lsof -ti:3000) 2>/dev/null || true
    fi
}

# 停止基础设施
stop_infrastructure() {
    log_info "停止基础设施 (PostgreSQL, Redis, MinIO)..."

    cd "$PROJECT_ROOT/infra"

    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        log_success "基础设施已停止"
    else
        log_warning "基础设施服务未运行"
    fi
}

# 清理数据
clean_data() {
    log_warning "⚠️  即将删除所有数据 (数据库、缓存、文件存储)"
    read -p "确认删除? (yes/no): " CONFIRM

    if [ "$CONFIRM" = "yes" ]; then
        log_info "清理数据..."
        cd "$PROJECT_ROOT/infra"
        docker-compose down -v
        log_success "数据已清理"
    else
        log_info "取消清理"
    fi
}

# 显示帮助
show_help() {
    echo "Cortex - 一键停止脚本"
    echo ""
    echo "用法: ./stop.sh [选项]"
    echo ""
    echo "选项:"
    echo "  --all        停止所有服务 (默认)"
    echo "  --infra      仅停止基础设施 (Docker)"
    echo "  --backend    仅停止后端"
    echo "  --frontend   仅停止前端"
    echo "  --clean      停止所有服务并清理数据 (⚠️  危险)"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./stop.sh               # 停止所有服务"
    echo "  ./stop.sh --backend     # 仅停止后端"
    echo "  ./stop.sh --clean       # 停止并清理数据"
}

# 主函数
main() {
    show_banner

    MODE="${1:---all}"

    case "$MODE" in
        --help)
            show_help
            exit 0
            ;;
        --frontend)
            stop_frontend
            ;;
        --backend)
            stop_backend
            ;;
        --infra)
            stop_infrastructure
            ;;
        --clean)
            stop_frontend
            stop_backend
            clean_data
            ;;
        --all)
            stop_frontend
            echo ""
            stop_backend
            echo ""
            stop_infrastructure
            echo ""
            log_success "✓ 所有服务已停止"
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
