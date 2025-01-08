import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service';
import { Role } from '@prisma/client';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  async getDailySalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, branchId } = req.query;
      const report = await this.reportsService.getDailySalesReport(
        date ? new Date(date as string) : new Date(),
        branchId ? parseInt(branchId as string) : undefined
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year, branchId } = req.query;
      const report = await this.reportsService.getMonthlySalesReport(
        parseInt(month as string),
        parseInt(year as string),
        branchId ? parseInt(branchId as string) : undefined
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getYearlySalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, branchId } = req.query;
      const report = await this.reportsService.getYearlySalesReport(
        parseInt(year as string),
        branchId ? parseInt(branchId as string) : undefined
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getProductSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, productId, categoryId, branchId } = req.query;

      const report = await this.reportsService.getProductSalesReport(
        new Date(startDate as string),
        new Date(endDate as string),
        {
          productId: productId ? parseInt(productId as string) : undefined,
          categoryId: categoryId ? parseInt(categoryId as string) : undefined,
          branchId: branchId ? parseInt(branchId as string) : undefined,
        }
      );

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getStaffPerformanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, branchId, role } = req.query;

      const report = await this.reportsService.getStaffPerformanceReport(
        new Date(startDate as string),
        new Date(endDate as string),
        {
          branchId: branchId ? parseInt(branchId as string) : undefined,
          role: role ? (role as Role) : undefined,
        }
      );

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getTableReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, branchId, tableId } = req.query;

      const report = await this.reportsService.getTableReport(
        new Date(startDate as string),
        new Date(endDate as string),
        {
          branchId: branchId ? parseInt(branchId as string) : undefined,
          tableId: tableId ? parseInt(tableId as string) : undefined,
        }
      );

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  // Diğer rapor metodları buraya eklenecek...
}
