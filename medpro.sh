#!/usr/bin/env bash
# =============================================================
#  MedPro-Vue3-FastAPI  开发环境管理脚本
#  用法：./medpro.sh [命令]
#
#  命令列表：
#    start          启动全部服务（docker + 后端 + 前端 + 门户）
#    stop           停止所有进程
#    restart        重启所有进程
#    start:be       仅启动后端
#    stop:be        仅停止后端
#    restart:be     仅重启后端
#    start:fe       仅启动前端
#    stop:fe        仅停止前端
#    restart:fe     仅重启前端
#    start:portal   仅启动门户
#    stop:portal    仅停止门户
#    restart:portal 仅重启门户
#    docker:start   启动 Docker 容器（MySQL + Redis）
#    docker:stop    停止 Docker 容器
#    status         查看所有服务状态
#    logs:be        实时查看后端日志
#    logs:fe        实时查看前端日志
#    logs:portal    实时查看门户日志
# =============================================================

set -e

# ---------- 路径配置 ----------
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/medpro-fastapi-backend"
FRONTEND_DIR="$PROJECT_ROOT/medpro-fastapi-frontend"
PORTAL_DIR="$PROJECT_ROOT/medpro-fastapi-portal"
PYTHON="$BACKEND_DIR/.venv/bin/python"

# ---------- 日志文件 ----------
BE_LOG="/tmp/medpro-backend.log"
FE_LOG="/tmp/medpro-frontend.log"
PORTAL_LOG="/tmp/medpro-portal.log"

# ---------- PID 文件 ----------
BE_PID_FILE="/tmp/medpro-backend.pid"
FE_PID_FILE="/tmp/medpro-frontend.pid"
PORTAL_PID_FILE="/tmp/medpro-portal.pid"

# ---------- Docker 容器 ----------
MYSQL_CONTAINER="Medpro-mysql"
REDIS_CONTAINER="Medpro-redis"

# ---------- 颜色 ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }
section() { echo -e "\n${BOLD}══════ $* ══════${NC}"; }

# ---------- 工具函数 ----------
is_running() {
    local pid_file="$1"
    [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

stop_proc() {
    local pid_file="$1"
    local name="$2"
    if is_running "$pid_file"; then
        local pid
        pid=$(cat "$pid_file")
        kill "$pid" 2>/dev/null
        sleep 1
        kill -9 "$pid" 2>/dev/null || true
        rm -f "$pid_file"
        ok "$name 已停止（PID: $pid）"
    else
        warn "$name 未在运行"
    fi
}

# ---------- Docker ----------
docker_start() {
    section "启动 Docker 容器"
    for container in "$MYSQL_CONTAINER" "$REDIS_CONTAINER"; do
        local status
        status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || echo "not_found")
        case "$status" in
            running)  ok "$container 已在运行" ;;
            exited)   docker start "$container" > /dev/null && ok "$container 已重新启动" ;;
            not_found) warn "$container 容器不存在，请手动创建" ;;
            *)        warn "$container 状态异常: $status" ;;
        esac
    done

    # 等待 MySQL 就绪
    info "等待 MySQL 就绪..."
    local i=0
    until docker exec "$MYSQL_CONTAINER" mysqladmin ping -h127.0.0.1 -uroot -pmysqlroot --silent 2>/dev/null; do
        ((i++))
        [[ $i -gt 15 ]] && { error "MySQL 启动超时"; return 1; }
        sleep 2
    done
    ok "MySQL 就绪"
}

docker_stop() {
    section "停止 Docker 容器"
    for container in "$MYSQL_CONTAINER" "$REDIS_CONTAINER"; do
        docker stop "$container" 2>/dev/null && ok "$container 已停止" || warn "$container 未运行"
    done
}

