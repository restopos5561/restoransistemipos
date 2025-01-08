import { Request, Response, NextFunction } from 'express';
import { UserPermissionsService } from '../services/user-permissions.service';

const userPermissionsService = new UserPermissionsService();

export const hasPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Checking permission:', requiredPermission);
      console.log('User from request:', req.user);

      const userId = req.user?.userId;

      if (!userId) {
        console.log('No userId found in token');
        return res.status(401).json({
          success: false,
          error: 'Oturum açmanız gerekiyor',
        });
      }

      console.log('Fetching permissions for userId:', userId);
      const permissions = await userPermissionsService.getUserPermissions(userId);
      console.log('User permissions:', permissions);

      const hasRequiredPermission = permissions.some(
        (p) => p.name === requiredPermission && p.allowed
      );

      console.log('Has required permission:', hasRequiredPermission);

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          error: 'Bu işlem için yetkiniz yok',
        });
      }

      next();
    } catch (error: any) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Yetkilendirme hatası',
      });
    }
  };
};
