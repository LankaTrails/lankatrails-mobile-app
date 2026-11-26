import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getToken } from '@/utils/tokenStorage';
import { isTokenAboutToExpire, handleTokenRefresh } from '@/utils/authTokenManager';
import { API_URL } from '@/utils/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Client-Type': 'mobile',
  },
});

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// Attach the access token, refreshing it first when it is expired or about to expire
api.interceptors.request.use(async (config) => {
  let token = await getToken('ACCESS_TOKEN');
  if (token && isTokenAboutToExpire(token)) {
    token = await handleTokenRefresh();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableRequest | undefined;

    // One refresh + retry on 401; a failed refresh signs the user out (see authTokenManager)
    if (error.response?.status === 401 && original && !original._retry && (await getToken('REFRESH_TOKEN'))) {
      original._retry = true;
      try {
        const token = await handleTokenRefresh();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        return Promise.reject({ isAuthError: true, message: 'Session expired. Please sign in again.' });
      }
    }

    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Cannot reach the LankaTrails server. Check your connection.',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
