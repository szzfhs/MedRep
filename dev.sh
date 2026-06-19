#!/usr/bin/env bash
# MedPro 开发环境管理脚本
# 适用于 ARM64 (DGX Spark / Ubuntu 24.04)
#
# 用法：
#   ./dev.sh start          - 启动开发环境
#   ./dev.sh stop           - 停止开发环境
#   ./dev.sh restart        - 重启所有服务
#   ./dev.sh rebuild        - 重新构建镜像并启动（依赖包变更时使用）
#   ./dev.sh logs [服务名]  - 查看日志（不指定服务则显示所有）
#   ./dev.sh status         - 查看容器状态
#   ./dev.sh clean          - 停止并删除容器和网络（保留数据卷）

set -euo pipefail

COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$PROJECT_DIR"

case "${1:-help}" in
  start)
    echo ">>> 启动 MedPro 开发环境..."
    docker compose -f "$COMPOSE_FILE" up -d
    echo ""
    echo "✓ 服务已启动："
    echo "  前端 (Vite HMR)  : http://$(hostname -I | awk '{print $1}'):9398"
    echo "  后端 (FastAPI)    : http://$(hostname -I | awk '{print $1}'):9399/docs"
    echo "  PostgreSQL        : localhost:15432  (用户: postgres / 密码: root)"
    echo "  Redis             : localhost:16379"
    echo ""
    echo "代码修改会自动同步到容器，后端热重载约 2-3 秒，前端 HMR 即时生效。"
    ;;

  stop)
    echo ">>> 停止 MedPro 开发环境..."
    docker compose -f "$COMPOSE_FILE" stop
    echo "✓ 已停止（数据已保留）"
    ;;

  restart)
    echo ">>> 重启 MedPro 开发环境..."
    docker compose -f "$COMPOSE_FILE" restart
    ;;

  rebuild)
    echo ">>> 重新构建镜像并启动（适用于 requirements.txt / package.json 变更）..."
    docker compose -f "$COMPOSE_FILE" build --no-cache
    docker compose -f "$COMPOSE_FILE" up -d
    echo "✓ 重建完成并已启动"
    ;;

  logs)
    SERVICE="${2:-}"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100 $SERVICE
    ;;

  status)
    docker compose -f "$COMPOSE_FILE" ps
    ;;

  clean)
    echo ">>> 停止并删除容器和网络（数据卷保留）..."
    docker compose -f "$COMPOSE_FILE" down
    echo "✓ 已清理（数据卷 medpro-pg-dev-data / medpro-redis-dev-data 已保留）"
    echo "  若需同时删除数据：docker compose -f $COMPOSE_FILE down -v"
    ;;

  help|*)
    echo "MedPro 开发环境管理脚本"
    echo ""
    echo "用法: ./dev.sh <命令> [参数]"
    echo ""
    echo "命令："
    echo "  start              启动开发环境"
    echo "  stop               停止开发环境（保留数据）"
    echo "  restart            重启所有服务"
    echo "  rebuild            重建镜像并启动（pip/npm 依赖变更后使用）"
    echo "  logs [服务名]      查看日志（服务名: medpro-frontend-dev / medpro-backend-dev）"
    echo "  status             查看容器状态"
    echo "  clean              停止并删除容器（保留数据卷）"
    ;;
esac
