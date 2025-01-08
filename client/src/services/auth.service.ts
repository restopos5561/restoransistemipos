import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { LoginCredentials, RegisterCredentials, LoginResponse, User, ProfileResponse } from '../types/auth.types';
import { tokenService } from './token.service';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            console.log('Login request with credentials:', credentials);
            
            // Şube seçimi sonrası login
            if (credentials.branchId) {
                const response = await api.post(API_ENDPOINTS.AUTH.LOGIN_WITH_BRANCH, credentials);
                console.log('Branch login response:', response.data);
                
                if (response.data.data?.accessToken && response.data.data?.refreshToken) {
                    const success = tokenService.setTokens(
                        response.data.data.accessToken,
                        response.data.data.refreshToken
                    );
                    if (!success) {
                        throw new Error('Token kaydetme işlemi başarısız oldu');
                    }
                }
                return response.data;
            }
            
            // İlk login denemesi
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
            console.log('Initial login response:', response.data);

            // Çoklu şube kontrolü
            if (response.data.error === 'MULTIPLE_ACTIVE_BRANCHES' && 
                Array.isArray(response.data.data?.branches)) {
                return response.data;
            }

            // Token kontrolü
            if (response.data.data?.accessToken && response.data.data?.refreshToken) {
                const success = tokenService.setTokens(
                    response.data.data.accessToken,
                    response.data.data.refreshToken
                );
                if (!success) {
                    throw new Error('Token kaydetme işlemi başarısız oldu');
                }
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            tokenService.clearTokens();
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            const refreshToken = tokenService.getRefreshToken();
            if (refreshToken) {
                await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            tokenService.clearTokens();
        }
    },

    getProfile: async (): Promise<User> => {
        try {
            if (!tokenService.hasValidTokens()) {
                throw new Error('No valid tokens found');
            }
            const response = await api.get<ProfileResponse>(API_ENDPOINTS.AUTH.ME);
            return response.data.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    refreshToken: async (refreshToken: string) => {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data || {};
            
            if (newAccessToken && newRefreshToken) {
                const success = tokenService.setTokens(newAccessToken, newRefreshToken);
                if (!success) {
                    throw new Error('Failed to save new tokens');
                }
            }

            return response.data;
        } catch (error) {
            console.error('Refresh token error:', error);
            tokenService.clearTokens(); // Hata durumunda token'ları temizle
            throw error;
        }
    },

    register: async (data: RegisterCredentials): Promise<LoginResponse> => {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
            const { accessToken, refreshToken } = response.data.data || {};
            
            if (accessToken && refreshToken) {
                const success = tokenService.setTokens(accessToken, refreshToken);
                if (!success) {
                    throw new Error('Failed to save tokens after registration');
                }
            }

            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            tokenService.clearTokens(); // Hata durumunda token'ları temizle
            throw error;
        }
    },

    async forgotPassword(email: string) {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.error);
            }
            throw error;
        }
    },

    async resetPassword(token: string, password: string) {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
                token,
                password,
                confirmPassword: password
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.error);
            }
            throw error;
        }
    },
}; 