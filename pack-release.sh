#!/usr/bin/env bash
# =============================================================
#  MedPro 容器发布打包脚本
#
#  功能：构建所有 Docker 镜像，导出为 tar 文件，
#        连同配置文件打包成可离线安装的发布包，
#        用于部署到 DGX Spark 等目标设备。
#
#  用法：
#    ./pack-release.sh [选项]
#
#  选项：
#    --db-type   数据库类型: mysql(默认) 或 pg
#    --tag       镜像版本标签（默认: latest）
#    --output    输出目录（默认: ./release-output）
#    --skip-build  跳过构建，仅打包已有镜像（用于重新打包）
#    --platform  目标平台（默认自动检测: aarch64→linux/arm64, x86_64→linux/amd64）
#    -h / --help 显示帮助
#
#  示例：
#    ./pack-release.sh
#    ./pack-release.sh --db-type pg --tag v1.0.0
#    ./pack-release.sh --platform linux/arm64 --tag v1.0.0
# =============================================================

set -euo pipefail

# ---------- 默认参数 ----------
DB_TYPE="mysql"
TAG="latest"
OUTPUT_DIR="./release-output"
SKIP_BUILD=false
# 自动检测本机架构（源机与 DGX Spark 均为 ARM64/aarch64）
_ARCH="$(uname -m)"
case "${_ARCH}" in
  aarch64|arm64) PLATFORM="linux/arm64" ;;
  x86_64|amd64)  PLATFORM="linux/amd64" ;;
  *)             PLATFORM="linux/${_ARCH}" ;;
esac
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# ---------- 颜色 ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()      { echo -e "${GREEN}[ OK ]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERR ]${NC}  $*"; exit 1; }
section() { echo -e "\n${BOLD}══════ $* ══════${NC}"; }

# ---------- 参数解析 ----------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --db-type)    DB_TYPE="$2";     shift 2 ;;
    --tag)        TAG="$2";         shift 2 ;;
    --output)     OUTPUT_DIR="$2";  shift 2 ;;
    --skip-build) SKIP_BUILD=true;  shift   ;;
    --platform)   PLATFORM="$2";   shift 2 ;;
    -h|--help)
      sed -n '3,20p' "$0" | sed 's/^#  \{0,1\}//'
      exit 0 ;;
    *) error "未知参数: $1" ;;
  esac
done

# ---------- 参数校验 ----------
[[ "$DB_TYPE" != "mysql" && "$DB_TYPE" != "pg" ]] && \
  error "--db-type 仅支持 'mysql' 或 'pg'"

# ---------- 根据数据库类型确定变量 ----------
if [[ "$DB_TYPE" == "mysql" ]]; then
  COMPOSE_FILE="docker-compose.my.yml"
  BACKEND_DOCKERFILE="Dockerfile.my"
  BACKEND_IMAGE="medpro-backend-my:${TAG}"
  DB_IMAGE="mysql:8.0"
  DB_TAR="mysql-8.0.tar"
else
  COMPOSE_FILE="docker-compose.pg.yml"
  BACKEND_DOCKERFILE="Dockerfile.pg"
  BACKEND_IMAGE="medpro-backend-pg:${TAG}"
  DB_IMAGE="postgres:14"
  DB_TAR="postgres-14.tar"
fi

FRONTEND_IMAGE="medpro-frontend:${TAG}"
PORTAL_IMAGE="medpro-portal:${TAG}"
REDIS_IMAGE="redis:latest"
PACKAGE_NAME="medpro-release-${DB_TYPE}-${TAG}"
PACKAGE_DIR="${OUTPUT_DIR}/${PACKAGE_NAME}"

# ---------- 预检 ----------
section "环境预检"
command -v docker &>/dev/null   || error "未检测到 docker，请先安装 Docker"
command -v docker-compose &>/dev/null || \
  docker compose version &>/dev/null  || error "未检测到 docker-compose"
ok "Docker 环境就绪"

# ---------- 初始化输出目录 ----------
section "初始化输出目录"
rm -rf "${PACKAGE_DIR}"
mkdir -p "${PACKAGE_DIR}/images"
mkdir -p "${PACKAGE_DIR}/sql"
mkdir -p "${PACKAGE_DIR}/config"
ok "目录已创建: ${PACKAGE_DIR}"

