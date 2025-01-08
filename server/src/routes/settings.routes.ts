import express from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { SettingsSchema } from '../schemas/settings.schema';

const router = express.Router();
const controller = new SettingsController();

// Spesifik route'lar üstte
router.get('/restaurant/:restaurantId', requireAuth, controller.getSettingsByRestaurantId);

// Genel route'lar altta
router.get('/', requireAuth, controller.getSettings);
router.post('/', requireAuth, validateRequest(SettingsSchema.create), controller.createSettings);
router.get('/:id', requireAuth, controller.getSettingsById);
router.put('/:id', requireAuth, validateRequest(SettingsSchema.update), controller.updateSettings);
router.delete('/:id', requireAuth, controller.deleteSettings);

export { router as settingsRouter };
