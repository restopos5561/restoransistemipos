import { Router } from 'express';
import { SuppliersController } from '../controllers/suppliers.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const suppliersController = new SuppliersController();

router.use(requireAuth);

// Genel route'lar
router.get('/', suppliersController.getSuppliers);
router.post('/', suppliersController.createSupplier);

// ID'ye bağlı route'lar
router.get('/:id', suppliersController.getSupplierById);
router.put('/:id', suppliersController.updateSupplier);
router.delete('/:id', suppliersController.deleteSupplier);

// İlişkili route'lar
router.get('/:id/products', suppliersController.getSupplierProducts);
router.post('/:id/products', suppliersController.addProductToSupplier);

export { router as suppliersRouter };
