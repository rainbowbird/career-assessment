#!/bin/bash

# 学生职场潜能测评系统部署脚本

set -e

echo "🚀 开始部署学生职场潜能测评系统..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: Docker Compose未安装"
    exit 1
fi

echo "✓ Docker环境检查通过"

# 检查.env文件
if [ ! -f .env ]; then
    echo "⚠️  未找到.env文件，从模板创建..."
    cp .env.example .env
    echo "⚠️  请编辑.env文件配置数据库密码和管理员密码"
    exit 1
fi

echo "✓ 环境变量配置检查通过"

# 创建必要目录
echo "📁 创建必要目录..."
mkdir -p uploads
mkdir -p database

# 停止旧服务（如果存在）
echo "🛑 停止旧服务..."
docker-compose down --remove-orphans 2>/dev/null || true

# 拉取最新镜像
echo "⬇️  拉取Docker镜像..."
docker-compose pull mysql

# 构建并启动服务
echo "🏗️  构建并启动服务..."
docker-compose up --build -d

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
if docker-compose ps | grep -q "Up"; then
    echo "✓ 所有服务已启动"
else
    echo "❌ 服务启动失败，查看日志:"
    docker-compose logs
    exit 1
fi

# 健康检查
echo "🏥 执行健康检查..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if curl -s http://localhost:3000/api/health | grep -q '"status":"ok"'; then
        echo "✓ 后端服务健康"
        break
    fi
    retry_count=$((retry_count + 1))
    echo "  等待后端服务就绪... ($retry_count/$max_retries)"
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    echo "❌ 后端服务启动超时"
    docker-compose logs backend
    exit 1
fi

echo ""
echo "✅ 部署成功！"
echo ""
echo "🌐 访问地址:"
echo "   - 用户端: http://localhost:8080"
echo "   - API文档: http://localhost:3000/api/health"
echo ""
echo "🔧 调试端口:"
echo "   - Node.js Inspector: localhost:9229"
echo "   - MySQL: localhost:3306"
echo ""
echo "📋 常用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo "   查看状态: docker-compose ps"
echo ""
echo "🔐 默认管理员密码: Lonlink789"
echo "   请在 .env 文件中修改默认密码！"
echo ""

# 显示容器状态
docker-compose ps