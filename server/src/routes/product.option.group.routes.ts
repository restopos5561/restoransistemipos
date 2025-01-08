import { Router } from 'express';
import { ProductOptionGroupController } from '../controllers/product.option.group.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { OptionGroupSchema } from '../schemas/option.group.schema';

const router = Router();
const controller = new ProductOptionGroupController();

// GET /option-groups - Tüm seçenek gruplarını listele
router.get('/', requireAuth, controller.getOptionGroups);

// Özel route'ları öne al
router.get('/product/:productId', requireAuth, controller.getOptionGroupsByProductId);

// POST /option-groups - Yeni seçenek grubu oluştur
router.post(
  '/',
  requireAuth,
  validateRequest(OptionGroupSchema.create),
  controller.createOptionGroup
);

// Dinamik parametreli route'lar
router.get('/:id', requireAuth, controller.getOptionGroupById);

router.put(
  '/:id',
  requireAuth,
  validateRequest(OptionGroupSchema.update),
  controller.updateOptionGroup
);

router.delete('/:id', requireAuth, controller.deleteOptionGroup);

export { router as optionGroupRouter };
