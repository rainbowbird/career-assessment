FROM node:18-alpine

# 安装调试工具和数据库客户端（用于排查问题）
RUN apk add --no-cache mysql-client

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖（使用 npm install 因为缺少 package-lock.json）
RUN npm install --omit=dev

# 复制源代码
COPY src/ ./src/

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
# 3000: 应用端口
# 9229: Node.js debug端口
EXPOSE 3000 9229

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令（生产环境）
CMD ["node", "src/app.js"]

# Debug模式（开发环境使用）
# CMD ["node", "--inspect=0.0.0.0:9229", "src/app.js"]