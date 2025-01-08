import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { validateRequest } from '../middleware/validate-request';
import { StockSchema } from '../schemas/stock.schema';

const router = Router();
const stockController = new StockController();

// Özel endpoint'ler önce
router.get(
  '/movements',
  validateRequest(StockSchema.getMovements),
  stockController.getStockMovements
);
router.get('/expiring', validateRequest(StockSchema.getExpiring), stockController.getExpiringStock);
router.get('/low', validateRequest(StockSchema.getLowStock), stockController.getLowStock);
router.post('/transfer', validateRequest(StockSchema.transferStock), stockController.transferStock);
router.post('/count', validateRequest(StockSchema.stockCount), stockController.createStockCount);

// Ana endpoint'ler sonra
router.get('/', validateRequest(StockSchema.getStocks), stockController.getStocks);
router.get('/:id', validateRequest(StockSchema.getStockById), stockController.getStockById);
router.get(
  '/:id/history',
  validateRequest(StockSchema.getStockHistory),
  stockController.getStockHistory
);
router.patch(
  '/:id/quantity',
  validateRequest(StockSchema.updateQuantity),
  stockController.updateStockQuantity
);

export { router as stockRouter };
