// 格式化时间（秒 -> mm:ss）
exports.formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 生成唯一ID
exports.generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 延迟函数（用于测试）
exports.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));