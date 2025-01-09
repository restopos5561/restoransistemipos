import axios from 'axios';
import { tokenService } from '../services/token.service';

const instance = axios.create({
  baseURL: 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        const response = await instance.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        tokenService.setTokens(accessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance; 