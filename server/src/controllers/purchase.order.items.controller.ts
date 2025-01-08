import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderItemsService } from '../services/purchase.order.items.service';
import { BadRequestError } from '../errors/bad-request-error';

const purchaseOrderItemsService = new PurchaseOrderItemsService();

export class PurchaseOrderItemsController {
  async getPurchaseOrderItems(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        purchaseOrderId: req.query.purchaseOrderId
          ? parseInt(req.query.purchaseOrderId as string)
          : undefined,
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await purchaseOrderItemsService.getPurchaseOrderItems(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseOrderItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const item = await purchaseOrderItemsService.getPurchaseOrderItemById(id);
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPurchaseOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await purchaseOrderItemsService.createPurchaseOrderItem(req.body);
      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePurchaseOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const item = await purchaseOrderItemsService.updatePurchaseOrderItem(id, req.body);
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePurchaseOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      await purchaseOrderItemsService.deletePurchaseOrderItem(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getItemsByPurchaseOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const purchaseOrderId = parseInt(req.params.purchaseOrderId);
      if (isNaN(purchaseOrderId)) {
        throw new BadRequestError('Geçersiz sipariş ID formatı');
      }

      const items = await purchaseOrderItemsService.getItemsByPurchaseOrderId(purchaseOrderId);
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
}
