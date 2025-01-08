import express from 'express';
import { PurchaseOrderItemsController } from '../controllers/purchase.order.items.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { PurchaseOrderItemSchema } from '../schemas/purchase.order.item.schema';

const router = express.Router();
const controller = new PurchaseOrderItemsController();

// Spesifik route'lar üstte
router.get('/order/:purchaseOrderId', requireAuth, controller.getItemsByPurchaseOrderId);

// Genel route'lar altta
router.get('/', requireAuth, controller.getPurchaseOrderItems);
router.post(
  '/',
  requireAuth,
  validateRequest(PurchaseOrderItemSchema.create),
  controller.createPurchaseOrderItem
);
router.get('/:id', requireAuth, controller.getPurchaseOrderItemById);
router.put(
  '/:id',
  requireAuth,
  validateRequest(PurchaseOrderItemSchema.update),
  controller.updatePurchaseOrderItem
);
router.delete('/:id', requireAuth, controller.deletePurchaseOrderItem);

export { router as purchaseOrderItemsRouter };
