import { useAuth } from './useAuth';

export const usePermissions = () => {
    const { profile } = useAuth();

    const hasPermission = (permission: string): boolean => {
        if (!profile) return false;
        return profile.permissions?.includes(permission) || profile.role === 'ADMIN';
    };

    const hasRole = (role: string): boolean => {
        if (!profile) return false;
        return profile.role === role;
    };

    return { hasPermission, hasRole };
}; 