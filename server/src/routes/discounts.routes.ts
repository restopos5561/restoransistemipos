import { Router } from 'express';
import { DiscountsController } from '../controllers/discounts.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { DiscountSchema } from '../schemas/discount.schema';

const router = Router();
const controller = new DiscountsController();

router.use(requireAuth);

// Ana CRUD rotaları
router.get('/', controller.getDiscounts);
router.post('/', validateRequest(DiscountSchema.create), controller.createDiscount);
router.get('/:id', controller.getDiscountById);
router.put('/:id', validateRequest(DiscountSchema.update), controller.updateDiscount);
router.delete('/:id', controller.deleteDiscount);

// Özel rotalar
router.get('/order/:orderId', controller.getDiscountsByOrder);

export { router as discountsRouter };
