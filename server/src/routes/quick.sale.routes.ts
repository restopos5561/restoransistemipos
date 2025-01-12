import express from 'express';
import { quickSaleHandlers } from '../controllers/quick.sale.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Tüm route'lar için authentication gerekli
router.use(requireAuth);

// Hızlı satış işlemleri
router.post('/process', quickSaleHandlers.processQuickSale);

// Ürün arama ve listeleme
router.get('/products/search', quickSaleHandlers.searchProducts);
router.get('/products/popular', quickSaleHandlers.getPopularProducts);
router.get('/products/barcode/:barcode', quickSaleHandlers.validateBarcode);

export { router as quickSaleRouter }; 