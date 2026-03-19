const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const exportController = require('../controllers/exportController');

// 管理员登录
router.post('/login', adminController.login);

// 检查登录状态
router.get('/check', adminController.checkAuth);

// 登出
router.post('/logout', adminController.logout);

// 导出Excel
router.get('/export', exportController.exportAssessments);

module.exports = router;