# ---------- 构建镜像 ----------
if [[ "$SKIP_BUILD" == "false" ]]; then
  section "构建 Docker 镜像（平台: ${PLATFORM}）"

  # 判断是否需要跨平台构建
  _NATIVE_ARCH="$(uname -m)"
  _NATIVE_PLATFORM="linux/${_NATIVE_ARCH/aarch64/arm64}"
  _NATIVE_PLATFORM="${_NATIVE_PLATFORM/x86_64/amd64}"

  _build() {
    local tag="$1" ctx="$2" df="$3"
    if [[ "${PLATFORM}" == "${_NATIVE_PLATFORM}" ]]; then
      # 同架构：直接用 docker build，避免 buildx 缓存问题
      docker build --no-cache -t "${tag}" -f "${df}" "${ctx}"
    else
      # 跨平台：需要 buildx + qemu
      docker buildx build --platform "${PLATFORM}" --load \
        -t "${tag}" -f "${df}" "${ctx}"
    fi
  }

  # ── 预拉取所有基础镜像（修复 BuildKit 元数据缓存损坏问题）──
  info "预拉取基础镜像（清除 BuildKit 元数据缓存）..."
  docker builder prune -f &>/dev/null || true
  for _img in "node:18-slim" "nginx:latest" "python:3.12" "${DB_IMAGE}" "${REDIS_IMAGE}" ; do
    if ! docker image inspect "${_img}" &>/dev/null; then
      info "  拉取: ${_img}"
      docker pull "${_img}" || warn "  拉取 ${_img} 失败，构建时将重试"
    else
      ok "  已有: ${_img}"
    fi
  done
  ok "基础镜像准备完成"

  info "构建前端镜像: ${FRONTEND_IMAGE}"
  _build "${FRONTEND_IMAGE}" \
    "${PROJECT_ROOT}/medpro-fastapi-frontend" \
    "${PROJECT_ROOT}/medpro-fastapi-frontend/Dockerfile"
  ok "前端镜像构建完成"

  info "构建门户镜像: ${PORTAL_IMAGE}"
  _build "${PORTAL_IMAGE}" \
    "${PROJECT_ROOT}/medpro-fastapi-portal" \
    "${PROJECT_ROOT}/medpro-fastapi-portal/Dockerfile"
  ok "门户镜像构建完成"

  info "构建后端镜像: ${BACKEND_IMAGE}"
  # 生成临时 Dockerfile，pip 使用清华镜像 + PyPI 官方双源（修复部分包在镜像源缺失的问题）
  _TMP_DOCKERFILE="$(mktemp /tmp/Dockerfile.backend.XXXXXX)"
  sed 's|-i https://pypi\.tuna\.tsinghua\.edu\.cn/simple|--index-url https://pypi.tuna.tsinghua.edu.cn/simple --extra-index-url https://pypi.org/simple|g' \
    "${PROJECT_ROOT}/medpro-fastapi-backend/${BACKEND_DOCKERFILE}" > "${_TMP_DOCKERFILE}"
  _build "${BACKEND_IMAGE}" \
    "${PROJECT_ROOT}/medpro-fastapi-backend" \
    "${_TMP_DOCKERFILE}"
  rm -f "${_TMP_DOCKERFILE}"
  ok "后端镜像构建完成"
else
  warn "已跳过构建，使用本地现有镜像"
fi

# ---------- 导出镜像为 tar ----------
section "导出镜像为 tar 文件"

save_image() {
  local image="$1"
  local output="$2"
  info "导出: ${image} → ${output}"
  docker save "${image}" | gzip > "${PACKAGE_DIR}/images/${output}"
  ok "已保存: $(du -sh "${PACKAGE_DIR}/images/${output}" | cut -f1)  ${output}"
}

save_image "${FRONTEND_IMAGE}" "frontend.tar.gz"
save_image "${PORTAL_IMAGE}"   "portal.tar.gz"

if [[ "$DB_TYPE" == "mysql" ]]; then
  save_image "medpro-backend-my:${TAG}" "backend-my.tar.gz"
else
  save_image "medpro-backend-pg:${TAG}" "backend-pg.tar.gz"
fi

save_image "${DB_IMAGE}"    "${DB_TAR}.gz"
save_image "${REDIS_IMAGE}" "redis.tar.gz"

