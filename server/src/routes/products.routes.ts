import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { ProductSchema } from '../schemas/product.schema';

const router = Router();
const controller = new ProductsController();

// Ana CRUD rotaları
router.get('/', requireAuth, controller.getProducts);
router.get('/:id', requireAuth, controller.getProductById);
router.post('/', requireAuth, validateRequest(ProductSchema.create), controller.createProduct);
router.put('/:id', requireAuth, validateRequest(ProductSchema.update), controller.updateProduct);
router.delete('/:id', requireAuth, controller.deleteProduct);

// Varyant rotaları
router.get('/:id/variants', requireAuth, controller.getProductVariants);
router.post(
  '/:id/variants',
  requireAuth,
  validateRequest(ProductSchema.variant),
  controller.addProductVariant
);
router.put(
  '/:id/variants/:variantId',
  requireAuth,
  validateRequest(ProductSchema.variant),
  controller.updateProductVariant
);
router.delete('/:id/variants/:variantId', requireAuth, controller.deleteProductVariant);

// Seçenek rotaları
router.get('/:id/options', requireAuth, controller.getProductOptions);
router.post(
  '/:id/options/groups',
  requireAuth,
  validateRequest(ProductSchema.optionGroup),
  controller.addProductOptionGroup
);
router.post(
  '/:id/options',
  requireAuth,
  validateRequest(ProductSchema.option),
  controller.addProductOption
);
router.put(
  '/:id/options/:optionId',
  requireAuth,
  validateRequest(ProductSchema.option),
  controller.updateProductOption
);
router.delete('/:id/options/:optionId', requireAuth, controller.deleteProductOption);

// Fiyat geçmişi rotaları
router.post(
  '/:id/price',
  requireAuth,
  validateRequest(ProductSchema.price),
  controller.updateProductPrice
);
router.get('/:id/price-history', requireAuth, controller.getProductPriceHistory);

export { router as productsRouter };
