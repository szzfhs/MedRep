# 网络故障处理记录：外部客户端无法访问 Vite 开发服务器

**日期：** 2026-04-22  
**症状：** 外部客户端（192.168.30.107）访问 `http://192.168.30.124:3000/` 和 `http://192.168.30.124:3100/` 时报 `ERR_CONNECTION_RESET`

---

## 根本原因

### 原因一：Vite 6.x `allowedHosts` 安全限制

Vite 6.x 引入了 `allowedHosts` 安全机制，默认只接受 `Host: localhost` 的请求。局域网客户端发送 `Host: 192.168.30.124:3000`，Vite 直接重置连接，导致 `ERR_CONNECTION_RESET`。

### 原因二：双网卡同网段导致非对称路由

服务器有两块网卡同处 `192.168.30.0/24` 网段：

| 接口 | IP | metric |
|------|----|--------|
| `enP7s7`（有线） | 192.168.30.145 | 100（默认路由优先） |
| `wlP9s9`（WiFi） | 192.168.30.124 | 600 |

客户端请求从 WiFi 接口（192.168.30.124）进入，但内核回包时选择 metric 更小的有线接口（enP7s7）作为出口，导致回包源 IP 变为 192.168.30.145，与客户端期望的目标 IP 不符，触发 TCP RST → `ERR_CONNECTION_RESET`。

---

## 修复方案

### 修复一：Vite 配置（永久生效，已提交）

**文件：** `medpro-fastapi-frontend/vite.config.js`

```js
server: {
  port: 3000,
  host: true,
  open: true,
  allowedHosts: 'all',   // ← 新增
  proxy: { ... }
},
```

**文件：** `medpro-fastapi-portal/vite.config.js`

```js
server: {
  port: 3100,
  host: true,          // ← 新增（原来缺失，导致只监听 127.0.0.1）
  allowedHosts: 'all', // ← 新增
  proxy: { ... }
},
```

### 修复二：Linux 策略路由（永久生效，开机自动执行）

#### 临时命令（当次有效）

```bash
sudo ip rule add from 192.168.30.124 table 200 priority 100
sudo ip route add 192.168.30.0/24 dev wlP9s9 src 192.168.30.124 table 200
sudo ip route add default via 192.168.30.1 dev wlP9s9 table 200
```

#### 清除策略路由（如需回滚）

```bash
sudo ip rule del from 192.168.30.124 table 200
sudo ip route flush table 200
```

#### 永久方案：NetworkManager Dispatcher 脚本

**脚本路径：** `/etc/NetworkManager/dispatcher.d/99-wifi-policy-routing.sh`  
**权限：** `-rwxr-xr-x root root`

```bash
#!/bin/bash
# 修复 wlP9s9（WiFi）与 enP7s7（有线）同网段导致的非对称路由问题
# 只有接口名写死，IP/子网/网关全部动态获取
IFACE="$1"
ACTION="$2"
WIFI_IF="wlP9s9"
TABLE=200

[[ "$IFACE" != "$WIFI_IF" ]] && exit 0

if [[ "$ACTION" == "up" ]]; then
    WIFI_IP=$(ip -4 addr show "$WIFI_IF" | awk '/inet /{split($2,a,"/"); print a[1]}' | head -1)
    SUBNET=$(ip -4 route show dev "$WIFI_IF" | awk '!/default/{print $1}' | head -1)
    GW=$(ip -4 route show dev "$WIFI_IF" | awk '/default/{print $3}' | head -1)
    [[ -z "$WIFI_IP" || -z "$GW" ]] && exit 0
    # 清理旧规则和路由
    ip rule show | awk '/lookup '"$TABLE"'/{print $3}' | xargs -I{} ip rule del from {} table "$TABLE" 2>/dev/null || true
    ip route flush table "$TABLE" 2>/dev/null || true
    # 添加新规则
    ip rule add from "$WIFI_IP" table "$TABLE" priority 100
    ip route add "$SUBNET" dev "$WIFI_IF" src "$WIFI_IP" table "$TABLE"
    ip route add default via "$GW" dev "$WIFI_IF" table "$TABLE"

elif [[ "$ACTION" == "down" ]]; then
    ip rule show | awk '/lookup '"$TABLE"'/{print $3}' | xargs -I{} ip rule del from {} table "$TABLE" 2>/dev/null || true
    ip route flush table "$TABLE" 2>/dev/null || true
fi
```

#### 脚本安装方法

```bash
# 写入临时文件（VS Code 或文本编辑器），再以 sudo 复制
sudo cp /tmp/99-wifi-policy-routing.sh /etc/NetworkManager/dispatcher.d/
sudo chmod +x /etc/NetworkManager/dispatcher.d/99-wifi-policy-routing.sh
```

---

## 验证命令

```bash
# 检查 Vite 是否监听所有接口
ss -tlnp | grep 3000
ss -tlnp | grep 3100

# 检查 Vite 日志（Network 一行应出现 192.168.30.124）
tail -20 /tmp/medpro-frontend.log
tail -20 /tmp/medpro-portal.log

# 检查策略路由是否生效
ip rule show
ip route show table 200

# 从本机模拟外部客户端请求（带正确 Host 头）
curl -v http://192.168.30.124:3000/@vite/client 2>&1 | head -20

# 检查 dispatcher 脚本是否正确安装
ls -la /etc/NetworkManager/dispatcher.d/99-wifi-policy-routing.sh
wc -c /etc/NetworkManager/dispatcher.d/99-wifi-policy-routing.sh
```

---

## 结果

| 修复项 | 状态 |
|--------|------|
| `medpro-fastapi-frontend` Vite `allowedHosts: 'all'` | ✅ 已生效 |
| `medpro-fastapi-portal` Vite `host: true` + `allowedHosts: 'all'` | ✅ 已生效 |
| 当次策略路由（ip rule/route）| ✅ 已生效 |
| NetworkManager dispatcher 脚本（开机永久生效）| ✅ 已安装（1237 字节） |

外部客户端通过 `http://192.168.30.124:3000/` 和 `http://192.168.30.124:3100/` 正常访问，重启后策略路由自动恢复。
