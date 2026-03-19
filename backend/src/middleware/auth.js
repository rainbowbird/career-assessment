// 管理员认证中间件
exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({
      error: '未授权访问',
      message: '请先登录管理员账号'
    });
  }
};