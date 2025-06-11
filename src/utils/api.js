import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pairplay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('pairplay_token');
      localStorage.removeItem('pairplay_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Couple API calls
export const coupleAPI = {
  connect: (coupleCode) => api.post('/couple/connect', { coupleCode }),
  getInfo: () => api.get('/couple/info'),
  addMilestone: (milestoneData) => api.post('/couple/milestone', milestoneData),
  updateSettings: (settings) => api.put('/couple/settings', settings),
  disconnect: () => api.delete('/couple/disconnect'),
};

// Journal API calls
export const journalAPI = {
  create: (journalData) => api.post('/journal/new', journalData),
  getAll: (params) => api.get('/journal', { params }),
  getById: (id) => api.get(`/journal/${id}`),
  update: (id, journalData) => api.put(`/journal/${id}`, journalData),
  delete: (id) => api.delete(`/journal/${id}`),
  addReaction: (id, reaction) => api.post(`/journal/${id}/react`, reaction),
  addComment: (id, comment) => api.post(`/journal/${id}/comment`, comment),
};

// Quiz API calls
export const quizAPI = {
  create: (quizData) => api.post('/quiz/custom', quizData),
  getAll: (params) => api.get('/quiz', { params }),
  getById: (id) => api.get(`/quiz/${id}`),
  submit: (id, answers) => api.post(`/quiz/${id}/submit`, answers),
  getResults: (id) => api.get(`/quiz/${id}/results`),
  delete: (id) => api.delete(`/quiz/${id}`),
};

// Gift API calls
export const giftAPI = {
  send: (giftData) => api.post('/gift/send', giftData),
  getAll: (params) => api.get('/gift', { params }),
  open: (id) => api.post(`/gift/${id}/open`),
  react: (id, reaction) => api.post(`/gift/${id}/react`, reaction),
  getStats: () => api.get('/gift/stats'),
};

// Game API calls
export const gameAPI = {
  create: (gameData) => api.post('/games/create', gameData),
  join: (id) => api.post(`/games/${id}/join`),
  makeMove: (id, move) => api.post(`/games/${id}/move`, move),
  endGame: (id, gameResult) => api.post(`/games/${id}/end`, gameResult),
  getHistory: (params) => api.get('/games/history', { params }),
  getStats: () => api.get('/games/stats'),
};

// Watch API calls
export const watchAPI = {
  start: (sessionData) => api.post('/watch/start', sessionData),
  sync: (syncData) => api.post('/watch/sync', syncData),
  getHistory: (params) => api.get('/watch/history', { params }),
  addToWatchlist: (videoData) => api.post('/watch/watchlist', videoData),
  getWatchlist: () => api.get('/watch/watchlist'),
  removeFromWatchlist: (index) => api.delete(`/watch/watchlist/${index}`),
};

// AI API calls
export const aiAPI = {
  generateLoveLetter: (letterData) => api.post('/ai/love-letter', letterData),
  generateQuiz: (quizData) => api.post('/ai/quiz', quizData),
};

// Activity API calls
export const activityAPI = {
  getAll: (params) => api.get('/activity', { params }),
  create: (activityData) => api.post('/activity', activityData),
  getStats: (params) => api.get('/activity/stats', { params }),
  cleanup: (params) => api.delete('/activity/cleanup', { params }),
};

export default api;