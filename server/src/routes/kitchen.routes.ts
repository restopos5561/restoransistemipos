import { Router } from 'express';
import { KitchenController } from '../controllers/kitchen.controller';
import { requireAuth, requireChefAccess } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { OrderStatusSchema } from '../schemas/order.schema';

const router = Router();
const kitchenController = new KitchenController();

router.use(requireAuth);
router.use(requireChefAccess);

router.get('/orders', (req, res, next) => {
  kitchenController.getOrders(req, res, next);
});

router.patch(
  '/orders/:id/status',
  requireAuth,
  validateRequest(OrderStatusSchema.update),
  kitchenController.updateOrderStatus.bind(kitchenController)
);

router.get('/queue', (req, res, next) => {
  kitchenController.getQueue(req, res, next);
});

router.get('/stats', (req, res, next) => {
  kitchenController.getStats(req, res, next);
});

export { router as kitchenRoutes };
