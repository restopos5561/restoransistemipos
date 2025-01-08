import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';

export class ProductSupplierService {
  async getProductSuppliers(filters: {
    productId?: number;
    supplierId?: number;
    isPrimary?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where: any = {
      ...(filters.productId && { productId: filters.productId }),
      ...(filters.supplierId && { supplierId: filters.supplierId }),
      ...(typeof filters.isPrimary === 'boolean' && { isPrimary: filters.isPrimary }),
    };

    const [productSuppliers, total] = await Promise.all([
      prisma.productSupplier.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.productSupplier.count({ where }),
    ]);

    return {
      productSuppliers,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async createProductSupplier(data: {
    productId: number;
    supplierId: number;
    isPrimary: boolean;
    lastPurchasePrice?: number;
    supplierProductCode?: string;
  }) {
    // Ürün kontrolü
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    // Tedarikçi kontrolü
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) {
      throw new BadRequestError('Tedarikçi bulunamadı');
    }

    // Eğer isPrimary true ise, diğer primary ilişkileri false yap
    if (data.isPrimary) {
      await prisma.productSupplier.updateMany({
        where: {
          productId: data.productId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return prisma.productSupplier.create({
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getProductSupplierByIds(productId: number, supplierId: number) {
    const relation = await prisma.productSupplier.findUnique({
      where: {
        productId_supplierId: {
          productId,
          supplierId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!relation) {
      throw new BadRequestError('Ürün-tedarikçi ilişkisi bulunamadı');
    }

    return relation;
  }

  async updateProductSupplier(
    productId: number,
    supplierId: number,
    data: {
      isPrimary?: boolean;
      lastPurchasePrice?: number;
      supplierProductCode?: string;
    }
  ) {
    await this.getProductSupplierByIds(productId, supplierId);

    // Eğer isPrimary true ise, diğer primary ilişkileri false yap
    if (data.isPrimary) {
      await prisma.productSupplier.updateMany({
        where: {
          productId,
          isPrimary: true,
          NOT: {
            supplierId,
          },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return prisma.productSupplier.update({
      where: {
        productId_supplierId: {
          productId,
          supplierId,
        },
      },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteProductSupplier(productId: number, supplierId: number) {
    await this.getProductSupplierByIds(productId, supplierId);

    return prisma.productSupplier.delete({
      where: {
        productId_supplierId: {
          productId,
          supplierId,
        },
      },
    });
  }

  async getSuppliersByProductId(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    return prisma.productSupplier.findMany({
      where: { productId },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getProductsBySupplier(supplierId: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new BadRequestError('Tedarikçi bulunamadı');
    }

    return prisma.productSupplier.findMany({
      where: { supplierId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
