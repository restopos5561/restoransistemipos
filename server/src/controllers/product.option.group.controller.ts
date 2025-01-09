import { Request, Response, NextFunction } from 'express';
import { ProductOptionGroupService } from '../services/product.option.group.service';
import { BadRequestError } from '../errors/bad-request-error';
import { PrismaClient } from '@prisma/client';

const optionGroupService = new ProductOptionGroupService();
const prisma = new PrismaClient();

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
      const groupId = parseInt(req.params.groupId);
      const productId = parseInt(req.params.productId);

      if (isNaN(groupId) || isNaN(productId)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const optionGroup = await optionGroupService.getOptionGroupById(groupId);
      
      // Grup bu ürüne ait mi kontrol et
      if (optionGroup.productId !== productId) {
        throw new BadRequestError('Seçenek grubu bu ürüne ait değil');
      }

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
      const groupId = parseInt(req.params.groupId);
      const productId = parseInt(req.params.productId);

      if (isNaN(groupId) || isNaN(productId)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      // Önce bu grubun belirtilen ürüne ait olduğunu kontrol et
      const existingGroup = await prisma.productOptionGroup.findFirst({
        where: {
          id: groupId,
          productId
        }
      });

      if (!existingGroup) {
        throw new BadRequestError('Seçenek grubu bulunamadı veya bu ürüne ait değil');
      }

      const optionGroup = await optionGroupService.updateOptionGroup(groupId, req.body);
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
      const groupId = parseInt(req.params.groupId);
      const productId = parseInt(req.params.productId);

      if (isNaN(groupId) || isNaN(productId)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      // Önce bu grubun belirtilen ürüne ait olduğunu kontrol et
      const optionGroup = await prisma.productOptionGroup.findFirst({
        where: {
          id: groupId,
          productId
        }
      });

      if (!optionGroup) {
        throw new BadRequestError('Seçenek grubu bulunamadı veya bu ürüne ait değil');
      }

      await optionGroupService.deleteOptionGroup(groupId);
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
        data: optionGroups
      });
    } catch (error) {
      next(error);
    }
  }
}
