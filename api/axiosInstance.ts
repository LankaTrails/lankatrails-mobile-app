import { clearAllTokens, getToken, saveToken } from '@/utils/secureStore';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { router } from 'expo-router';

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// Create instance
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Client-Type': 'mobile',
  },
});

console.log('[API] Axios instance created with baseURL:', process.env.EXPO_PUBLIC_API_URL);

// Retry strategy (retries once on network/server errors)
axiosRetry(api, {
  retries: 1,
  retryDelay: (retryCount) => {
    const delay = retryCount * 1000;
    console.log(`[API] Retry attempt ${retryCount}, delay: ${delay}ms`);
    return delay;
  },
  retryCondition: (error) => {
    const shouldRetry = (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === 'ECONNABORTED' ||
      (error.response ? error.response.status >= 500 : false)
    );

    if (shouldRetry) {
      console.log('[API] Retry condition met for error:', {
        code: error.code,
        status: error.response?.status,
        message: error.message
      });
    }

    return shouldRetry;
  },
});

console.log('[API] Axios retry configured with 1 retry attempt');

// Request interceptor
api.interceptors.request.use(async (config) => {
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log(`[API] 🚀 Outgoing ${config.method?.toUpperCase()} to: ${fullUrl}`);

  // Log request details
  if (config.data) {
    console.log(`[API] Request body:`, config.data);
  }

  if (config.params) {
    console.log(`[API] Request params:`, config.params);
  }

  try {
    const token = await getToken('ACCESS_TOKEN');
    if (token) {
      console.log(`[API] ✅ Access token attached to request`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log(`[API] ⚠️ No access token found for request`);
    }
    return config;
  } catch (error) {
    console.error('[API] ❌ Failed to attach access token:', error);
    return config;
  }
}, (error) => {
  console.error('[API] ❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    console.log(`[API] ✅ Success response from ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      dataSize: JSON.stringify(response.data).length
    });

    // Log response data (be careful with sensitive data)
    if (response.data) {
      console.log(`[API] Response data:`, response.data);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const fullUrl = `${originalRequest?.baseURL}${originalRequest?.url}`;
    const duration = Date.now() - (originalRequest?.metadata?.startTime || 0);

    console.error(`[API] ❌ Error response from ${fullUrl}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      code: error.code,
      message: error.message,
      duration: `${duration}ms`,
      data: error.response?.data
    });

    // If token is expired and not retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('[API] 🔄 401 Unauthorized - attempting token refresh...');

      originalRequest._retry = true;

      try {
        const refreshToken = await getToken('REFRESH_TOKEN');
        if (!refreshToken) {
          console.error('[API] ❌ No refresh token found');
          throw new Error('No refresh token found');
        }

        console.log('[API] 🔑 Refresh token found, making refresh request...');
        const refreshStartTime = Date.now();

        const refreshResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const refreshDuration = Date.now() - refreshStartTime;
        console.log(`[API] ✅ Token refresh successful (${refreshDuration}ms)`);

        const { jwtToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Save new tokens
        await saveToken('ACCESS_TOKEN', jwtToken);
        console.log('[API] ✅ New access token saved');

        if (newRefreshToken) {
          await saveToken('REFRESH_TOKEN', newRefreshToken);
          console.log('[API] ✅ New refresh token saved');
        }

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${jwtToken}`;
        console.log('[API] 🔄 Retrying original request with new token...');

        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] ❌ Token refresh failed:', refreshError);

        // Optional: call logout API to clean up on backend
        try {
          console.log('[API] 🚪 Attempting logout API call...');
          await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`);
          console.log('[API] ✅ Logout API call successful');
        } catch (logoutError) {
          console.error('[API] ❌ Logout API call failed:', logoutError);
        }

        console.log('[API] 🧹 Clearing all tokens...');
        await clearAllTokens();

        console.log('[API] 🔄 Redirecting to sign in...');
        if (!router.canGoBack()) {
          router.replace('/signIn');
        }

        return Promise.reject({
          ...(typeof refreshError === 'object' && refreshError !== null ? refreshError : { error: refreshError }),
          isAuthError: true,
          message: 'Session expired. Please login again.'
        });
      }
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('[API] 🌐 Network error detected:', error.message);
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Please check your connection.'
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('[API] ⏱️ Request timeout:', error.message);
    }

    // Handle other HTTP errors
    if (error.response) {
      console.error(`[API] HTTP ${error.response.status} Error:`, {
        url: fullUrl,
        method: originalRequest?.method?.toUpperCase(),
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }

    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message
    });
  }
);

// Add request timing
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

console.log('[API] Axios interceptors configured successfully');

export default api;
