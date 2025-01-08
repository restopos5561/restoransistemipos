import { Request, Response, NextFunction } from 'express';
import { OrderItemService } from '../services/order.item.service';
import { BadRequestError } from '../errors/bad-request-error';

const orderItemService = new OrderItemService();

export class OrderItemController {
  async getOrderItems(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        orderId: req.query.orderId ? parseInt(req.query.orderId as string) : undefined,
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        type: req.query.type as any,
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await orderItemService.getOrderItems(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const orderItem = await orderItemService.getOrderItemById(id);
      res.json({
        success: true,
        data: orderItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const orderItem = await orderItemService.createOrderItem(req.body);
      res.status(201).json({
        success: true,
        data: orderItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const orderItem = await orderItemService.updateOrderItem(id, req.body);
      res.json({
        success: true,
        data: orderItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const { status } = req.body;
      const orderItem = await orderItemService.updateOrderItemStatus(id, status);
      res.json({
        success: true,
        data: orderItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async voidOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const orderItem = await orderItemService.voidOrderItem(id);
      res.json({
        success: true,
        data: orderItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrderItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      await orderItemService.deleteOrderItem(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getOrderItemsByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        throw new BadRequestError('Geçersiz sipariş ID formatı');
      }

      const orderItems = await orderItemService.getOrderItemsByOrderId(orderId);
      res.json({
        success: true,
        data: orderItems,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderItemsByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        throw new BadRequestError('Geçersiz ürün ID formatı');
      }

      const orderItems = await orderItemService.getOrderItemsByProductId(productId);
      res.json({
        success: true,
        data: orderItems,
      });
    } catch (error) {
      next(error);
    }
  }
}
