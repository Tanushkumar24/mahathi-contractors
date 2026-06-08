import axios from 'axios';

// Backend server URL pointing to Railway app (defaulting to localhost:5000 in development)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization bearer tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mbc_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch token expiry and session anomalies
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear corrupted or expired sessions
      localStorage.removeItem('mbc_jwt_token');
      localStorage.removeItem('mbc_user_session');
      
      // Force user login if they are currently on a protected layout
      const publicPaths = ['/login', '/about', '/services', '/projects', '/reviews', '/contact', '/'];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.some(p => p === currentPath || currentPath.startsWith('/services/'));
      
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
