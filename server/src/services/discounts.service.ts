import { PrismaClient, Prisma, DiscountType } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

export class DiscountsService {
  async getDiscounts(filters: {
    orderId?: number;
    orderItemId?: number;
    type?: DiscountType;
    page?: number;
    limit?: number;
  }) {
    const { orderId, orderItemId, type, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.DiscountWhereInput = {
      ...(orderId && { orderId }),
      ...(orderItemId && { orderItemId }),
      ...(type && { discountType: type }),
    };

    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: true,
          orderItem: true,
        },
      }),
      prisma.discount.count({ where: whereClause }),
    ]);

    return {
      discounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createDiscount(data: {
    orderId?: number;
    orderItemId?: number;
    discountType: DiscountType;
    discountAmount: number;
    note?: string;
  }) {
    // Sipariş veya sipariş kalemi kontrolü
    if (data.orderId) {
      const order = await prisma.order.findUnique({ where: { id: data.orderId } });
      if (!order) throw new BadRequestError('Sipariş bulunamadı');
    }

    if (data.orderItemId) {
      const orderItem = await prisma.orderItem.findUnique({ where: { id: data.orderItemId } });
      if (!orderItem) throw new BadRequestError('Sipariş kalemi bulunamadı');
    }

    return prisma.discount.create({
      data,
      include: {
        order: true,
        orderItem: true,
      },
    });
  }

  async getDiscountById(id: number) {
    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        order: true,
        orderItem: true,
      },
    });

    if (!discount) throw new BadRequestError('İndirim bulunamadı');
    return discount;
  }

  async updateDiscount(
    id: number,
    data: {
      discountType?: DiscountType;
      discountAmount?: number;
      note?: string;
    }
  ) {
    const discount = await this.getDiscountById(id);

    return prisma.discount.update({
      where: { id },
      data,
      include: {
        order: true,
        orderItem: true,
      },
    });
  }

  async deleteDiscount(id: number) {
    await this.getDiscountById(id);
    await prisma.discount.delete({ where: { id } });
  }

  async getDiscountsByOrder(orderId: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestError('Sipariş bulunamadı');

    return prisma.discount.findMany({
      where: { orderId },
      include: {
        order: true,
        orderItem: true,
      },
    });
  }
}
