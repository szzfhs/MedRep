cd /home/zfhs/Projects/codes/MedPro/MedPro-Vue3-FastAPI

./medpro.sh start          # 启动全部（Docker + 后端 + 前端）
./medpro.sh stop           # 停止后端和前端
./medpro.sh restart        # 重启后端和前端
./medpro.sh status         # 查看所有服务状态

./medpro.sh restart:be     # 仅重启后端（修改 Python 代码后用）
./medpro.sh restart:fe     # 仅重启前端（修改前端配置后用）

./medpro.sh logs:be        # 实时查看后端日志（Ctrl+C 退出）
./medpro.sh logs:fe        # 实时查看前端日志

./medpro.sh docker:start   # 启动 MySQL + Redis 容器
./medpro.sh docker:stop    # 停止 MySQL + Redis 容器