# ---------- 复制 SQL 初始化文件 ----------
section "复制 SQL 初始化文件"
if [[ "$DB_TYPE" == "mysql" ]]; then
  # 按编号前缀复制，MySQL docker-entrypoint-initdb.d 按文件名字母序执行
  cp "${PROJECT_ROOT}/medpro-fastapi-backend/sql/ruoyi-fastapi.sql" \
     "${PACKAGE_DIR}/sql/01-ruoyi-fastapi.sql"

  # 02 — vf_* 表完整建表脚本（从开发库导出，IF NOT EXISTS 幂等）
  # 必须在 03+ 之前执行，确保后续 ALTER TABLE / INSERT 能找到目标表
  _VF_SCHEMA_SRC="${PROJECT_ROOT}/medpro-fastapi-backend/sql/vf-schema-create.sql"
  if [[ -f "${_VF_SCHEMA_SRC}" ]]; then
    cp "${_VF_SCHEMA_SRC}" "${PACKAGE_DIR}/sql/02-vf-schema-create.sql"
    info "  已包含: 02-vf-schema-create.sql (28张 vf_* 表)"
  else
    warn "  未找到 vf-schema-create.sql，请先在开发机运行: bash pack-release.sh 再打包"
  fi

  # 03+ — 按依赖顺序排列；MySQL 的 docker-entrypoint-initdb.d 按文件名字母序执行
  # 执行顺序依赖说明：
  #   01 ruoyi-fastapi → 02 vf-schema → 03 saas-tenant → 04 simhub-init →
  #   05 simhub-v2 → 06 simhub-v3(ALTER vf_center_info) →
  #   07 schema-v2(ALTER vf_*) → 08 schema-v4(ALTER vf_course + 模拟数据) →
  #   09 simhub-v4(资源数据, 依赖 schema-v4) →
  #   10 class-admin(新建班级表) → 11 class-admin-menu → 12 schema-v5
  declare -A _SQL_MAP=(
    ["03-saas-tenant.sql"]="saas-phase-a-tenant.sql"
    ["04-simhub-init.sql"]="simhub-init.sql"
    ["05-simhub-v2.sql"]="simhub-v2-init.sql"
    ["06-simhub-v3.sql"]="simhub-v3-center.sql"
    ["07-schema-v2.sql"]="schema-v2-upgrade.sql"
    ["08-schema-v4.sql"]="schema-v4-course-fields.sql"
    ["09-simhub-v4.sql"]="simhub-v4-resource-data.sql"
    ["10-class-admin.sql"]="simhub_class_admin.sql"
    ["11-class-admin-menu.sql"]="simhub_class_admin_menu.sql"
    ["12-schema-v5.sql"]="schema-v5-tenant-domain.sql"
  )
  for dest in $(echo "${!_SQL_MAP[@]}" | tr ' ' '\n' | sort); do
    src="${PROJECT_ROOT}/medpro-fastapi-backend/sql/${_SQL_MAP[$dest]}"
    if [[ -f "${src}" ]]; then
      cp "${src}" "${PACKAGE_DIR}/sql/${dest}"
      info "  已包含: ${dest}"
    fi
  done
else
  cp "${PROJECT_ROOT}/medpro-fastapi-backend/sql/ruoyi-fastapi-pg.sql" \
     "${PACKAGE_DIR}/sql/01-ruoyi-fastapi-pg.sql"
fi
ok "SQL 文件已复制"

# ---------- 复制 nginx 配置 ----------
section "复制 Nginx 配置"
if [[ "$DB_TYPE" == "mysql" ]]; then
  cp "${PROJECT_ROOT}/medpro-fastapi-frontend/bin/nginx.dockermy.conf" \
     "${PACKAGE_DIR}/config/nginx.conf"
else
  cp "${PROJECT_ROOT}/medpro-fastapi-frontend/bin/nginx.dockerpg.conf" \
     "${PACKAGE_DIR}/config/nginx.conf"
fi
cp "${PROJECT_ROOT}/medpro-fastapi-portal/nginx.conf" \
   "${PACKAGE_DIR}/config/nginx-portal.conf"
ok "Nginx 配置已复制"

# ---------- 复制桌面快捷方式脚本和图标 ----------
section "复制桌面快捷方式资源"
mkdir -p "${PACKAGE_DIR}/desktop"
mkdir -p "${PACKAGE_DIR}/icons"

# 复制启动/停止脚本
cp "${PROJECT_ROOT}/desktop-start-medpro.sh" "${PACKAGE_DIR}/desktop/"
cp "${PROJECT_ROOT}/desktop-stop-medpro.sh"  "${PACKAGE_DIR}/desktop/"
chmod +x "${PACKAGE_DIR}/desktop/desktop-start-medpro.sh"
chmod +x "${PACKAGE_DIR}/desktop/desktop-stop-medpro.sh"

# 复制图标
if [[ -f "${PROJECT_ROOT}/icons/medpro-logo.png" ]]; then
  cp "${PROJECT_ROOT}/icons/medpro-logo.png" "${PACKAGE_DIR}/icons/"
  ok "图标文件已复制"
else
  warn "图标文件不存在，跳过: ${PROJECT_ROOT}/icons/medpro-logo.png"
fi

ok "桌面快捷方式资源已复制"

# ---------- 生成 docker-compose.release.yml ----------
section "生成 docker-compose.release.yml"

if [[ "$DB_TYPE" == "mysql" ]]; then
  BACKEND_SERVICE_NAME="medpro-backend-my"
  BACKEND_IMG="${BACKEND_IMAGE}"
  DB_SERVICE_BLOCK=$(cat <<'EOF_DB'
  # MySQL 服务
  medpro-mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-MedPro@2024}
      MYSQL_DATABASE: ruoyi-fastapi
    ports:
      - "${MYSQL_PORT:-3306}:3306"
    volumes:
      - medpro-mysql-data:/var/lib/mysql
      - ./sql:/docker-entrypoint-initdb.d:ro
    command: >
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --skip-character-set-client-handshake=1
    networks:
      - medpro-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD:-MedPro@2024}"]
      interval: 10s
      timeout: 10s
      retries: 30
      start_period: 30s
