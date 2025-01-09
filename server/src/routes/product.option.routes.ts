import { Router } from 'express';
import { ProductOptionController } from '../controllers/product.option.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { OptionSchema } from '../schemas/option.validation';

const router = Router();
const controller = new ProductOptionController();

// GET /options - Tüm seçenekleri listele
router.get('/', requireAuth, controller.getOptions);

// Özel route'ları öne al
router.get('/group/:groupId', requireAuth, controller.getOptionsByGroupId);

// POST /options - Yeni seçenek oluştur
router.post('/', requireAuth, validateRequest(OptionSchema.create), controller.createOption);

// Dinamik parametreli route'lar
router.get('/:id', requireAuth, controller.getOptionById);

router.put('/:id', requireAuth, validateRequest(OptionSchema.update), controller.updateOption);

router.delete('/:id', requireAuth, controller.deleteOption);

export { router as optionRouter };
