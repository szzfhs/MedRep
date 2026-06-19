#!/usr/bin/env bash
# MedPro 启动脚本
# 开发模式：调用 medpro.sh start（Docker + 后端 + 前端 + 门户）
# 安装包模式：调用 medpro-admin.sh start
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -f "${SCRIPT_DIR}/medpro-admin.sh" ]]; then
  # 安装包环境（属 desktop/ 子目录）
  cd "$(dirname "${SCRIPT_DIR}")"
  bash medpro-admin.sh start
else
  # 开发环境（项目根目录）
  cd "${SCRIPT_DIR}"
  bash medpro.sh start
fi
echo ""
echo "按回车键关闭此窗口..."
read