EOF_DB
)
  DB_VOLUME="  medpro-mysql-data:"
  DB_DEPENDS=$(cat <<'EOF_DEP'
    depends_on:
      medpro-mysql:
        condition: service_healthy
      medpro-redis:
        condition: service_healthy
EOF_DEP
)
  BACKEND_ENV_BLOCK=$(cat <<'EOF_ENV'
    environment:
      - DB_HOST=medpro-mysql
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=${MYSQL_ROOT_PASSWORD:-MedPro@2024}
      - DB_NAME=ruoyi-fastapi
      - REDIS_HOST=medpro-redis
      - REDIS_PORT=6379
EOF_ENV
)
else
  BACKEND_SERVICE_NAME="medpro-backend-pg"
  BACKEND_IMG="${BACKEND_IMAGE}"
  DB_SERVICE_BLOCK=$(cat <<'EOF_DB'
  # PostgreSQL 服务
  medpro-pg:
    image: postgres:14
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${PG_PASSWORD:-MedPro@2024}
      POSTGRES_DB: ruoyi-fastapi
      POSTGRES_INITDB_ARGS: --encoding=UTF8 --lc-collate=C --lc-ctype=C
    ports:
      - "${PG_PORT:-5432}:5432"
    volumes:
      - medpro-pg-data:/var/lib/postgresql/data
      - ./sql/ruoyi-fastapi-pg.sql:/docker-entrypoint-initdb.d/01-ruoyi-fastapi-pg.sql
    networks:
      - medpro-network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 10s
      retries: 30
      start_period: 30s
EOF_DB
)
  DB_VOLUME="  medpro-pg-data:"
  DB_DEPENDS=$(cat <<'EOF_DEP'
    depends_on:
      medpro-pg:
        condition: service_healthy
      medpro-redis:
        condition: service_healthy
EOF_DEP
)
  BACKEND_ENV_BLOCK=$(cat <<'EOF_ENV'
    environment:
      - DB_HOST=medpro-pg
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=${PG_PASSWORD:-MedPro@2024}
      - DB_NAME=ruoyi-fastapi
      - REDIS_HOST=medpro-redis
      - REDIS_PORT=6379
EOF_ENV
)
fi

cat > "${PACKAGE_DIR}/docker-compose.release.yml" <<EOF
# =============================================================
# MedPro 生产发布 docker-compose（${DB_TYPE} 版本）
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# 镜像标签: ${TAG}
# 目标平台: ${PLATFORM}
#
# 端口说明（与 medpro.sh 开发环境保持一致）:
#   前端  : \${FRONTEND_PORT:-9398}    → 与开发端口一致
#   后端  : \${BACKEND_PORT:-9399}     → 与开发端口一致
#   门户  : \${PORTAL_PORT:-9397}      → 与开发端口一致
#   MySQL : \${MYSQL_PORT:-3306}       → 与开发端口一致
#   Redis : \${REDIS_PORT:-6379}       → 与开发端口一致
#
# 使用说明:
#   1. 确保已执行 install.sh 完成镜像加载
#   2. 按需编辑 .env 文件自定义密码和端口
#   3. docker compose -f docker-compose.release.yml up -d
# =============================================================

services:
  # 前端管理后台（Vue3，对应 medpro-fastapi-frontend，开发端口 9398）
  medpro-frontend:
    image: medpro-frontend:${TAG}
    restart: unless-stopped
    ports:
      - "\${FRONTEND_PORT:-9398}:80"
    volumes:
      - ./config/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - ${BACKEND_SERVICE_NAME}
    networks:
      - medpro-network

  # 门户网站（React，对应 medpro-fastapi-portal，开发端口 9397）
  medpro-portal:
    image: medpro-portal:${TAG}
    restart: unless-stopped
    ports:
      - "\${PORTAL_PORT:-9397}:80"
    volumes:
      - ./config/nginx-portal.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - ${BACKEND_SERVICE_NAME}
    networks:
      - medpro-network

  # 后端服务（FastAPI，对应 medpro-fastapi-backend，开发端口 9399）
  ${BACKEND_SERVICE_NAME}:
    image: ${BACKEND_IMG}
    restart: unless-stopped
    ports:
      - "\${BACKEND_PORT:-9399}:9399"
${DB_DEPENDS}
${BACKEND_ENV_BLOCK}
    volumes:
      - medpro-logs:/app/logs
      - medpro-assets:/app/assets
      - medpro-uploads:/app/vf_admin/upload_path
      - medpro-uploads:/app/vf_admin/download_path
    networks:
      - medpro-network

${DB_SERVICE_BLOCK}

  # Redis 服务
  medpro-redis:
    image: redis:latest
    restart: unless-stopped
    ports:
      - "\${REDIS_PORT:-6379}:6379"
    command: redis-server --appendonly yes
    volumes:
      - medpro-redis-data:/data
    networks:
      - medpro-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 30

# 持久化卷
volumes:
  medpro-logs:
  medpro-assets:
  medpro-uploads:
  medpro-redis-data:
${DB_VOLUME}

# 网络（使用项目前缀命名，避免多版本部署冲突）
networks:
  medpro-network:
    driver: bridge
EOF
ok "docker-compose.release.yml 已生成"

# ---------- 生成 .env 默认配置文件 ----------
section "生成环境变量配置文件"
if [[ "$DB_TYPE" == "mysql" ]]; then
  DB_PASS_VAR="MYSQL_ROOT_PASSWORD=MedPro@2024"
  DB_PORT_VAR="MYSQL_PORT=3306"
