import { Request, Response } from 'express';
import { ProductsService } from '../services/products.service';
import { BadRequestError } from '../errors/bad-request-error';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductsController {
  private productsService: ProductsService;

  constructor() {
    this.productsService = new ProductsService();
  }

  getProducts = async (req: Request, res: Response) => {
    try {
      const restaurantId = Number(req.query.restaurantId);
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 10);

      if (!req.query.restaurantId || isNaN(restaurantId)) {
        throw new BadRequestError('Restaurant ID zorunludur ve geçerli bir sayı olmalıdır');
      }

      const skip = (page - 1) * limit;

      const searchCondition = search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {};

      const whereClause: Prisma.ProductWhereInput = {
        restaurantId,
        ...(categoryId && { categoryId }),
        ...searchCondition,
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            stocks: true,
            recipe: {
              include: {
                ingredients: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            name: 'asc',
          },
        }),
        prisma.product.count({
          where: whereClause,
        }),
      ]);

      res.json({
        success: true,
        data: {
          products,
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
      throw new BadRequestError(error instanceof Error ? error.message : 'Ürünler getirilemedi');
    }
  };

  getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productsService.getProductById(Number(id));

    res.status(200).json({
      success: true,
      data: product,
    });
  };

  createProduct = async (req: Request, res: Response) => {
    const product = await this.productsService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  };

  updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productsService.updateProduct(Number(id), req.body);

    res.status(200).json({
      success: true,
      data: product,
    });
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productsService.deleteProduct(Number(id));
    res.status(204).send();
  };

  getProductVariants = async (req: Request, res: Response) => {
    const { id } = req.params;
    const variants = await this.productsService.getProductVariants(Number(id));
    res.json(variants);
  };

  addProductVariant = async (req: Request, res: Response) => {
    const { id } = req.params;
    const variant = await this.productsService.addProductVariant(Number(id), req.body);
    res.status(201).json(variant);
  };

  updateProductVariant = async (req: Request, res: Response) => {
    const { id, variantId } = req.params;
    const variant = await this.productsService.updateProductVariant(
      Number(id),
      Number(variantId),
      req.body
    );
    res.json(variant);
  };

  deleteProductVariant = async (req: Request, res: Response) => {
    const { id, variantId } = req.params;
    await this.productsService.deleteProductVariant(Number(id), Number(variantId));
    res.status(204).send();
  };

  getProductOptions = async (req: Request, res: Response) => {
    const { id } = req.params;
    const options = await this.productsService.getProductOptions(Number(id));
    res.json(options);
  };

  addProductOptionGroup = async (req: Request, res: Response) => {
    const { id } = req.params;
    const optionGroup = await this.productsService.addProductOptionGroup(Number(id), req.body);
    res.status(201).json(optionGroup);
  };

  addProductOption = async (req: Request, res: Response) => {
    const { id } = req.params;
    const option = await this.productsService.addProductOption(Number(id), req.body);
    res.status(201).json(option);
  };

  updateProductOption = async (req: Request, res: Response) => {
    const { id, optionId } = req.params;
    const option = await this.productsService.updateProductOption(
      Number(id),
      Number(optionId),
      req.body
    );
    res.json(option);
  };

  deleteProductOption = async (req: Request, res: Response) => {
    const { id, optionId } = req.params;
    await this.productsService.deleteProductOption(Number(id), Number(optionId));
    res.status(204).send();
  };

  updateProductPrice = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPrice } = req.body;
    const product = await this.productsService.updateProductPrice(Number(id), newPrice);
    res.json(product);
  };

  getProductPriceHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const history = await this.productsService.getProductPriceHistory(Number(id));
    res.json(history);
  };
}
