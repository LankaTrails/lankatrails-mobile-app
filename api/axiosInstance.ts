import axios from 'axios';
import { getToken } from '@/utils/tokenStorage';
import { isTokenExpired, isTokenAboutToExpire, handleTokenRefresh } from '@/utils/authTokenManager';
import { logger } from '@/utils/logger';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Client-Type': 'mobile',
  },
});

// Attach tokens + proactive refresh
api.interceptors.request.use(async (config) => {
  const token = await getToken('ACCESS_TOKEN');

  if (token) {
    if (isTokenExpired(token)) {
      logger.warn('[API] Access token expired before request, refreshing...');
      const newToken = await handleTokenRefresh();
      config.headers.Authorization = `Bearer ${newToken}`;
    } else if (isTokenAboutToExpire(token)) {
      logger.info('[API] Access token about to expire, proactively refreshing...');
      const newToken = await handleTokenRefresh();
      config.headers.Authorization = `Bearer ${newToken}`;
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
}, (error) => Promise.reject(error));

// Response error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      logger.warn('[API] 401 detected, attempting refresh + retry...');
      originalRequest._retry = true;

      try {
        const newToken = await handleTokenRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        logger.error('[API] Token refresh on 401 failed', refreshErr);
        return Promise.reject({
          isAuthError: true,
          message: 'Session expired. Please login again.',
        });
      }
    }

    if (error.code === 'ERR_NETWORK') {
      logger.error('[API] Network error:', error.message);
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Please check your connection.',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