else
  DB_PASS_VAR="PG_PASSWORD=MedPro@2024"
  DB_PORT_VAR="PG_PORT=5432"
fi

cat > "${PACKAGE_DIR}/.env" <<EOF
# MedPro 环境配置
# 修改后需重启服务: ./medpro-admin.sh restart

# 端口配置（与 medpro.sh 开发环境保持一致）
FRONTEND_PORT=9398
PORTAL_PORT=9397
BACKEND_PORT=9399
REDIS_PORT=6379
${DB_PORT_VAR}

# 数据库密码（⚠️ 生产环境请修改）
${DB_PASS_VAR}
EOF
ok ".env 已生成"

# ---------- 生成 install.sh ----------
section "生成 install.sh"
cat > "${PACKAGE_DIR}/install.sh" <<'INSTALL_SCRIPT'
#!/usr/bin/env bash
# =============================================================
#  MedPro 安装脚本 — 在目标设备（DGX Spark）上运行
# =============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()      { echo -e "${GREEN}[ OK ]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERR ]${NC}  $*"; exit 1; }
section() { echo -e "\n${BOLD}══════ $* ══════${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

section "MedPro 安装程序"
echo -e "  安装目录: ${SCRIPT_DIR}"
echo -e "  当前用户: $(whoami)"
echo ""

# ---------- 预检 ----------
section "环境预检"
command -v docker &>/dev/null || error "未检测到 docker，请先安装 Docker Engine"
COMPOSE_CMD=""
if docker compose version &>/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  error "未检测到 docker compose / docker-compose，请先安装"
fi
ok "Docker: $(docker --version)"
ok "Compose: ${COMPOSE_CMD}"

# ---------- 加载镜像 ----------
section "加载 Docker 镜像"
IMAGE_DIR="${SCRIPT_DIR}/images"
[[ -d "${IMAGE_DIR}" ]] || error "images 目录不存在: ${IMAGE_DIR}"

load_image() {
  local file="${IMAGE_DIR}/$1"
  if [[ -f "${file}" ]]; then
    info "加载: $1"
    docker load < "${file}"
    ok "$1 加载完成"
  else
    warn "文件不存在，跳过: $1"
  fi
}

load_image "frontend.tar.gz"
load_image "portal.tar.gz"
load_image "backend-my.tar.gz"
load_image "backend-pg.tar.gz"
load_image "mysql-8.0.tar.gz"
load_image "postgres-14.tar.gz"
load_image "redis.tar.gz"

# ---------- 检查 .env ----------
section "配置检查"
ENV_FILE="${SCRIPT_DIR}/.env"
if [[ -f "${ENV_FILE}" ]]; then
  ok ".env 文件已存在"
  warn "请检查 .env 中的密码配置，生产环境务必修改默认密码！"
else
  warn ".env 不存在，使用 docker-compose 默认值"
fi

# ---------- 设置文件权限 ----------
chmod +x "${SCRIPT_DIR}/medpro-admin.sh" 2>/dev/null || true
chmod +x "${SCRIPT_DIR}/desktop/desktop-start-medpro.sh" 2>/dev/null || true
chmod +x "${SCRIPT_DIR}/desktop/desktop-stop-medpro.sh"  2>/dev/null || true

# ---------- 创建桌面快捷方式 ----------
section "创建桌面快捷方式"
ICON_PATH="${SCRIPT_DIR}/icons/medpro-logo.png"
DESKTOP_DIR="${HOME}/Desktop"
[[ -d "${DESKTOP_DIR}" ]] || DESKTOP_DIR="${HOME}/桌面"

if [[ -d "${DESKTOP_DIR}" ]]; then
  # 启动快捷方式
  cat > "${DESKTOP_DIR}/启动-MedPro.desktop" <<DEOF
[Desktop Entry]
Version=1.0
Type=Application
Name=启动 MedPro
Comment=启动 MedPro 虚拟仿真管理系统（Docker + 后端 + 前端 + 门户）
Exec=gnome-terminal -- bash -c "${SCRIPT_DIR}/desktop/desktop-start-medpro.sh"
Icon=${ICON_PATH}
Terminal=false
Categories=Development;Education;
Keywords=medpro;医学;仿真;启动;docker;
StartupNotify=true
DEOF
  chmod +x "${DESKTOP_DIR}/启动-MedPro.desktop"
  gio set "${DESKTOP_DIR}/启动-MedPro.desktop" metadata::trusted true 2>/dev/null || true

  # 停止快捷方式
  cat > "${DESKTOP_DIR}/停止-MedPro.desktop" <<DEOF
[Desktop Entry]
Version=1.0
Type=Application
Name=停止 MedPro
Comment=停止 MedPro 虚拟仿真管理系统所有服务
Exec=gnome-terminal -- bash -c "${SCRIPT_DIR}/desktop/desktop-stop-medpro.sh"
Icon=${ICON_PATH}
Terminal=false
Categories=Development;Education;
Keywords=medpro;医学;仿真;停止;docker;
StartupNotify=true
DEOF
  chmod +x "${DESKTOP_DIR}/停止-MedPro.desktop"
  gio set "${DESKTOP_DIR}/停止-MedPro.desktop" metadata::trusted true 2>/dev/null || true

  ok "桌面快捷方式已创建: ${DESKTOP_DIR}"
else
  warn "未找到桌面目录，跳过创建桌面快捷方式（可手动从 ${SCRIPT_DIR}/desktop/ 创建）"
fi

# ---------- 完成 ----------
section "安装完成"
echo ""
echo -e "  ${GREEN}✓ 镜像加载完毕${NC}"
echo -e "  ${GREEN}✓ 桌面快捷方式已创建${NC}"
echo ""
echo -e "  下一步："
echo -e "    1. 编辑 ${SCRIPT_DIR}/.env 修改密码和端口（可选）"
echo -e "    2. 启动服务："
echo -e "       ${CYAN}cd ${SCRIPT_DIR} && bash medpro-admin.sh start${NC}"
echo -e "       或双击桌面【启动 MedPro】图标"
echo ""
echo -e "  访问地址（默认端口，与开发环境一致）："
echo -e "    前端管理后台: http://<主机IP>:9398"
echo -e "    门户网站:     http://<主机IP>:9397"
echo -e "    后端 API:     http://<主机IP>:9399"
echo ""
INSTALL_SCRIPT
chmod +x "${PACKAGE_DIR}/install.sh"
ok "install.sh 已生成"

# ---------- 生成 medpro-admin.sh ----------
section "生成 medpro-admin.sh"
cat > "${PACKAGE_DIR}/medpro-admin.sh" <<'ADMIN_SCRIPT'
#!/usr/bin/env bash
# =============================================================
#  MedPro 服务管理脚本（在目标设备上使用）
#
#  用法: ./medpro-admin.sh [命令]
#
#  命令:
#    start        启动所有服务
#    stop         停止所有服务
#    restart      重启所有服务
#    status       查看服务状态
#    logs         实时查看日志（所有服务）
#    logs:fe      查看前端管理后台日志
#    logs:portal  查看门户日志
#    logs:be      查看后端日志
#    update       重新加载并重启（用于更新发布）
#    uninstall    停止并删除所有容器和数据卷（⚠️ 不可逆）
# =============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()      { echo -e "${GREEN}[ OK ]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERR ]${NC}  $*"; exit 1; }
section() { echo -e "\n${BOLD}══════ $* ══════${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.release.yml"
ENV_FILE="${SCRIPT_DIR}/.env"

# 确定 compose 命令
if docker compose version &>/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  error "未检测到 docker compose / docker-compose"
fi

# 构建完整的 compose 命令（带 env 文件）
if [[ -f "${ENV_FILE}" ]]; then
  DC="${COMPOSE_CMD} -f ${COMPOSE_FILE} --env-file ${ENV_FILE}"
else
  DC="${COMPOSE_CMD} -f ${COMPOSE_FILE}"
fi

CMD="${1:-help}"

case "$CMD" in
  start)
    section "启动 MedPro 服务"
    # --remove-orphans 清理孤立容器，--force-recreate 避免旧容器名冲突
    $DC up -d --remove-orphans --force-recreate
    ok "服务已启动"
    echo ""
    $DC ps
    ;;
  stop)
    section "停止 MedPro 服务"
    $DC down
    ok "服务已停止"
    ;;
  restart)
    section "重启 MedPro 服务"
    $DC down
    $DC up -d
    ok "服务已重启"
    ;;
  status)
    $DC ps
    ;;
  logs)
    $DC logs -f --tail=100
    ;;
  logs:fe)
    $DC logs -f --tail=200 medpro-frontend
    ;;
  logs:portal)
    $DC logs -f --tail=200 medpro-portal
    ;;
  logs:be)
    if $DC ps | grep -q "medpro-backend-my"; then
      $DC logs -f --tail=200 medpro-backend-my
    else
      $DC logs -f --tail=200 medpro-backend-pg
    fi
    ;;
  update)
    section "更新服务"
    warn "此操作将重新加载镜像并重启所有服务"
    read -rp "确认继续? [y/N] " confirm
    [[ "${confirm,,}" == "y" ]] || { info "已取消"; exit 0; }
    bash "${SCRIPT_DIR}/install.sh"
    $DC down
    $DC up -d
    ok "更新完成"
    ;;
  uninstall)
    section "卸载 MedPro"
    warn "⚠️  此操作将删除所有容器和数据卷，数据将无法恢复！"
    read -rp "确认卸载? 请输入 'UNINSTALL' 确认: " confirm
    [[ "${confirm}" == "UNINSTALL" ]] || { info "已取消"; exit 0; }
    $DC down -v --remove-orphans
    ok "已卸载所有容器和数据卷"
    ;;
  help|--help|-h)
    sed -n '4,16p' "$0" | sed 's/^#  \{0,1\}//'
    ;;
  *)
    error "未知命令: $CMD（使用 help 查看帮助）"
    ;;
