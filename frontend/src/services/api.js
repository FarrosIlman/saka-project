import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan. Silakan coba lagi.';
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', message);
    }
    
    // Handle 500 server error
    if (error.response?.status >= 500) {
      console.error('Server error:', message);
    }
    
    return Promise.reject({
      status: error.response?.status,
      message: message,
      data: error.response?.data,
      originalError: error,
    });
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getUserProgress: (userId) => {
    return api.get(`/admin/progress/${userId}`);
  },
};

// Level API
export const levelAPI = {
  getAllLevels: () => api.get('/levels'),
  getStudentLevels: () => api.get('/levels/student'),
  getLevelQuestions: (levelNumber) => api.get(`/levels/${levelNumber}/questions/student`),
  checkAnswer: (data) => api.post('/levels/quiz/check-answer', data),
  createLevel: (levelData) => api.post('/levels', levelData),
  updateLevel: (levelId, levelData) => api.put(`/levels/${levelId}`, levelData),
  deleteLevel: (levelId) => api.delete(`/levels/${levelId}`),
  createQuestion: (levelId, questionData) => api.post(`/levels/${levelId}/questions`, questionData),
  updateQuestion: (questionId, questionData) => api.put(`/levels/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/levels/questions/${questionId}`),
};

// Progress API
export const progressAPI = {
  getProgress: () => api.get('/progress'),
  completeLevel: (data) => api.post('/progress/complete-level', data),
  getLeaderboard: (limit = 10) => api.get('/leaderboard', { params: { limit } }),
  getAchievements: (userId) => api.get(`/achievements/${userId}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updatePassword: (data) => api.post('/user/update-password', data),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePreferences: (data) => api.put('/user/preferences', data),
};

export default api;