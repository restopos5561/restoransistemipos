import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { UserSchema } from '../schemas/user.schema';

const router = Router();
const controller = new UsersController();

// BATCH ROUTES - ÖNEMLİ: En üstte olmalı!
router.post(
  '/batch',
  requireAuth,
  validateRequest(UserSchema.batchCreate),
  controller.batchCreateUsers
);
router.put(
  '/batch',
  requireAuth,
  validateRequest(UserSchema.batchUpdate),
  controller.batchUpdateUsers
);
router.delete(
  '/batch',
  requireAuth,
  validateRequest(UserSchema.batchDelete),
  controller.batchDeleteUsers
);

// NORMAL ROUTES
router.get('/', requireAuth, controller.getUsers);
router.get('/:id', requireAuth, controller.getUserById);
router.post('/', requireAuth, validateRequest(UserSchema.create), controller.createUser);
router.put('/:id', requireAuth, validateRequest(UserSchema.update), controller.updateUser);
router.delete('/:id', requireAuth, controller.deleteUser);
router.put(
  '/:id/permissions',
  requireAuth,
  validateRequest(UserSchema.updatePermissions),
  controller.updateUserPermissions
);
router.post(
  '/branch-assignment',
  requireAuth,
  validateRequest(UserSchema.branchAssignment),
  controller.addUserToBranch
);

export { router as usersRouter };
