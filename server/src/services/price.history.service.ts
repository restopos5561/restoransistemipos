import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';

export class PriceHistoryService {
  async getPriceHistory(filters: {
    productId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = {
      ...(filters.productId && { productId: filters.productId }),
      ...(filters.startDate && { startDate: { gte: filters.startDate } }),
      ...(filters.endDate && { endDate: { lte: filters.endDate } }),
    };

    const [history, total] = await Promise.all([
      prisma.priceHistory.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        include: {
          product: true,
        },
      }),
      prisma.priceHistory.count({ where }),
    ]);

    return {
      priceHistory: history,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getPriceHistoryById(id: number) {
    const history = await prisma.priceHistory.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!history) {
      throw new BadRequestError('Fiyat geçmişi kaydı bulunamadı');
    }

    return history;
  }

  async createPriceHistory(data: {
    productId: number;
    oldPrice: number;
    newPrice: number;
    startDate: Date;
  }) {
    return prisma.priceHistory.create({
      data,
      include: {
        product: true,
      },
    });
  }

  async getPriceHistoryByProductId(productId: number) {
    return prisma.priceHistory.findMany({
      where: { productId },
      include: {
        product: true,
      },
    });
  }
}
