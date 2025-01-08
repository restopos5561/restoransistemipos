import express from 'express';
import { PriceHistoryController } from '../controllers/price.history.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { PriceHistorySchema } from '../schemas/price.history.schema';

const router = express.Router();
const controller = new PriceHistoryController();

router.get('/', requireAuth, controller.getPriceHistory);
router.post(
  '/',
  requireAuth,
  validateRequest(PriceHistorySchema.create),
  controller.createPriceHistory
);
router.get('/:id', requireAuth, controller.getPriceHistoryById);
router.get('/product/:productId', requireAuth, controller.getPriceHistoryByProductId);

export { router as priceHistoryRouter };