esac
ADMIN_SCRIPT
chmod +x "${PACKAGE_DIR}/medpro-admin.sh"
ok "medpro-admin.sh 已生成"

# ---------- 生成 cleanup.sh ----------
section "生成 cleanup.sh"
cat > "${PACKAGE_DIR}/cleanup.sh" <<'CLEANUP_SCRIPT'
#!/usr/bin/env bash
# =============================================================
#  MedPro 清理脚本 — 更新前先运行此脚本
#
#  功能：停止并删除所有 MedPro 容器和应用镜像
#        不会删除数据卷（MySQL/Redis 数据保留）
#
#  用法:
#    ./cleanup.sh           # 清理容器和应用镜像（保留数据）
#    ./cleanup.sh --all     # 同时清理数据卷（⚠️ 数据将丢失）
#    ./cleanup.sh --dry-run # 仅显示将要删除的内容，不执行
#
#  典型更新流程:
#    1. 将新版包上传到目标机
#    2. cd <新版目录> 解压目录
#    3. 先在旧版目录运行: bash cleanup.sh
#    4. 进入新版目录运行: bash install.sh && bash medpro-admin.sh start
# =============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()      { echo -e "${GREEN}[ OK ]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERR ]${NC}  $*"; exit 1; }
section() { echo -e "\n${BOLD}══════ $* ══════${NC}"; }

