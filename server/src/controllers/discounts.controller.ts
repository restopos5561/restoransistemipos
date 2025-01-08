import { Request, Response } from 'express';
import { DiscountsService } from '../services/discounts.service';
import { BadRequestError } from '../errors/bad-request-error';
import { DiscountType } from '@prisma/client';

export class DiscountsController {
  private discountsService: DiscountsService;

  constructor() {
    this.discountsService = new DiscountsService();
  }

  getDiscounts = async (req: Request, res: Response) => {
    try {
      const filters = {
        orderId: req.query.orderId ? Number(req.query.orderId) : undefined,
        orderItemId: req.query.orderItemId ? Number(req.query.orderItemId) : undefined,
        discountType: req.query.discountType as DiscountType | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      if (filters.orderId && isNaN(filters.orderId)) {
        throw new BadRequestError('Geçersiz sipariş ID');
      }
      if (filters.orderItemId && isNaN(filters.orderItemId)) {
        throw new BadRequestError('Geçersiz sipariş kalemi ID');
      }
      if (filters.discountType && !Object.values(DiscountType).includes(filters.discountType)) {
        throw new BadRequestError('Geçersiz indirim tipi');
      }

      const result = await this.discountsService.getDiscounts(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('İndirimler getirilemedi');
    }
  };

  createDiscount = async (req: Request, res: Response) => {
    try {
      const discount = await this.discountsService.createDiscount(req.body);
      res.status(201).json({ success: true, data: discount });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('İndirim oluşturulamadı');
    }
  };

  getDiscountById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const discount = await this.discountsService.getDiscountById(id);
      res.json({ success: true, data: discount });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('İndirim bulunamadı');
    }
  };

  updateDiscount = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const discount = await this.discountsService.updateDiscount(id, req.body);
      res.json({ success: true, data: discount });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('İndirim güncellenemedi');
    }
  };

  deleteDiscount = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await this.discountsService.deleteDiscount(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('İndirim silinemedi');
    }
  };

  getDiscountsByOrder = async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.params.orderId);
      const discounts = await this.discountsService.getDiscountsByOrder(orderId);
      res.json({ success: true, data: discounts });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('Siparişe ait indirimler getirilemedi');
    }
  };
}
