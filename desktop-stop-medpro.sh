#!/usr/bin/env bash
# MedPro 停止脚本
# 开发模式：调用 medpro.sh stop
# 安装包模式：调用 medpro-admin.sh stop
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -f "${SCRIPT_DIR}/medpro-admin.sh" ]]; then
  # 安装包环境（属 desktop/ 子目录）
  cd "$(dirname "${SCRIPT_DIR}")"
  bash medpro-admin.sh stop
else
  # 开发环境（项目根目录）
  cd "${SCRIPT_DIR}"
  bash medpro.sh stop
fi
echo ""
echo "按回车键关闭此窗口..."
read
