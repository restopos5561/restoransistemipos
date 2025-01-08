import { Router } from 'express';
import { CardPaymentsController } from '../controllers/card.payments.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { CardPaymentSchema } from '../schemas/card.payment.schema';

const router = Router();
const controller = new CardPaymentsController();

router.use(requireAuth);

// Ana rotalar
router.get('/', controller.getCardPayments);
router.post('/', validateRequest(CardPaymentSchema.create), controller.createCardPayment);
router.get('/:id', controller.getCardPaymentById);

// Özel rotalar
router.get('/payment/:paymentId', controller.getCardPaymentByPaymentId);

export { router as cardPaymentsRouter };
