-- 创建数据库
CREATE DATABASE IF NOT EXISTS career_assessment 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE career_assessment;

-- 测评记录表
CREATE TABLE IF NOT EXISTS assessments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assessment_id VARCHAR(50) NOT NULL UNIQUE COMMENT '测评唯一标识',
  name VARCHAR(100) NOT NULL COMMENT '姓名',
  major VARCHAR(100) NOT NULL COMMENT '专业',
  class_name VARCHAR(100) NOT NULL COMMENT '班级',
  email VARCHAR(100) NOT NULL COMMENT '邮箱',
  school VARCHAR(100) NOT NULL COMMENT '学校',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  education VARCHAR(20) NOT NULL COMMENT '学历',
  answers JSON NOT NULL COMMENT '答题记录',
  option_maps JSON COMMENT '选项映射关系',
  scores JSON NOT NULL COMMENT '各维度得分',
  total_score INT NOT NULL COMMENT '总分',
  time_elapsed INT NOT NULL DEFAULT 0 COMMENT '测评用时（秒）',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assessment_id (assessment_id),
  INDEX idx_created_at (created_at),
  INDEX idx_major (major),
  INDEX idx_total_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测评记录表';

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  last_login TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 插入默认管理员（密码: Lonlink789）
-- 注意：生产环境应该使用bcrypt加密密码
INSERT INTO admins (username, password, is_active) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere', TRUE)
ON DUPLICATE KEY UPDATE username = username;

-- 查看表结构
SHOW TABLES;