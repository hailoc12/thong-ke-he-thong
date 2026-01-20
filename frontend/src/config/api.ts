import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// API Base URL - Use relative path for same-origin requests (works with both domains)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check both localStorage (remember_me=true) and sessionStorage (remember_me=false)
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check both storages for refresh token
        let refreshToken = localStorage.getItem('refresh_token');
        let storage: Storage = localStorage;

        if (!refreshToken) {
          refreshToken = sessionStorage.getItem('refresh_token');
          storage = sessionStorage;
        }

        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          // Save to the same storage where refresh token was found
          storage.setItem('access_token', access);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens from both storages and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
