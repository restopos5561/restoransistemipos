import { Request, Response, NextFunction } from 'express';
import { ProductOptionService } from '../services/product.option.service';
import { BadRequestError } from '../errors/bad-request-error';

const optionService = new ProductOptionService();

export class ProductOptionController {
  // Tüm seçenekleri listele
  async getOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        optionGroupId: req.query.optionGroupId
          ? parseInt(req.query.optionGroupId as string)
          : undefined,
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await optionService.getOptions(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Tekil seçenek getir
  async getOptionById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const option = await optionService.getOptionById(id);
      res.json({
        success: true,
        data: option,
      });
    } catch (error) {
      next(error);
    }
  }

  // Yeni seçenek oluştur
  async createOption(req: Request, res: Response, next: NextFunction) {
    try {
      const option = await optionService.createOption(req.body);
      res.status(201).json({
        success: true,
        data: option,
      });
    } catch (error) {
      next(error);
    }
  }

  // Seçenek güncelle
  async updateOption(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const option = await optionService.updateOption(id, req.body);
      res.json({
        success: true,
        data: option,
      });
    } catch (error) {
      next(error);
    }
  }

  // Seçenek sil
  async deleteOption(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      await optionService.deleteOption(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Gruba ait seçenekleri getir
  async getOptionsByGroupId(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.groupId);
      if (isNaN(groupId)) {
        throw new BadRequestError('Geçersiz grup ID formatı');
      }

      const options = await optionService.getOptionsByGroupId(groupId);
      res.json({
        success: true,
        data: options,
      });
    } catch (error) {
      next(error);
    }
  }
}
