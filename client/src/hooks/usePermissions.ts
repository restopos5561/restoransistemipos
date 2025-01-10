import { useAuth } from './useAuth';

export const usePermissions = () => {
    const { user } = useAuth();

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        return user.permissions?.includes(permission) || user.role === 'ADMIN';
    };

    const hasRole = (role: string): boolean => {
        if (!user) return false;
        return user.role === role;
    };

    return { hasPermission, hasRole };
}; 