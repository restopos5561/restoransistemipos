import { Request, Response, NextFunction } from 'express';
import { KitchenService } from '../services/kitchen.service';
import { OrderStatus } from '@prisma/client';

const kitchenService = new KitchenService();

export class KitchenController {
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        ...req.query,
        onlyFood: req.query.onlyFood === 'true',
        status: req.query.status
          ? ((req.query.status as string).split(',') as OrderStatus[])
          : undefined,
        priority: req.query.priority === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        branchId: req.query.branchId ? parseInt(req.query.branchId as string) : undefined,
      };

      const result = await kitchenService.getOrders(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await kitchenService.updateOrderStatus(parseInt(id), status as OrderStatus);

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
      const queue = await kitchenService.getQueue();

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
      const stats = await kitchenService.getStats(branchId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
