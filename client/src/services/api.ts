import axios from 'axios';
import { API_CONFIG } from '../config/constants';
import { tokenService } from './token.service';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

// Request interceptor
api.interceptors.request.use(
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
api.interceptors.response.use(
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

                const response = await api.post('/auth/refresh', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                tokenService.setTokens(accessToken, newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                tokenService.clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api; 