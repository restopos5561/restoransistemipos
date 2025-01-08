import { Request, Response } from 'express';
import { SuppliersService } from '../services/suppliers.service';
import { BadRequestError } from '../errors/bad-request-error';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SuppliersController {
  private suppliersService: SuppliersService;

  constructor() {
    this.suppliersService = new SuppliersService();
  }

  getSuppliers = async (req: Request, res: Response) => {
    try {
      const restaurantId = Number(req.query.restaurantId);
      const search = (req.query.search as string) || '';
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (isNaN(restaurantId)) {
        throw new BadRequestError('Geçersiz restaurant ID');
      }

      const skip = (page - 1) * limit;

      const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
          where: {
            restaurantId,
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { contactName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
          skip,
          take: limit,
          orderBy: {
            name: 'asc',
          },
        }),
        prisma.supplier.count({
          where: {
            restaurantId,
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { contactName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          suppliers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Tedarikçiler getirilemedi');
    }
  };

  getSupplierById = async (req: Request, res: Response) => {
    const result = await this.suppliersService.getSupplierById(Number(req.params.id));
    res.json({ success: true, data: result });
  };

  createSupplier = async (req: Request, res: Response) => {
    const result = await this.suppliersService.createSupplier(req.body);
    res.status(201).json({ success: true, data: result });
  };

  updateSupplier = async (req: Request, res: Response) => {
    const result = await this.suppliersService.updateSupplier(Number(req.params.id), req.body);
    res.json({ success: true, data: result });
  };

  deleteSupplier = async (req: Request, res: Response) => {
    await this.suppliersService.deleteSupplier(Number(req.params.id));
    res.status(204).send();
  };

  addProductToSupplier = async (req: Request, res: Response) => {
    const result = await this.suppliersService.addProductToSupplier(
      Number(req.params.id),
      req.body
    );
    res.status(201).json({ success: true, data: result });
  };

  getSupplierProducts = async (req: Request, res: Response) => {
    try {
      const supplierId = Number(req.params.id);

      if (isNaN(supplierId)) {
        throw new BadRequestError('Geçersiz tedarikçi ID');
      }

      const supplierWithProducts = await prisma.supplier.findUnique({
        where: { id: supplierId },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!supplierWithProducts) {
        throw new BadRequestError('Tedarikçi bulunamadı');
      }

      res.json({
        success: true,
        data: supplierWithProducts.products,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Tedarikçi ürünleri getirilemedi');
    }
  };

  getSuppliersByProduct = async (req: Request, res: Response) => {
    const result = await this.suppliersService.getSuppliersByProduct(Number(req.params.productId));
    res.json({ success: true, data: result });
  };
}
