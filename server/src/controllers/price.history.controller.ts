import { Request, Response, NextFunction } from 'express';
import { PriceHistoryService } from '../services/price.history.service';
import { BadRequestError } from '../errors/bad-request-error';

const priceHistoryService = new PriceHistoryService();

export class PriceHistoryController {
  async getPriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await priceHistoryService.getPriceHistory(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPriceHistoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const history = await priceHistoryService.getPriceHistoryById(id);
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await priceHistoryService.createPriceHistory(req.body);
      res.status(201).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPriceHistoryByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        throw new BadRequestError('Geçersiz ürün ID formatı');
      }

      const history = await priceHistoryService.getPriceHistoryByProductId(productId);
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}
