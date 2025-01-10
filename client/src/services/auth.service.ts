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
                const branchLoginData = {
                    email: credentials.email,
                    branchId: credentials.branchId
                };
                const response = await api.post(API_ENDPOINTS.AUTH.LOGIN_WITH_BRANCH, branchLoginData);
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
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.error);
            }
            throw error;
        }
    },

    loginWithBranch: async (data: { email: string; branchId: number }): Promise<LoginResponse> => {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN_WITH_BRANCH, data);
            console.log('Branch login response:', response.data);
            
            if (response.data.data?.accessToken && response.data.data?.refreshToken) {
                const success = tokenService.setTokens(
                    response.data.data.accessToken,
                    response.data.data.refreshToken
                );
                if (!success) {
                    throw new Error('Token kaydetme işlemi başarısız oldu');
                }

                // Şube ID'sini localStorage'a kaydet
                localStorage.setItem('branchId', data.branchId.toString());
            }
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.error);
            }
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

            const accessToken = tokenService.getAccessToken();
            if (!accessToken) {
                throw new Error('No access token found');
            }

            const response = await api.get<ProfileResponse>(API_ENDPOINTS.AUTH.ME, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                timeout: 10000 // 10 saniye timeout
            });

            if (!response.data || !response.data.data) {
                throw new Error('Invalid profile response');
            }

            // RestaurantId ve BranchId'yi güncelle
            if (response.data.data.restaurantId) {
                localStorage.setItem('restaurantId', response.data.data.restaurantId.toString());
            }
            if (response.data.data.branchId) {
                localStorage.setItem('branchId', response.data.data.branchId.toString());
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Get profile error:', error);
            if (error.code === 'ECONNABORTED') {
                throw new Error('Profil bilgileri alınamadı. Sunucu yanıt vermiyor.');
            }
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
            tokenService.clearTokens();
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
            tokenService.clearTokens();
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

    async getUserBranches() {
        try {
            const response = await api.get(API_ENDPOINTS.AUTH.BRANCHES);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.error);
            }
            throw error;
        }
    }
}; 