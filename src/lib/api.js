import axios from 'axios';

// Backend server URL pointing to Railway app (defaulting to localhost:5000 in development)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: true, // Crucial for sending and receiving HttpOnly cookies cross-origin
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to catch token expiry and trigger automated cookie-based token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authEndpointsWithoutRefresh = [
      '/api/auth/firebase-login',
      '/api/auth/send-email-otp',
      '/api/auth/verify-email-otp',
      '/api/auth/logout'
    ];

    if (authEndpointsWithoutRefresh.includes(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Handle session expiration or unauthorized request (401/403)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      // Avoid infinite loop if refresh request itself fails
      if (originalRequest.url === '/api/auth/refresh') {
        clearAuthSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request backend to rotate refresh token stored in HttpOnly cookie and return a new JWT
        const res = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { token, user } = res.data;

        localStorage.setItem('mbc_jwt_token', token);
        if (user) {
          localStorage.setItem('mbc_user_session', JSON.stringify(user));
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAuthSession();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

function clearAuthSession() {
  localStorage.removeItem('mbc_jwt_token');
  localStorage.removeItem('mbc_user_session');

  // Force redirect if not on a public path
  const publicPaths = ['/login', '/about', '/services', '/projects', '/reviews', '/contact', '/book', '/'];
  const currentPath = window.location.pathname;
  const isPublicPath = publicPaths.some((p) => p === currentPath || currentPath.startsWith('/services/'));

  if (!isPublicPath) {
    window.location.href = '/login';
  }
}

export default api;
