import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Games API
export const gamesAPI = {
  getAll: () => api.get('/games'),
  getById: (gameId) => api.get(`/games/${gameId}`),
  submitResult: (gameId, data) => api.post(`/games/${gameId}/submit`, data),
};

// Analytics API
export const analyticsAPI = {
  getStudent: () => api.get('/analytics/student'),
  getAdmin: () => api.get('/analytics/admin'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getTopPerformers: () => api.get('/users/top-performers'),
};

// Leaderboard API
export const leaderboardAPI = {
  get: (type = 'xp', limit = 50) => api.get(`/leaderboard?type=${type}&limit=${limit}`),
};

// Learning Path API
export const learningPathAPI = {
  get: () => api.get('/learning-path'),
};

export default api;
