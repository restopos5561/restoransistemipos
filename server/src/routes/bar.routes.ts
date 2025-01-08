import { Router } from 'express';
import { BarController } from '../controllers/bar.controller';
import { requireAuth, requireBarAccess } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { OrderStatusSchema } from '../schemas/order.schema';

const router = Router();
const barController = new BarController();

router.use(requireAuth);
router.use(requireBarAccess);

router.get('/orders', (req, res, next) => {
  barController.getOrders(req, res, next);
});

router.patch('/orders/:id/status', validateRequest(OrderStatusSchema.update), (req, res, next) => {
  barController.updateOrderStatus(req, res, next);
});

router.get('/queue', (req, res, next) => {
  barController.getQueue(req, res, next);
});

export { router as barRoutes };
