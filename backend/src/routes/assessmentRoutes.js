const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

// 创建测评结果
router.post('/', assessmentController.createAssessment);

// 获取统计信息（必须在 /:id 之前定义）
router.get('/statistics', assessmentController.getStatistics);

// 获取所有测评结果（管理员用）
router.get('/', assessmentController.getAllAssessments);

// 获取单个测评详情
router.get('/:id', assessmentController.getAssessmentById);

// 删除测评
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;