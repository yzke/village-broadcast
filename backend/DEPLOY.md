# 后端服务部署指南

## 服务器部署步骤

### 1. 上传代码到服务器

将 `backend/` 目录上传到服务器的 `/opt/village-broadcast/`：

```bash
# 在服务器上创建目录
ssh root@192.168.5.100
mkdir -p /opt/village-broadcast
cd /opt/village-broadcast

# 从本地上传（在本地执行）
scp -r backend/* root@192.168.5.100:/opt/village-broadcast/
```

### 2. 安装依赖

```bash
# API 服务
cd /opt/village-broadcast/api
pnpm install

# 弹幕服务
cd /opt/village-broadcast/danmu
pnpm install
```

### 3. 配置环境变量

**API 服务 (`backend/api/.env`)：**
```bash
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
HLS_PATH=/var/lib/nginx/hls
```

**弹幕服务 (`backend/danmu/.env`)：**
```bash
PORT=3002
CORS_ORIGIN=*
API_URL=http://192.168.5.100:3001
```

### 4. 使用 systemd 管理服务

**创建 API 服务文件 `/etc/systemd/system/village-api.service`：**
```ini
[Unit]
Description=Village Broadcast API Service
After=network.target

[Service]
Type=simple
User=http
WorkingDirectory=/opt/village-broadcast/api
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**创建弹幕服务文件 `/etc/systemd/system/village-danmu.service`：**
```ini
[Unit]
Description=Village Broadcast Danmu Service
After=network.target

[Service]
Type=simple
User=http
WorkingDirectory=/opt/village-broadcast/danmu
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5. 启动服务

```bash
# 重载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start village-api
sudo systemctl start village-danmu

# 设置开机自启
sudo systemctl enable village-api
sudo systemctl enable village-danmu

# 查看状态
sudo systemctl status village-api
sudo systemctl status village-danmu

# 查看日志
sudo journalctl -u village-api -f
sudo journalctl -u village-danmu -f
```

### 6. 防火墙配置

```bash
sudo ufw allow 3001/tcp  # API 服务
sudo ufw allow 3002/tcp  # 弹幕服务
```

### 7. 验证部署

```bash
# 健康检查
curl http://192.168.5.100:3001/health
curl http://192.168.5.100:3002/

# 测试登录
curl -X POST http://192.168.5.100:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 默认账户

- **用户名**: admin
- **密码**: admin123

首次部署后请及时修改默认密码！

## 目录结构

```
/opt/village-broadcast/
├── api/
│   ├── src/
│   ├── data/
│   │   └── broadcast.db    # SQLite 数据库
│   ├── package.json
│   └── .env
└── danmu/
    ├── src/
    ├── package.json
    └── .env
```

## 故障排查

**查看日志：**
```bash
sudo journalctl -u village-api -n 50
sudo journalctl -u village-danmu -n 50
```

**重启服务：**
```bash
sudo systemctl restart village-api
sudo systemctl restart village-danmu
```

**检查端口占用：**
```bash
ss -tlnp | grep -E '3001|3002'
```
