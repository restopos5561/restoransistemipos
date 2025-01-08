import { Router } from 'express';
import { PrinterController } from '../controllers/printer.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const printerController = new PrinterController();

router.use(requireAuth); // Auth middleware kullanımı

router.get('/', printerController.getPrinters);
router.get('/:id', printerController.getPrinterById);
router.post('/', printerController.createPrinter);
router.put('/:id', printerController.updatePrinter);
router.delete('/:id', printerController.deletePrinter);
router.post('/:id/print', printerController.printTest);
router.get('/branch/:branchId', printerController.getPrintersByBranch);

export default router;
