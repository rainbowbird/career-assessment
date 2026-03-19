require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const sequelize = require('./config/sequelize');
const assessmentRoutes = require('./routes/assessmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const assessmentController = require('./controllers/assessmentController');
const { requireAuth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet({
  contentSecurityPolicy: false // 禁用CSP以便前端能正常工作
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Session配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'career-assessment-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 数据库连接测试
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');
    
    // 同步模型（开发环境使用，生产环境应该使用迁移）
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✓ 数据库模型同步完成');
    }
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
    // 不退出进程，让应用继续运行以便调试
  }
}

// 路由
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 公开路由
app.use('/api/admin', adminRoutes);

// 公开API：创建测评（不需要认证）
app.post('/api/assessments', assessmentController.createAssessment);

// 需要认证的管理员路由
app.use('/api/assessments', requireAuth, assessmentRoutes);

// 静态文件（上传目录）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 错误处理
app.use(errorHandler);

// 启动服务器
async function startServer() {
  await testDatabaseConnection();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ 服务器运行在端口 ${PORT}`);
    console.log(`✓ API地址: http://localhost:${PORT}/api`);
    console.log(`✓ 健康检查: http://localhost:${PORT}/api/health`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✓ Debug端口: 9229 (Node.js Inspector)`);
    }
  });
}

startServer().catch(console.error);