# 学生职场潜能测评系统

前后端分离的学生职场潜能测评应用，支持用户测评、管理员查看统计数据、导出Excel报告等功能。

## 技术栈

- **前端**: HTML5 + Tailwind CSS + Chart.js
- **后端**: Node.js + Express + Sequelize
- **数据库**: MySQL 8.0
- **部署**: Docker Compose

## 功能特性

### 用户端
- 完整的31道职场情境测评
- 测评计时功能
- 暂停/继续功能
- 雷达图展示各维度得分
- PDF报告下载（保留原有功能）

### 管理端
- 管理员登录认证
- 测评数据列表查看
- 详细报告查看
- 简易报告查看
- 数据统计图表（总分、维度、专业分布）
- **数据筛选功能**（按专业、分数范围、日期）
- **Excel导出功能**
- 测评记录删除

## 端口配置

| 服务 | 端口 | 用途 |
|------|------|------|
| Frontend (Nginx) | 8080 | 前端访问 |
| Backend (Node.js) | 3000 | API服务 |
| Backend Debug | 9229 | Node.js Inspector调试 |
| MySQL | 3306 | 数据库服务 |
| MySQL X Protocol | 33060 | MySQL调试/扩展 |

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd career-assessment
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 应用环境
NODE_ENV=production

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_NAME=career_assessment
DB_USER=root
DB_PASSWORD=your_secure_password

# 管理员密码（重要：请修改为强密码）
ADMIN_PASSWORD=Lonlink789

# Session密钥（重要：生产环境请使用随机字符串）
SESSION_SECRET=your-random-secret-key

# 前端地址
FRONTEND_URL=http://localhost:8080
```

### 3. 启动服务

```bash
docker-compose up -d
```

首次启动会自动：
1. 拉取MySQL镜像
2. 构建Node.js后端镜像
3. 初始化数据库表结构
4. 启动Nginx前端服务

### 4. 访问应用

- **用户端**: http://localhost:8080
- **管理员端**: 点击右上角的"管理员登录"
  - 默认密码: `Lonlink789`（请在.env中修改）

### 5. 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 后端服务日志
docker-compose logs -f backend

# MySQL日志
docker-compose logs -f mysql
```

## 调试指南

### 后端调试 (Node.js)

使用 Chrome DevTools 或 VS Code 调试：

1. **Chrome DevTools**:
   - 打开 `chrome://inspect`
   - 点击 "Open dedicated DevTools for Node"
   - 连接 `localhost:9229`

2. **VS Code**:
   - 创建 `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "attach",
         "name": "Debug Backend",
         "address": "localhost",
         "port": 9229,
         "localRoot": "${workspaceFolder}/backend",
         "remoteRoot": "/app"
       }
     ]
   }
   ```
   - 按 F5 启动调试

### MySQL调试

```bash
# 进入MySQL容器
docker-compose exec mysql mysql -u root -p

# 查看数据库
career_assessment
SHOW TABLES;

# 查看测评数据
SELECT * FROM assessments ORDER BY created_at DESC LIMIT 10;

# 查看统计
SELECT major, COUNT(*) as count FROM assessments GROUP BY major;
```

## 数据备份与恢复

### 备份

```bash
# 备份数据库
docker-compose exec mysql mysqldump -u root -p career_assessment > backup.sql

# 备份上传文件
tar -czvf uploads-backup.tar.gz uploads/
```

### 恢复

```bash
# 恢复数据库
docker-compose exec -T mysql mysql -u root -p career_assessment < backup.sql

# 恢复上传文件
tar -xzvf uploads-backup.tar.gz
```

## 常见问题

### 1. 数据库连接失败

检查MySQL容器状态：
```bash
docker-compose ps
docker-compose logs mysql
```

确保MySQL完全启动后再启动backend服务。

### 2. 前端无法访问API

检查CORS配置：
- 确保 `.env` 中的 `FRONTEND_URL` 与实际访问地址一致
- 检查浏览器开发者工具的网络请求

### 3. 调试端口无法连接

确保防火墙未阻止：
```bash
# Linux
sudo ufw allow 9229/tcp
sudo ufw allow 3306/tcp
```

### 4. 数据未保存到数据库

检查：
1. API服务是否正常运行
2. 浏览器控制台是否有错误
3. 网络请求是否返回200

## 生产环境部署建议

1. **修改默认密码**
   - 在 `.env` 中设置强密码
   - 修改 `ADMIN_PASSWORD`
   - 修改 `DB_PASSWORD`
   - 修改 `SESSION_SECRET`

2. **启用HTTPS**
   - 配置Nginx SSL证书
   - 修改 `FRONTEND_URL` 为HTTPS地址

3. **数据库安全**
   - 使用非root用户连接数据库
   - 限制数据库端口访问（移除3306端口映射）

4. **日志管理**
   - 配置日志轮转
   - 使用日志收集工具（如ELK Stack）

5. **监控**
   - 添加应用监控（如Prometheus + Grafana）
   - 配置健康检查告警

## API文档

### 公开API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/admin/login` | POST | 管理员登录 |

### 需要认证的API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/assessments` | GET | 获取测评列表（支持筛选） |
| `/api/assessments` | POST | 创建测评 |
| `/api/assessments/:id` | GET | 获取单个测评详情 |
| `/api/assessments/:id` | DELETE | 删除测评 |
| `/api/assessments/statistics` | GET | 获取统计数据 |
| `/api/admin/export` | GET | 导出Excel |
| `/api/admin/check` | GET | 检查登录状态 |
| `/api/admin/logout` | POST | 登出 |

## 文件结构

```
career-assessment/
├── backend/
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── js/
│   │   ├── api.js           # API调用层
│   │   └── api-patch.js     # 函数补丁
│   └── index.html           # 主页面
├── database/
│   └── init.sql             # 数据库初始化脚本
├── uploads/                 # 上传文件目录
├── docker-compose.yml       # Docker编排配置
├── nginx.conf              # Nginx配置
└── .env.example            # 环境变量模板
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持前后端分离架构
- 支持MySQL数据库存储
- 支持管理员功能和Excel导出
- 支持Docker部署和调试端口

## License

MIT License