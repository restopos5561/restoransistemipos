import { Router } from 'express';
import { PermissionsController } from '../controllers/permissions.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { hasPermission } from '../middleware/has-permission.middleware';
import { validateRequest } from '../middleware/validate-request';
import { PermissionSchema } from '../schemas/permission.schema';

const router = Router();
const controller = new PermissionsController();

// İzin routes
router.get(
  '/permissions',
  requireAuth,
  hasPermission('VIEW_PERMISSIONS'),
  controller.getAllPermissions
);

router.get('/permissions/:id', requireAuth, controller.getPermissionById);

router.post(
  '/permissions',
  requireAuth,
  hasPermission('MANAGE_PERMISSIONS'),
  validateRequest(PermissionSchema.create),
  controller.createPermission
);

router.put('/permissions/:id', requireAuth, controller.updatePermission);
router.delete('/permissions/:id', requireAuth, controller.deletePermission);

// Kullanıcı izinleri routes
router.get('/user-permissions/:userId', requireAuth, controller.getUserPermissions);
router.post('/user-permissions/:userId', requireAuth, controller.updateUserPermissions);
router.put('/user-permissions/:userId', requireAuth, controller.updateUserPermissions);
router.delete(
  '/user-permissions/:userId/permission/:permissionId',
  requireAuth,
  controller.deleteUserPermission
);

export default router;
