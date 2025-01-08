import express from 'express';
import { ProductSupplierController } from '../controllers/product.supplier.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { ProductSupplierSchema } from '../schemas/product.supplier.schema';

const router = express.Router();
const controller = new ProductSupplierController();

// Spesifik route'lar üstte
router.get('/product/:productId', requireAuth, controller.getSuppliersByProductId);
router.get('/supplier/:supplierId', requireAuth, controller.getProductsBySupplier);

// Genel route'lar altta
router.get('/', requireAuth, controller.getProductSuppliers);
router.post(
  '/',
  requireAuth,
  validateRequest(ProductSupplierSchema.create),
  controller.createProductSupplier
);

// Composite key route'ları
router.get('/:productId/:supplierId', requireAuth, controller.getProductSupplierByIds);
router.put(
  '/:productId/:supplierId',
  requireAuth,
  validateRequest(ProductSupplierSchema.update),
  controller.updateProductSupplier
);
router.delete('/:productId/:supplierId', requireAuth, controller.deleteProductSupplier);

export { router as productSupplierRouter };
