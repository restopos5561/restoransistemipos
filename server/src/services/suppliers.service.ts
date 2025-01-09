import { PrismaClient, Supplier } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface CreateSupplierInput {
  restaurantId: number;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export class SuppliersService {
  async getSuppliers(filters: {
    restaurantId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.restaurantId && { restaurantId: filters.restaurantId }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' as const } },
          { contactName: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getSupplierById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: true },
        },
        purchaseOrders: {
          include: { purchaseOrderItems: true },
        },
      },
    });

    if (!supplier) throw new BadRequestError('Tedarikçi bulunamadı');
    return supplier;
  }

  async createSupplier(data: CreateSupplierInput) {
    return prisma.supplier.create({
      data,
      include: {
        products: true,
      },
    });
  }

  async updateSupplier(id: number, data: Partial<CreateSupplierInput>) {
    const supplier = await this.getSupplierById(id);

    return prisma.supplier.update({
      where: { id },
      data,
      include: {
        products: true,
      },
    });
  }

  async deleteSupplier(id: number): Promise<void> {
    // Önce tedarikçinin varlığını kontrol et
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new BadRequestError('Tedarikçi bulunamadı');
    }

    // Tedarikçiye ait ilişkili kayıtları transaction içinde sil
    await prisma.$transaction(async (tx) => {
      // Tedarikçiye ait satın alma siparişi ürünlerini sil
      await tx.purchaseOrderItem.deleteMany({
        where: {
          purchaseOrder: {
            supplierId: id,
          },
        },
      });

      // Tedarikçiye ait satın alma siparişlerini sil
      await tx.purchaseOrder.deleteMany({
        where: { supplierId: id },
      });

      // Tedarikçi-ürün ilişkilerini sil
      await tx.productSupplier.deleteMany({
        where: { supplierId: id },
      });

      // En son tedarikçiyi sil
      await tx.supplier.delete({
        where: { id },
      });
    });
  }

  async addProductToSupplier(
    supplierId: number,
    data: {
      productId: number;
      isPrimary?: boolean;
      lastPurchasePrice?: number;
      supplierProductCode?: string;
    }
  ) {
    const supplier = await this.getSupplierById(supplierId);

    // Ürünün varlığını kontrol et
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) throw new BadRequestError('Ürün bulunamadı');

    return prisma.productSupplier.create({
      data: {
        supplierId,
        ...data,
      },
      include: {
        product: true,
        supplier: true,
      },
    });
  }

  async getSuppliersByProduct(productId: number) {
    return prisma.productSupplier.findMany({
      where: { productId },
      include: {
        supplier: true,
      },
    });
  }
}
