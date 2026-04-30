// src/api/client.js
// Axios client with auto session-rehydration on 401 and graceful error handling

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach token ───────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) config.headers['X-Session-Token'] = token;
  return config;
});

// ── Response interceptor: on 401 re-issue demo session then retry once ──────
let _rehydrating = false;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && !_rehydrating) {
      original._retry = true;
      _rehydrating = true;
      try {
        const savedUser = localStorage.getItem('uni_user');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          const res = await axios.post(`${BASE_URL}/auth/demo-login`, {
            email: u.email, name: u.name,
          });
          localStorage.setItem('session_token', res.data.token);
          original.headers['X-Session-Token'] = res.data.token;
          _rehydrating = false;
          return api(original);
        }
      } catch { /* ignore */ }
      _rehydrating = false;
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  demoLogin: (d) => api.post('/auth/demo-login', d),
  getMe:     (t) => api.get(`/auth/me?token=${t}`),
  logout:    (t) => api.post(`/auth/logout?token=${t}`),
  getGoogleLoginUrl: () => api.get('/auth/login'),
};

// ─── User ────────────────────────────────────────────────────────────────────
export const userAPI = {
  saveProfile: (p) => api.post('/user/profile', p),
  getProfile:  (id) => api.get(`/user/profile/${id}`),
};

// ─── Recommendations ─────────────────────────────────────────────────────────
export const recommendAPI = {
  getCourses:      (s, n = 8)  => api.post(`/recommend/courses?n=${n}`, s),
  getEvents:       (s, n = 6)  => api.post(`/recommend/events?n=${n}`, s),
  getMaterials:    (s, n = 8)  => api.post(`/recommend/materials?n=${n}`, s),
  getCareer:       (s, n = 5)  => api.post(`/recommend/career?n=${n}`, s),
  getSemesterPlan: (s)         => api.post('/recommend/semester-plan', s),
};

// ─── Feedback ────────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (f) => api.post('/feedback/', f),
};

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export const chatbotAPI = {
  query: (payload) => api.post('/chatbot/query', payload),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};
