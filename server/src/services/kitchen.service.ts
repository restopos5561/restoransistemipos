import { PrismaClient, OrderStatus } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface KitchenOrdersFilters {
  status?: OrderStatus[];
  priority?: boolean;
  page?: number;
  limit?: number;
  branchId?: number;
  onlyFood?: boolean;
}

export class KitchenService {
  async getOrders(filters: KitchenOrdersFilters) {
    const where = {
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.status && { status: { in: filters.status } }),
      ...(filters.priority !== undefined && { priority: filters.priority }),
      // Opsiyonel filtre: Sadece yemek siparişleri
      ...(filters.onlyFood && {
        orderItems: {
          some: {
            product: {
              categoryId: {
                not: {
                  in: [2], // İçecekler kategorisi
                },
              },
            },
          },
        },
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        include: {
          table: true,
          orderItems: {
            include: {
              product: true,
              selectedOptions: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { orderTime: 'asc' }],
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestError('Sipariş bulunamadı');
    }

    // Sipariş durumunu güncelle
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'PREPARING' && {
          preparationStartTime: new Date(),
        }),
        ...(status === 'READY' && {
          preparationEndTime: new Date(),
        }),
      },
      include: {
        table: true,
        orderItems: {
          include: {
            product: true,
            selectedOptions: true,
          },
        },
      },
    });
  }

  async getQueue() {
    return this.getOrders({
      status: ['PENDING', 'PREPARING'],
      limit: 50,
    });
  }
}
