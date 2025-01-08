import { Request, Response, NextFunction } from 'express';
import { ProductSupplierService } from '../services/product.supplier.service';
import { BadRequestError } from '../errors/bad-request-error';

const productSupplierService = new ProductSupplierService();

export class ProductSupplierController {
  async getProductSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        supplierId: req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined,
        isPrimary: req.query.isPrimary ? req.query.isPrimary === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await productSupplierService.getProductSuppliers(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProductSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const relation = await productSupplierService.createProductSupplier(req.body);
      res.status(201).json({
        success: true,
        data: relation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductSupplierByIds(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const supplierId = parseInt(req.params.supplierId);

      if (isNaN(productId) || isNaN(supplierId)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const relation = await productSupplierService.getProductSupplierByIds(productId, supplierId);
      res.json({
        success: true,
        data: relation,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProductSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const supplierId = parseInt(req.params.supplierId);

      if (isNaN(productId) || isNaN(supplierId)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const relation = await productSupplierService.updateProductSupplier(
        productId,
        supplierId,
        req.body
      );
      res.json({
        success: true,
        data: relation,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProductSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const supplierId = parseInt(req.params.supplierId);

      if (isNaN(productId) || isNaN(supplierId)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      await productSupplierService.deleteProductSupplier(productId, supplierId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getSuppliersByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        throw new BadRequestError('Geçersiz ürün ID formatı');
      }

      const suppliers = await productSupplierService.getSuppliersByProductId(productId);
      res.json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductsBySupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const supplierId = parseInt(req.params.supplierId);
      if (isNaN(supplierId)) {
        throw new BadRequestError('Geçersiz tedarikçi ID formatı');
      }

      const products = await productSupplierService.getProductsBySupplier(supplierId);
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }
}
