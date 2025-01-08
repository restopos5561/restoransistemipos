import { Router } from 'express';
import { PurchaseOrdersController } from '../controllers/purchase.orders.controller';
import { validateRequest } from '../middleware/validate-request';
import { PurchaseOrderSchema } from '../schemas/purchase.order.schema';

const router = Router();
const controller = new PurchaseOrdersController();

// Ana route'lar
router.get(
  '/',
  validateRequest(PurchaseOrderSchema.getPurchaseOrders),
  controller.getPurchaseOrders
);
router.post(
  '/',
  validateRequest(PurchaseOrderSchema.createPurchaseOrder),
  controller.createPurchaseOrder
);

// Özel route'lar (spesifik route'lar önce gelmeli)
router.get(
  '/supplier/:supplierId',
  validateRequest(PurchaseOrderSchema.getBySupplierId),
  controller.getPurchaseOrdersBySupplierId
);
router.get(
  '/status/:status',
  validateRequest(PurchaseOrderSchema.getByStatus),
  controller.getPurchaseOrdersByStatus
);
router.get(
  '/date-range',
  validateRequest(PurchaseOrderSchema.getByDateRange),
  controller.getPurchaseOrdersByDateRange
);

// Genel ID route'ları en sona
router.get('/:id', validateRequest(PurchaseOrderSchema.getById), controller.getPurchaseOrderById);
router.put('/:id', validateRequest(PurchaseOrderSchema.update), controller.updatePurchaseOrder);
router.patch(
  '/:id/status',
  validateRequest(PurchaseOrderSchema.updateStatus),
  controller.updateOrderStatus
);
router.delete('/:id', controller.deletePurchaseOrder);

export { router as purchaseOrdersRouter };
