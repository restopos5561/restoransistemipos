import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { ReportSchema } from '../schemas/report.schema';

const router = Router();
const controller = new ReportsController();

// Günlük satış raporu
router.get(
  '/sales/daily',
  requireAuth,
  validateRequest(ReportSchema.dailySales),
  controller.getDailySalesReport.bind(controller)
);

// Aylık satış raporu
router.get(
  '/sales/monthly',
  requireAuth,
  validateRequest(ReportSchema.monthlySales),
  controller.getMonthlySalesReport.bind(controller)
);

// Yıllık satış raporu
router.get(
  '/sales/yearly',
  requireAuth,
  validateRequest(ReportSchema.yearlySales),
  controller.getYearlySalesReport.bind(controller)
);

// Ürün bazlı satış raporu
router.get(
  '/sales/products',
  requireAuth,
  validateRequest(ReportSchema.productSales),
  controller.getProductSalesReport.bind(controller)
);

// Personel performans raporu
router.get(
  '/staff/performance',
  requireAuth,
  validateRequest(ReportSchema.staffReport),
  controller.getStaffPerformanceReport.bind(controller)
);

// Masa bazlı rapor
router.get(
  '/tables',
  requireAuth,
  validateRequest(ReportSchema.tableReport),
  controller.getTableReport.bind(controller)
);

// Diğer rapor route'ları buraya eklenecek...

export { router as reportsRouter };
