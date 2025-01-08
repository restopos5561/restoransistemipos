import { PrismaClient, OrderStatus } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface BarOrdersFilters {
  status?: OrderStatus[];
  priority?: boolean;
  page?: number;
  limit?: number;
  branchId?: number;
  onlyBeverages?: boolean;
}

export class BarService {
  async getOrders(filters: BarOrdersFilters) {
    const where = {
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.status && { status: { in: filters.status } }),
      ...(filters.priority !== undefined && { priority: filters.priority }),
      ...(filters.onlyBeverages && {
        orderItems: {
          some: {
            product: {
              categoryId: {
                equals: 2, // İçecekler kategorisi
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
      where: {
        id: orderId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new BadRequestError('Sipariş bulunamadı');
    }

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
