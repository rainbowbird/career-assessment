const XLSX = require('xlsx');
const { Assessment } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// 导出测评数据为Excel
exports.exportAssessments = async (req, res) => {
  try {
    const { 
      major, 
      minScore, 
      maxScore,
      startDate,
      endDate,
      search
    } = req.query;

    const where = {};

    // 应用筛选条件
    if (major) where.major = major;
    
    if (minScore !== undefined || maxScore !== undefined) {
      where.totalScore = {};
      if (minScore !== undefined) where.totalScore[Op.gte] = parseInt(minScore);
      if (maxScore !== undefined) where.totalScore[Op.lte] = parseInt(maxScore);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { major: { [Op.like]: `%${search}%` } }
      ];
    }

    // 获取所有数据
    const assessments = await Assessment.findAll({
      where,
      order: [['created_at', 'DESC']],
      raw: true
    });

    // 准备Excel数据
    const data = assessments.map(a => {
      const row = {
        '测评ID': a.assessmentId,
        '姓名': a.name,
        '专业': a.major,
        '班级': a.className,
        '邮箱': a.email,
        '学校': a.school,
        '手机号': a.phone,
        '学历': a.education,
        '总分': a.totalScore,
        '用时(秒)': a.timeElapsed,
        '测评日期': new Date(a.created_at).toLocaleString('zh-CN'),
        'IP地址': a.ipAddress || ''
      };

      // 添加各维度得分
      if (a.scores && a.scores.dimensionScores) {
        a.scores.dimensionScores.forEach(dim => {
          row[`${dim.name}得分`] = dim.score;
        });
      }

      return row;
    });

    // 创建Excel工作簿
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '测评数据');

    // 设置列宽
    const colWidths = [
      { wch: 20 }, // ID
      { wch: 15 }, // 姓名
      { wch: 20 }, // 专业
      { wch: 15 }, // 班级
      { wch: 25 }, // 邮箱
      { wch: 20 }, // 学校
      { wch: 15 }, // 手机号
      { wch: 10 }, // 学历
      { wch: 10 }, // 总分
      { wch: 12 }, // 用时
      { wch: 20 }, // 日期
      { wch: 15 }, // IP
      { wch: 10 }, // 各维度得分...
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 }
    ];
    ws['!cols'] = colWidths;

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `测评数据_${timestamp}.xlsx`;
    
    // 保存到临时目录
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    XLSX.writeFile(wb, filePath);

    // 发送文件
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('下载文件失败:', err);
      }
      // 删除临时文件
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('删除临时文件失败:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('导出Excel失败:', error);
    res.status(500).json({
      error: '导出Excel失败',
      message: error.message
    });
  }
};