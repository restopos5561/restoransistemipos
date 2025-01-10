import { Request, Response, NextFunction } from 'express';
import { BarService } from '../services/bar.service';
import { OrderStatus } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const barService = new BarService();

export class BarController {
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        ...req.query,
        onlyBeverages: req.query.onlyBeverages === 'true',
        status: req.query.status
          ? ((req.query.status as string).split(',') as OrderStatus[])
          : undefined,
        priority: req.query.priority === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        branchId: req.query.branchId ? parseInt(req.query.branchId as string) : undefined,
      };

      const result = await barService.getOrders(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.id);

      // ID geçerlilik kontrolü
      if (isNaN(orderId)) {
        throw new BadRequestError('Geçersiz sipariş ID');
      }

      const { status } = req.body;
      const order = await barService.updateOrderStatus(orderId, status as OrderStatus);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await barService.getQueue();

      res.json({
        success: true,
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      
      if (!branchId) {
        throw new Error('Şube ID\'si gereklidir');
      }

      const stats = await barService.getStats(branchId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
