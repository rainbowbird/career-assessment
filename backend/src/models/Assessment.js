const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Assessment = sequelize.define('Assessment', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  assessmentId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'assessment_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  major: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  className: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'class_name'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  school: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  education: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '用户答题记录JSON数组'
  },
  optionMaps: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'option_maps',
    comment: '选项映射关系'
  },
  scores: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '各维度得分JSON'
  },
  totalScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_score'
  },
  timeElapsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'time_elapsed',
    comment: '测评用时（秒）'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  }
}, {
  tableName: 'assessments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['assessment_id'] },
    { fields: ['created_at'] },
    { fields: ['major'] },
    { fields: ['total_score'] }
  ]
});

module.exports = Assessment;