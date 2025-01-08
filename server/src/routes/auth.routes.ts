import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthSchema } from '../schemas/auth.schema';

const router = Router();
const controller = new AuthController();

// Auth routes
router.post('/register', validateRequest(AuthSchema.register), controller.register);
router.post('/login', validateRequest(AuthSchema.login), controller.login);
router.post('/login/branch', validateRequest(AuthSchema.loginWithBranch), controller.loginWithBranch);
router.post('/forgot-password', validateRequest(AuthSchema.forgotPassword), controller.forgotPassword);
router.post('/reset-password', validateRequest(AuthSchema.resetPassword), controller.resetPassword);
router.post('/refresh', validateRequest(AuthSchema.refreshToken), controller.refreshToken);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.getCurrentUser);

export { router as authRouter };
