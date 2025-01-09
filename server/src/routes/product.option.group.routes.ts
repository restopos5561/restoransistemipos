import { Router } from 'express';
import { ProductOptionGroupController } from '../controllers/product.option.group.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { OptionGroupSchema } from '../schemas/option.group.validation';

const router = Router();
const controller = new ProductOptionGroupController();

// GET /products/:productId/options/groups - Ürüne ait seçenek gruplarını listele
router.get('/products/:productId/options/groups', requireAuth, controller.getOptionGroupsByProductId);

// POST /products/:productId/options/groups - Yeni seçenek grubu oluştur
router.post('/products/:productId/options/groups', requireAuth, validateRequest(OptionGroupSchema.create), controller.createOptionGroup);

// GET /products/:productId/options/groups/:groupId - Tekil seçenek grubunu getir
router.get('/products/:productId/options/groups/:groupId', requireAuth, controller.getOptionGroupById);

// PUT /products/:productId/options/groups/:groupId - Seçenek grubunu güncelle
router.put('/products/:productId/options/groups/:groupId', requireAuth, validateRequest(OptionGroupSchema.update), controller.updateOptionGroup);

// DELETE /products/:productId/options/groups/:groupId - Seçenek grubunu sil
router.delete('/products/:productId/options/groups/:groupId', requireAuth, controller.deleteOptionGroup);

export { router as optionGroupRouter };
