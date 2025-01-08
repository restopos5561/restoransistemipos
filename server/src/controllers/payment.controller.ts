import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { BadRequestError } from '../errors/bad-request-error';
import { PaymentMethod } from '@prisma/client';

const paymentService = new PaymentService();

export class PaymentController {
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        restaurantId: req.query.restaurantId
          ? parseInt(req.query.restaurantId as string)
          : undefined,
        branchId: req.query.branchId ? parseInt(req.query.branchId as string) : undefined,
        orderId: req.query.orderId ? parseInt(req.query.orderId as string) : undefined,
        paymentMethod: req.query.paymentMethod as PaymentMethod,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await paymentService.getPayments(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        throw new BadRequestError('Geçersiz sipariş ID');
      }

      const payments = await paymentService.getPaymentsByOrderId(orderId);
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.params.date;
      if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new BadRequestError('Geçersiz tarih formatı. Doğru format: YYYY-MM-DD');
      }

      const payments = await paymentService.getPaymentsByDate(date);
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = parseInt(req.params.branchId);
      if (isNaN(branchId)) {
        throw new BadRequestError('Geçersiz şube ID');
      }

      const payments = await paymentService.getPaymentsByBranch(branchId);
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const method = req.params.method as any;
      const payments = await paymentService.getPaymentsByMethod(method);
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }
}
