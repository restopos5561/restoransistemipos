import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { LoginCredentials, RegisterCredentials, LoginResponse, User } from '../types/auth.types';
import { tokenService } from '../services/token.service';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: (data: RegisterCredentials) => authService.register(data),
        onSuccess: () => {
            navigate('/login');
        },
        onError: (error: any) => {
            console.error('Register error:', error);
            tokenService.clearTokens();
        }
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
            try {
                const response = await authService.login(credentials);
                console.log('Login response in mutation:', response);
                return response;
            } catch (error) {
                console.error('Login error:', error);
                tokenService.clearTokens();
                throw error;
            }
        },
        onSuccess: async (response) => {
            // Başarılı login kontrolü
            if (response.success && !response.error && response.data?.accessToken) {
                console.log('Login successful, updating profile...');
                // Profile'ı güncelle ve bekle
                await queryClient.invalidateQueries({ queryKey: ['profile'] });
                await queryClient.fetchQuery({ queryKey: ['profile'] });
                console.log('Profile updated, navigating to dashboard...');
                navigate('/');
                return;
            }

            // Çoklu şube kontrolü - ilk login denemesinde beklenen bir durum
            if (response.error === 'MULTIPLE_ACTIVE_BRANCHES') {
                return; // Şube seçimi için dialog gösterilecek
            }
        },
        onError: (error: any) => {
            console.error('Login error:', error);
            tokenService.clearTokens();
        }
    });

    // Profile query
    const profileQuery = useQuery<User>({
        queryKey: ['profile'],
        queryFn: authService.getProfile,
        enabled: tokenService.hasValidTokens(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 dakika
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            queryClient.clear();
            tokenService.clearTokens();
            queryClient.setQueryData(['profile'], null);
            navigate('/login');
        },
        onError: (error) => {
            console.error('Logout error:', error);
            tokenService.clearTokens();
            queryClient.clear();
            navigate('/login');
        }
    });

    return {
        login: loginMutation.mutateAsync,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
        isLoading: loginMutation.isPending || logoutMutation.isPending || registerMutation.isPending,
        error: loginMutation.error || logoutMutation.error || registerMutation.error,
        user: profileQuery.data,
        isAuthenticated: !!profileQuery.data && tokenService.hasValidTokens(),
        isProfileLoading: profileQuery.isLoading
    };
}; 