# ---------- 后端 ----------
start_backend() {
    section "启动后端"
    if is_running "$BE_PID_FILE"; then
        warn "后端已在运行（PID: $(cat "$BE_PID_FILE")）"
        return
    fi
    if [[ ! -f "$PYTHON" ]]; then
        error "虚拟环境未找到: $PYTHON"
        error "请先执行: cd $BACKEND_DIR && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
        return 1
    fi
    cd "$BACKEND_DIR"
    nohup "$PYTHON" app.py --env=dev > "$BE_LOG" 2>&1 &
    local pid=$!
    echo "$pid" > "$BE_PID_FILE"
    sleep 3
    if is_running "$BE_PID_FILE"; then
        ok "后端已启动（PID: $pid）"
        info "API 地址: http://127.0.0.1:9099"
        info "日志文件: $BE_LOG"
    else
        error "后端启动失败，查看日志: $BE_LOG"
        tail -20 "$BE_LOG"
    fi
}

stop_backend() {
    section "停止后端"
    stop_proc "$BE_PID_FILE" "后端"
    # 清理可能残留的占用 9099 端口的进程
    local stale_pid
    stale_pid=$(lsof -ti :9099 2>/dev/null || true)
    if [[ -n "$stale_pid" ]]; then
        kill -9 $stale_pid 2>/dev/null || true
        ok "已清理残留后端进程（PID: $stale_pid）"
    fi
}

# ---------- 前端 ----------
start_frontend() {
    section "启动前端"
    if is_running "$FE_PID_FILE"; then
        warn "前端已在运行（PID: $(cat "$FE_PID_FILE")）"
        return
    fi
    if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
        info "安装前端依赖..."
        cd "$FRONTEND_DIR"
        npm install --registry=https://registry.npmmirror.com
    fi
    cd "$FRONTEND_DIR"
    nohup npm run dev > "$FE_LOG" 2>&1 &
    local pid=$!
    echo "$pid" > "$FE_PID_FILE"
    sleep 5
    if is_running "$FE_PID_FILE"; then
        ok "前端已启动（PID: $pid）"
        info "访问地址: http://localhost:3000"
        info "日志文件: $FE_LOG"
    else
        error "前端启动失败，查看日志: $FE_LOG"
        tail -20 "$FE_LOG"
    fi
}

stop_frontend() {
    section "停止前端"
    stop_proc "$FE_PID_FILE" "前端"
    # 同时清理可能残留的 vite 进程
    pkill -f "vite" 2>/dev/null || true
}

# ---------- 门户 ----------
start_portal() {
    section "启动门户"
    if is_running "$PORTAL_PID_FILE"; then
        warn "门户已在运行（PID: $(cat "$PORTAL_PID_FILE")）"
        return
    fi
    if [[ ! -d "$PORTAL_DIR/node_modules" ]]; then
        info "安装门户依赖..."
        cd "$PORTAL_DIR"
        npm install --registry=https://registry.npmmirror.com
    fi
    cd "$PORTAL_DIR"
    nohup npm run dev > "$PORTAL_LOG" 2>&1 &
    local pid=$!
    echo "$pid" > "$PORTAL_PID_FILE"
    sleep 5
    if is_running "$PORTAL_PID_FILE"; then
        ok "门户已启动（PID: $pid）"
        info "访问地址: http://localhost:5173"
        info "日志文件: $PORTAL_LOG"
    else
        error "门户启动失败，查看日志: $PORTAL_LOG"
        tail -20 "$PORTAL_LOG"
    fi
}

stop_portal() {
    section "停止门户"
    stop_proc "$PORTAL_PID_FILE" "门户"
}

