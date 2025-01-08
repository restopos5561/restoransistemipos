import { ApiResponse } from './api.types';

export interface LoginCredentials {
    email: string;
    password: string;
    branchId?: number;
    rememberMe?: boolean;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    permissions?: string[];
    restaurantId: number;
    branchId: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export type LoginResponse = {
    success: boolean;
    error?: string;
    data?: {
        user?: User;
        accessToken?: string;
        refreshToken?: string;
        branches?: Array<{id: number; name: string}>;
    };
};

export type ProfileResponse = ApiResponse<User>;

export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
    role?: string;
    restaurantId?: number;
    branchId?: number;
} 