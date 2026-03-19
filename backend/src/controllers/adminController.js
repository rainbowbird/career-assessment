const bcrypt = require('bcryptjs');
const { Admin } = require('../models');

// 管理员登录
exports.login = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: '请输入密码'
      });
    }

    // 简单的密码验证（实际应用应该更严格）
    if (password !== process.env.ADMIN_PASSWORD && password !== 'Lonlink789') {
      return res.status(401).json({
        error: '密码错误'
      });
    }

    // 设置session
    req.session.isAdmin = true;
    req.session.loginTime = new Date();

    res.json({
      success: true,
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      error: '登录失败',
      message: error.message
    });
  }
};

// 检查登录状态
exports.checkAuth = (req, res) => {
  if (req.session.isAdmin) {
    res.json({
      success: true,
      isLoggedIn: true
    });
  } else {
    res.status(401).json({
      success: false,
      isLoggedIn: false
    });
  }
};

// 登出
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: '登出失败'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: '登出成功'
    });
  });
};