# ---------- 状态 ----------
status() {
    section "服务状态"
    # Docker
    echo -e "\n${BOLD}[ Docker 容器 ]${NC}"
    for container in "$MYSQL_CONTAINER" "$REDIS_CONTAINER"; do
        local st
        st=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || echo "not_found")
        if [[ "$st" == "running" ]]; then
            local ports
            ports=$(docker port "$container" 2>/dev/null | tr '\n' '  ')
            echo -e "  ${GREEN}✔${NC} $container  ($ports)"
        else
            echo -e "  ${RED}✘${NC} $container  ($st)"
        fi
    done

    # 后端
    echo -e "\n${BOLD}[ 后端 FastAPI ]${NC}"
    if is_running "$BE_PID_FILE"; then
        echo -e "  ${GREEN}✔${NC} 运行中（PID: $(cat "$BE_PID_FILE")）  http://127.0.0.1:9099"
    else
        echo -e "  ${RED}✘${NC} 未运行"
    fi

    # 前端
    echo -e "\n${BOLD}[ 前端 Vite ]${NC}"
    if is_running "$FE_PID_FILE"; then
        echo -e "  ${GREEN}✔${NC} 运行中（PID: $(cat "$FE_PID_FILE")）  http://localhost:3000"
    else
        echo -e "  ${RED}✘${NC} 未运行"
    fi

    # 门户
    echo -e "\n${BOLD}[ 门户 Vite ]${NC}"
    if is_running "$PORTAL_PID_FILE"; then
        echo -e "  ${GREEN}✔${NC} 运行中（PID: $(cat "$PORTAL_PID_FILE")）  http://localhost:5173"
    else
        echo -e "  ${RED}✘${NC} 未运行"
    fi
    echo ""
}

# ---------- 入口 ----------
case "${1:-}" in
    start)
        docker_start
        start_backend
        start_frontend
        start_portal
        status
        ;;
    stop)
        stop_portal
        stop_frontend
        stop_backend
        ;;
    restart)
        stop_portal
        stop_frontend
        stop_backend
        sleep 1
        start_backend
        start_frontend
        start_portal
        status
        ;;
    start:be)   start_backend ;;
    stop:be)    stop_backend ;;
    restart:be) stop_backend; sleep 1; start_backend ;;
    start:fe)      start_frontend ;;
    stop:fe)       stop_frontend ;;
    restart:fe)    stop_frontend; sleep 1; start_frontend ;;
    start:portal)  start_portal ;;
    stop:portal)   stop_portal ;;
    restart:portal) stop_portal; sleep 1; start_portal ;;
    docker:start)  docker_start ;;
    docker:stop)   docker_stop ;;
    status)        status ;;
    logs:be)       tail -f "$BE_LOG" ;;
    logs:fe)       tail -f "$FE_LOG" ;;
    logs:portal)   tail -f "$PORTAL_LOG" ;;
    *)
        echo -e "${BOLD}MedPro 开发环境管理脚本${NC}"
        echo ""
        echo "用法: $0 <命令>"
        echo ""
        echo -e "${BOLD}全局命令：${NC}"
        echo "  start           启动全部（Docker + 后端 + 前端 + 门户）"
        echo "  stop            停止所有服务"
        echo "  restart         重启所有服务"
        echo "  status          查看所有服务状态"
        echo ""
        echo -e "${BOLD}后端命令：${NC}"
        echo "  start:be        启动后端"
        echo "  stop:be         停止后端"
        echo "  restart:be      重启后端"
        echo "  logs:be         实时查看后端日志"
        echo ""
        echo -e "${BOLD}前端命令：${NC}"
        echo "  start:fe        启动前端"
        echo "  stop:fe         停止前端"
        echo "  restart:fe      重启前端"
        echo "  logs:fe         实时查看前端日志"
        echo ""
        echo -e "${BOLD}门户命令：${NC}"
        echo "  start:portal    启动门户"
        echo "  stop:portal     停止门户"
        echo "  restart:portal  重启门户"
        echo "  logs:portal     实时查看门户日志"
        echo ""
        echo -e "${BOLD}Docker 命令：${NC}"
        echo "  docker:start    启动 MySQL + Redis 容器"
        echo "  docker:stop     停止 MySQL + Redis 容器"
        ;;
esac