CLEAN_VOLUMES=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --all)     CLEAN_VOLUMES=true ;;
    --dry-run) DRY_RUN=true ;;
  esac
done

# 所有 MedPro 容器名
CONTAINERS=(
  medpro-frontend
  medpro-portal
  medpro-backend-my
  medpro-backend-pg
  medpro-mysql
  medpro-pg
  medpro-redis
)

# 应用镜像前缀（不删除 mysql/postgres/redis 基础镜像）
APP_IMAGE_PREFIXES=(
  "medpro-frontend"
  "medpro-portal"
  "medpro-backend-my"
  "medpro-backend-pg"
)

# 数据卷
DATA_VOLUMES=(
  medpro-mysql-data
  medpro-pg-data
  medpro-redis-data
  medpro-logs
  medpro-assets
)

section "MedPro 清理程序"
[[ "$DRY_RUN" == "true" ]] && warn "DRY-RUN 模式：仅显示操作，不实际执行"
[[ "$CLEAN_VOLUMES" == "true" ]] && warn "⚠️  将同时删除数据卷（数据库数据将丢失）"
echo ""

# ---------- 停止并删除容器 ----------
section "停止并删除容器"
for cname in "${CONTAINERS[@]}"; do
  status=$(docker inspect -f '{{.State.Status}}' "$cname" 2>/dev/null || echo "not_found")
  if [[ "$status" == "not_found" ]]; then
    info "  容器不存在，跳过: $cname"
    continue
  fi
  if [[ "$DRY_RUN" == "true" ]]; then
    warn "  [DRY] 将停止并删除容器: $cname (当前状态: $status)"
  else
    if [[ "$status" == "running" ]]; then
      docker stop "$cname" &>/dev/null && info "  已停止: $cname"
    fi
    docker rm "$cname" &>/dev/null && ok "  已删除容器: $cname"
  fi
done

