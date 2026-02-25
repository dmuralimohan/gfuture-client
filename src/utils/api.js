import axios from 'axios';

// Empty base URL — requests go to same origin (EC2 serves both client & API)
const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── In-memory GET cache ──────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60_000; // 1 minute

function getCacheKey(config) {
  const params = config.params ? JSON.stringify(config.params, Object.keys(config.params).sort()) : '';
  return `${config.url}|${params}`;
}

/**
 * Cached GET — returns cached response for identical URL+params within TTL.
 * Usage: api.cachedGet('/api/services', { params: { ... } })
 */
api.cachedGet = (url, config = {}) => {
  const key = getCacheKey({ url, ...config });
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) {
    return Promise.resolve(entry.response);
  }
  return api.get(url, config).then((response) => {
    cache.set(key, { response, time: Date.now() });
    return response;
  });
};

/** Clear cache (call after mutations like admin CRUD) */
api.clearCache = () => cache.clear();

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh on 401 (with queue to prevent race conditions)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request — wait for the ongoing refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
