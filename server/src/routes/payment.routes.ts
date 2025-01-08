import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

// GET /payments - Tüm ödemeleri listele
router.get('/', controller.getPayments);

// POST /payments - Yeni ödeme oluştur
router.post('/', controller.createPayment);

// GET /payments/order/:orderId - Siparişe göre ödemeleri getir
router.get('/order/:orderId', controller.getPaymentsByOrderId);

// GET /payments/date/:date - Tarihe göre ödemeleri getir
router.get('/date/:date', controller.getPaymentsByDate);

// GET /payments/branch/:branchId - Şubeye göre ödemeleri getir
router.get('/branch/:branchId', controller.getPaymentsByBranch);

// GET /payments/method/:method - Ödeme yöntemine göre ödemeleri getir
router.get('/method/:method', controller.getPaymentsByMethod);

export default router;