# ---------- 删除应用镜像 ----------
section "删除应用镜像"
for prefix in "${APP_IMAGE_PREFIXES[@]}"; do
  # 查找所有匹配该前缀的镜像
  mapfile -t images < <(docker images --format "{{.Repository}}:{{.Tag}}" | grep "^${prefix}:" 2>/dev/null || true)
  if [[ ${#images[@]} -eq 0 ]]; then
    info "  未找到镜像: ${prefix}:*"
    continue
  fi
  for img in "${images[@]}"; do
    if [[ "$DRY_RUN" == "true" ]]; then
      warn "  [DRY] 将删除镜像: $img"
    else
      docker rmi "$img" &>/dev/null && ok "  已删除镜像: $img"
    fi
  done
done

# ---------- 删除数据卷（可选） ----------
if [[ "$CLEAN_VOLUMES" == "true" ]]; then
  section "删除数据卷"
  for vol in "${DATA_VOLUMES[@]}"; do
    exists=$(docker volume inspect "$vol" &>/dev/null && echo "yes" || echo "no")
    if [[ "$exists" == "no" ]]; then
      info "  卷不存在，跳过: $vol"
      continue
    fi
    if [[ "$DRY_RUN" == "true" ]]; then
      warn "  [DRY] 将删除数据卷: $vol"
    else
      docker volume rm "$vol" &>/dev/null && ok "  已删除数据卷: $vol"
    fi
  done
fi

# ---------- 完成 ----------
section "清理完成"
echo ""
if [[ "$DRY_RUN" == "true" ]]; then
  echo -e "  ${YELLOW}DRY-RUN 结束，未实际执行任何操作${NC}"
else
  echo -e "  ${GREEN}✓ 容器和应用镜像已清理${NC}"
  [[ "$CLEAN_VOLUMES" == "false" ]] && \
    echo -e "  ${CYAN}数据卷已保留（MySQL/Redis 数据完好）${NC}"
fi
echo ""
echo -e "  现在可以部署新版本："
echo -e "    cd <新版目录> && bash install.sh && bash medpro-admin.sh start"
echo ""
CLEANUP_SCRIPT
chmod +x "${PACKAGE_DIR}/cleanup.sh"
ok "cleanup.sh 已生成"

# ---------- 生成 README.txt ----------
cat > "${PACKAGE_DIR}/README.txt" <<EOF
================================================================
  MedPro 发布包 — ${DB_TYPE} 版本
  版本标签 : ${TAG}
  目标平台 : ${PLATFORM}
  打包时间 : $(date '+%Y-%m-%d %H:%M:%S')
================================================================

一、文件清单
  images/                     Docker 镜像 tar 文件（离线安装用）
  sql/                        数据库初始化 SQL 文件
  config/nginx.conf           前端管理后台 Nginx 配置
  config/nginx-portal.conf    门户 Nginx 配置
  docker-compose.release.yml  服务编排文件
  .env                        环境变量配置（端口/密码）
  install.sh                  安装脚本（首次部署时运行）
  cleanup.sh                  清理脚本（更新前运行，删除旧容器和镜像）
  medpro-admin.sh             日常管理脚本

二、安装步骤（在目标设备 DGX Spark 上）
  1. 确保目标设备已安装 Docker Engine
     sudo apt install docker.io docker-compose-v2  # Ubuntu/Debian
  2. 将本目录上传到目标设备：
     scp -r ./ user@dgx-spark:/opt/medpro/
  3. 在目标设备上运行安装脚本：
     cd /opt/medpro
     bash install.sh
     （若文件系统挂载了 noexec，需用 bash 显式调用，不能用 ./install.sh）
  4. （可选）修改密码和端口：
     vi .env
  5. 启动服务：
     bash medpro-admin.sh start

三、默认访问地址（与开发环境端口一致）
  前端管理后台 : http://<DGX-IP>:9398
  门户网站     : http://<DGX-IP>:9397
  后端 API     : http://<DGX-IP>:9399
  数据库端口   : $([ "$DB_TYPE" = "mysql" ] && echo "MySQL  :3306" || echo "PgSQL  :5432")
  Redis        : 6379

四、常用管理命令
  bash medpro-admin.sh start        # 启动所有服务
  bash medpro-admin.sh stop         # 停止所有服务
  bash medpro-admin.sh restart      # 重启所有服务
  bash medpro-admin.sh status       # 查看状态
  bash medpro-admin.sh logs         # 查看实时日志
  bash medpro-admin.sh logs:fe      # 查看前端日志
  bash medpro-admin.sh logs:portal  # 查看门户日志
  bash medpro-admin.sh logs:be      # 查看后端日志

五、版本更新流程
  1. 在旧版目录运行清理:  bash cleanup.sh
  2. 解压新版:            tar -xzf medpro-release-mysql-<新版>.tar.gz
  3. 进入新版目录:        cd medpro-release-mysql-<新版>
  4. 加载新镜像:          bash install.sh
  5. 启动服务:            bash medpro-admin.sh start

六、注意事项
  * 首次启动后，MySQL/PostgreSQL 会自动执行 SQL 初始化，
    这需要 30~60 秒，期间后端可能连接失败，稍等即可。
  * 生产环境务必修改 .env 中的默认密码！
  * 数据持久化在 Docker 卷中，cleanup.sh 默认不删除数据卷。
  * 如需彻底清除数据: bash cleanup.sh --all（⚠️ 不可逆）

================================================================
EOF

# ---------- 打包 ----------
section "创建发布包"
TARBALL="${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz"
info "正在压缩打包，请稍候（镜像文件较大）..."
tar -czf "${TARBALL}" -C "${OUTPUT_DIR}" "${PACKAGE_NAME}"
PACKAGE_SIZE=$(du -sh "${TARBALL}" | cut -f1)
ok "发布包已创建: ${TARBALL}  (${PACKAGE_SIZE})"

# ---------- 完成摘要 ----------
section "打包完成"
echo ""
echo -e "  ${GREEN}发布包:${NC}  ${TARBALL}"
echo -e "  ${GREEN}大小:${NC}    ${PACKAGE_SIZE}"
echo -e "  ${GREEN}版本:${NC}    ${TAG}"
echo -e "  ${GREEN}数据库:${NC}  ${DB_TYPE}"
echo -e "  ${GREEN}平台:${NC}    ${PLATFORM}"
echo ""
echo -e "  传输到 DGX Spark："
echo -e "  ${CYAN}scp ${TARBALL} user@<dgx-ip>:/opt/${NC}"
echo ""
echo -e "  目标机安装："
echo -e "  ${CYAN}cd /opt && tar -xzf ${PACKAGE_NAME}.tar.gz${NC}"
echo -e "  ${CYAN}cd ${PACKAGE_NAME} && bash install.sh${NC}"
echo ""
