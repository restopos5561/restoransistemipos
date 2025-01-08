import { Request, Response, NextFunction } from 'express';
import { ProductOptionGroupService } from '../services/product.option.group.service';
import { BadRequestError } from '../errors/bad-request-error';

const optionGroupService = new ProductOptionGroupService();

export class ProductOptionGroupController {
  // Tüm seçenek gruplarını listele
  async getOptionGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        restaurantId: req.query.restaurantId
          ? parseInt(req.query.restaurantId as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await optionGroupService.getOptionGroups(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Tekil seçenek grubu getir
  async getOptionGroupById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const optionGroup = await optionGroupService.getOptionGroupById(id);
      res.json({
        success: true,
        data: optionGroup,
      });
    } catch (error) {
      next(error);
    }
  }

  // Yeni seçenek grubu oluştur
  async createOptionGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const optionGroup = await optionGroupService.createOptionGroup(req.body);
      res.status(201).json({
        success: true,
        data: optionGroup,
      });
    } catch (error) {
      next(error);
    }
  }

  // Seçenek grubunu güncelle
  async updateOptionGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const optionGroup = await optionGroupService.updateOptionGroup(id, req.body);
      res.json({
        success: true,
        data: optionGroup,
      });
    } catch (error) {
      next(error);
    }
  }

  // Seçenek grubunu sil
  async deleteOptionGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      await optionGroupService.deleteOptionGroup(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Ürüne ait seçenek gruplarını getir
  async getOptionGroupsByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        throw new BadRequestError('Geçersiz ürün ID formatı');
      }

      const optionGroups = await optionGroupService.getOptionGroupsByProductId(productId);
      res.json({
        success: true,
        data: optionGroups,
      });
    } catch (error) {
      next(error);
    }
  }
}
