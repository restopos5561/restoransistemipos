import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { OrderSchema } from '../schemas/order.schema';

const router = Router();
const controller = new OrdersController();

// Ana CRUD rotaları
router.get('/', requireAuth, controller.getOrders);
router.get('/:id', requireAuth, controller.getOrderById);
router.post('/', requireAuth, validateRequest(OrderSchema.create), controller.createOrder);
router.put('/:id', requireAuth, validateRequest(OrderSchema.update), controller.updateOrder);
router.delete('/:id', requireAuth, controller.deleteOrder);

// Özel operasyon rotaları
router.patch('/:id/status', requireAuth, validateRequest(OrderSchema.updateStatus), controller.updateOrderStatus);
router.post('/:id/cancel', requireAuth, controller.cancelOrder);
router.patch('/:id/notes', requireAuth, validateRequest(OrderSchema.updateNotes), controller.updateOrderNotes);

// Sipariş kalemleri rotaları
router.post('/:id/items', requireAuth, validateRequest(OrderSchema.addItems), controller.addOrderItems);

// Toplu işlem rotaları
router.post('/bulk-delete', requireAuth, validateRequest(OrderSchema.bulkDelete), controller.bulkDeleteOrders);
router.post('/bulk-status', requireAuth, validateRequest(OrderSchema.bulkUpdateStatus), controller.bulkUpdateOrderStatus);
router.post('/print', requireAuth, validateRequest(OrderSchema.print), controller.getOrdersForPrinting);

// Filtreleme rotaları
router.get('/table/:tableId', requireAuth, controller.getOrdersByTable);
router.get('/waiter/:waiterId', requireAuth, controller.getOrdersByWaiter);
router.get('/customer/:customerId', requireAuth, controller.getOrdersByCustomer);
router.get('/branch/:branchId', requireAuth, controller.getOrdersByBranch);
router.get('/status/:status', requireAuth, controller.getOrdersByStatus);
router.get('/date-range', requireAuth, controller.getOrdersByDateRange);

export { router as ordersRouter };
