import { Router } from 'express';
import { OrderItemController } from '../controllers/order.item.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { OrderItemSchema } from '../schemas/order.item.schema';

const router = Router();
const controller = new OrderItemController();

// GET /order-items - Tüm sipariş kalemlerini listele
router.get('/', requireAuth, controller.getOrderItems);

// GET /order-items/:id - Tekil sipariş kalemi getir
router.get('/:id', requireAuth, controller.getOrderItemById);

// POST /order-items - Yeni sipariş kalemi oluştur
router.post('/', requireAuth, validateRequest(OrderItemSchema.create), controller.createOrderItem);

// PUT /order-items/:id - Sipariş kalemi güncelle
router.put(
  '/:id',
  requireAuth,
  validateRequest(OrderItemSchema.update),
  controller.updateOrderItem
);

// PATCH /order-items/:id/status - Sipariş kalemi durumunu güncelle
router.patch(
  '/:id/status',
  requireAuth,
  validateRequest(OrderItemSchema.updateStatus),
  controller.updateOrderItemStatus
);

// PATCH /order-items/:id/void - Sipariş kalemini iptal et
router.patch(
  '/:id/void',
  requireAuth,
  validateRequest(OrderItemSchema.void),
  controller.voidOrderItem
);

// DELETE /order-items/:id - Sipariş kalemi sil
router.delete('/:id', requireAuth, controller.deleteOrderItem);

// GET /order-items/order/:orderId - Siparişe ait kalemleri getir
router.get('/order/:orderId', requireAuth, controller.getOrderItemsByOrderId);

// GET /order-items/product/:productId - Ürüne ait kalemleri getir
router.get('/product/:productId', requireAuth, controller.getOrderItemsByProductId);

export { router as orderItemRouter };
