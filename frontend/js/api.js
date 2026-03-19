// API基础配置
const API_BASE_URL = '/api';

// 通用的fetch封装
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include', // 支持session cookie
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}

// 测评相关API
const AssessmentAPI = {
  // 创建测评结果
  create: async (assessmentData) => {
    return fetchAPI('/assessments', {
      method: 'POST',
      body: assessmentData
    });
  },

  // 获取所有测评结果
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/assessments?${queryString}`);
  },

  // 获取单个测评详情
  getById: async (id) => {
    return fetchAPI(`/assessments/${id}`);
  },

  // 删除测评
  delete: async (id) => {
    return fetchAPI(`/assessments/${id}`, {
      method: 'DELETE'
    });
  },

  // 获取统计信息
  getStatistics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/assessments/statistics?${queryString}`);
  }
};

// 管理员相关API
const AdminAPI = {
  // 登录
  login: async (password) => {
    return fetchAPI('/admin/login', {
      method: 'POST',
      body: { password }
    });
  },

  // 检查登录状态
  checkAuth: async () => {
    return fetchAPI('/admin/check');
  },

  // 登出
  logout: async () => {
    return fetchAPI('/admin/logout', {
      method: 'POST'
    });
  },

  // 导出Excel
  exportExcel: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/admin/export?${queryString}`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '导出失败');
    }
    
    // 下载文件
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `测评数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  }
};

// 健康检查
const HealthAPI = {
  check: async () => {
    return fetchAPI('/health');
  }
};

// 导出API
window.AssessmentAPI = AssessmentAPI;
window.AdminAPI = AdminAPI;
window.HealthAPI = HealthAPI;
