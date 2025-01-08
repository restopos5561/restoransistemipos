import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';

export class PurchaseOrderItemsService {
  async getPurchaseOrderItems(filters: {
    purchaseOrderId?: number;
    productId?: number;
    page?: number;
    limit?: number;
  }) {
    const where: any = {
      ...(filters.purchaseOrderId && { purchaseOrderId: filters.purchaseOrderId }),
      ...(filters.productId && { productId: filters.productId }),
    };

    const [items, total] = await Promise.all([
      prisma.purchaseOrderItem.findMany({
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
        },
      }),
      prisma.purchaseOrderItem.count({ where }),
    ]);

    return {
      purchaseOrderItems: items,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getPurchaseOrderItemById(id: number) {
    const item = await prisma.purchaseOrderItem.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!item) {
      throw new BadRequestError('Sipariş kalemi bulunamadı');
    }

    return item;
  }

  async createPurchaseOrderItem(data: {
    purchaseOrderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }) {
    // Sipariş kontrolü
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: data.purchaseOrderId },
    });

    if (!order) {
      throw new BadRequestError('Satın alma siparişi bulunamadı');
    }

    // Ürün kontrolü
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    return prisma.purchaseOrderItem.create({
      data,
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

  async updatePurchaseOrderItem(
    id: number,
    data: {
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
    }
  ) {
    await this.getPurchaseOrderItemById(id);

    return prisma.purchaseOrderItem.update({
      where: { id },
      data,
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

  async deletePurchaseOrderItem(id: number) {
    await this.getPurchaseOrderItemById(id);
    return prisma.purchaseOrderItem.delete({ where: { id } });
  }

  async getItemsByPurchaseOrderId(purchaseOrderId: number) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
    });

    if (!order) {
      throw new BadRequestError('Satın alma siparişi bulunamadı');
    }

    return prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId },
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
