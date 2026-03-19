// 全局错误处理中间件
exports.errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // Sequelize验证错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: '数据验证失败',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize唯一性错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: '数据已存在',
      message: '该记录已存在，请勿重复提交'
    });
  }

  // 默认错误响应
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};