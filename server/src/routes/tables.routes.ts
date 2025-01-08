import { Router } from 'express';
import { TablesController } from '../controllers/tables.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { TableSchema } from '../schemas/table.schema';

const router = Router();
const controller = new TablesController();

// Ana CRUD rotaları
router.get('/', requireAuth, controller.getTables);
router.get('/:id', requireAuth, controller.getTableById);
router.post('/', requireAuth, validateRequest(TableSchema.create), controller.createTable);
router.put('/:id', requireAuth, validateRequest(TableSchema.update), controller.updateTable);
router.delete('/:id', requireAuth, controller.deleteTable);

// Özel operasyon rotaları
router.patch(
  '/:id/status',
  requireAuth,
  validateRequest(TableSchema.updateStatus),
  controller.updateTableStatus
);

router.post('/merge', requireAuth, validateRequest(TableSchema.merge), controller.mergeTables);

router.post(
  '/transfer',
  requireAuth,
  validateRequest(TableSchema.transfer),
  controller.transferTable
);

// Şube ve konum bazlı sorgulama rotaları
router.get('/branch/:branchId', requireAuth, controller.getTables);
router.get('/location/:location', requireAuth, controller.getTables);

export { router as tablesRouter };
