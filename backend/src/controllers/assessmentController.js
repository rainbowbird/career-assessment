const { Assessment } = require('../models');
const { Op } = require('sequelize');

// 创建测评结果
exports.createAssessment = async (req, res) => {
  try {
    const { 
      assessmentId, 
      userInfo, 
      answers, 
      optionMaps, 
      scores, 
      timeElapsed 
    } = req.body;

    // 验证必填字段
    if (!assessmentId || !userInfo || !answers || !scores) {
      return res.status(400).json({ 
        error: '缺少必要字段',
        required: ['assessmentId', 'userInfo', 'answers', 'scores']
      });
    }

    // 创建测评记录
    const assessment = await Assessment.create({
      assessmentId,
      name: userInfo.name,
      major: userInfo.major,
      className: userInfo.class,
      email: userInfo.email,
      school: userInfo.school,
      phone: userInfo.phone,
      education: userInfo.education,
      answers,
      optionMaps,
      scores,
      totalScore: scores.totalScore,
      timeElapsed: timeElapsed || 0,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: '测评结果保存成功',
      data: {
        id: assessment.id,
        assessmentId: assessment.assessmentId
      }
    });
  } catch (error) {
    console.error('保存测评结果失败:', error);
    res.status(500).json({
      error: '保存测评结果失败',
      message: error.message
    });
  }
};

// 获取所有测评结果（管理员用）
exports.getAllAssessments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      major, 
      minScore, 
      maxScore,
      startDate,
      endDate,
      search
    } = req.query;

    const where = {};

    // 专业筛选
    if (major) {
      where.major = major;
    }

    // 分数范围筛选
    if (minScore !== undefined || maxScore !== undefined) {
      where.totalScore = {};
      if (minScore !== undefined) where.totalScore[Op.gte] = parseInt(minScore);
      if (maxScore !== undefined) where.totalScore[Op.lte] = parseInt(maxScore);
    }

    // 日期范围筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    // 搜索（姓名、邮箱、专业）
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { major: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Assessment.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        assessments: rows.map(a => ({
          id: a.assessmentId,
          name: a.name,
          major: a.major,
          className: a.className,
          email: a.email,
          education: a.education,
          totalScore: a.totalScore,
          timeElapsed: a.timeElapsed,
          createdAt: a.created_at ? new Date(a.created_at).toLocaleString('zh-CN') : null,
          scores: a.scores
        }))
      }
    });
  } catch (error) {
    console.error('获取测评列表失败:', error);
    res.status(500).json({
      error: '获取测评列表失败',
      message: error.message
    });
  }
};

// 获取单个测评详情
exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findOne({
      where: { assessmentId: id }
    });

    if (!assessment) {
      return res.status(404).json({
        error: '测评记录不存在'
      });
    }

    res.json({
      success: true,
      data: {
        id: assessment.assessmentId,
        userInfo: {
          name: assessment.name,
          major: assessment.major,
          class: assessment.className,
          email: assessment.email,
          school: assessment.school,
          phone: assessment.phone,
          education: assessment.education
        },
        answers: assessment.answers,
        optionMaps: assessment.optionMaps,
        scores: assessment.scores,
        totalScore: assessment.totalScore,
        timeElapsed: assessment.timeElapsed,
        createdAt: assessment.created_at ? new Date(assessment.created_at).toLocaleString('zh-CN') : null
      }
    });
  } catch (error) {
    console.error('获取测评详情失败:', error);
    res.status(500).json({
      error: '获取测评详情失败',
      message: error.message
    });
  }
};

// 删除测评
exports.deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Assessment.destroy({
      where: { assessmentId: id }
    });

    if (!deleted) {
      return res.status(404).json({
        error: '测评记录不存在'
      });
    }

    res.json({
      success: true,
      message: '测评记录删除成功'
    });
  } catch (error) {
    console.error('删除测评失败:', error);
    res.status(500).json({
      error: '删除测评失败',
      message: error.message
    });
  }
};

// 获取统计信息
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    // 总测评数
    const totalCount = await Assessment.count({ where });

    // 平均总分
    const avgScoreResult = await Assessment.findOne({
      where,
      attributes: [
        [Assessment.sequelize.fn('AVG', Assessment.sequelize.col('total_score')), 'avgScore']
      ],
      raw: true
    });
    const averageScore = Math.round(avgScoreResult?.avgScore || 0);

    // 平均用时
    const avgTimeResult = await Assessment.findOne({
      where,
      attributes: [
        [Assessment.sequelize.fn('AVG', Assessment.sequelize.col('time_elapsed')), 'avgTime']
      ],
      raw: true
    });
    const averageTime = Math.round(avgTimeResult?.avgTime || 0);

    // 专业分布
    const majorDistribution = await Assessment.findAll({
      where,
      attributes: [
        'major',
        [Assessment.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['major'],
      raw: true
    });

    // 分数段分布
    const scoreRanges = [
      { min: 0, max: 59, label: '0-59分' },
      { min: 60, max: 69, label: '60-69分' },
      { min: 70, max: 79, label: '70-79分' },
      { min: 80, max: 89, label: '80-89分' },
      { min: 90, max: 100, label: '90-100分' }
    ];

    const scoreDistribution = await Promise.all(
      scoreRanges.map(async (range) => {
        const count = await Assessment.count({
          where: {
            ...where,
            totalScore: {
              [Op.gte]: range.min,
              [Op.lte]: range.max
            }
          }
        });
        return { ...range, count };
      })
    );

    // 各维度平均分（需要从scores字段计算）
    const allAssessments = await Assessment.findAll({
      where,
      attributes: ['scores'],
      raw: true
    });

    const dimensionScores = {};
    let assessmentCount = 0;
    
    allAssessments.forEach(a => {
      if (a.scores && a.scores.dimensionScores) {
        assessmentCount++;
        a.scores.dimensionScores.forEach(dim => {
          if (!dimensionScores[dim.name]) {
            dimensionScores[dim.name] = { total: 0, count: 0 };
          }
          dimensionScores[dim.name].total += dim.score;
          dimensionScores[dim.name].count++;
        });
      }
    });

    const dimensionAverages = Object.keys(dimensionScores).map(name => ({
      name,
      average: assessmentCount > 0 
        ? Math.round(dimensionScores[name].total / dimensionScores[name].count) 
        : 0
    }));

    res.json({
      success: true,
      data: {
        totalCount,
        averageScore,
        averageTime,
        majorDistribution,
        scoreDistribution,
        dimensionAverages
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      error: '获取统计信息失败',
      message: error.message
    });
  }
};