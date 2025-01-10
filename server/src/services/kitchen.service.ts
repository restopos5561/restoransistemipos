import { PrismaClient, OrderStatus, Prisma } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

interface KitchenOrdersFilters {
  status?: OrderStatus[] | string;
  priority?: boolean;
  page?: number;
  limit?: number;
  branchId?: number;
  onlyFood?: boolean;
}

export class KitchenService {
  async getOrders(filters: KitchenOrdersFilters) {
    console.log('[KitchenService] Siparişler isteniyor:', {
      endpoint: '/api/kitchen/orders',
      params: filters
    });

    const where: Prisma.OrderWhereInput = {
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.status && { 
        status: { 
          in: Array.isArray(filters.status) 
            ? filters.status 
            : filters.status.split(',') as OrderStatus[] 
        } 
      }),
      ...(filters.priority !== undefined && { priority: filters.priority }),
      // Opsiyonel filtre: Sadece yemek siparişleri
      ...(filters.onlyFood && {
        orderItems: {
          some: {
            product: {
              NOT: {
                categoryId: null
              }
            }
          }
        }
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
              product: {
                include: {
                  category: true
                }
              },
              selectedOptions: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { orderTime: 'asc' }],
      }),
      prisma.order.count({ where }),
    ]);

    console.log('[KitchenService] Backend yanıtı:', {
      orders: orders.length,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10))
    });

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

  async getStats(branchId?: number) {
    console.log('[KitchenService] İstatistikler isteniyor:', {
      branchId
    });

    const today = new Date();
    const whereBase: Prisma.OrderWhereInput = {
      ...(branchId && { branchId }),
      orderItems: {
        some: {
          product: {
            NOT: {
              categoryId: null
            }
          }
        }
      }
    };

    const [
      pendingCount,
      preparingCount,
      completedToday,
      averagePreparationTime
    ] = await Promise.all([
      // Bekleyen sipariş sayısı
      prisma.order.count({
        where: {
          ...whereBase,
          status: OrderStatus.PENDING,
        },
      }),

      // Hazırlanan sipariş sayısı
      prisma.order.count({
        where: {
          ...whereBase,
          status: OrderStatus.PREPARING,
        },
      }),

      // Bugün tamamlanan sipariş sayısı
      prisma.order.count({
        where: {
          ...whereBase,
          status: OrderStatus.COMPLETED,
          completedAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
      }),

      // Ortalama hazırlama süresi (dakika)
      prisma.order.findMany({
        where: {
          ...whereBase,
          status: OrderStatus.COMPLETED,
          preparationStartTime: { not: null },
          preparationEndTime: { not: null },
        },
        select: {
          preparationStartTime: true,
          preparationEndTime: true,
        },
      }).then(orders => {
        if (orders.length === 0) return 0;
        
        const totalMinutes = orders.reduce((acc, order) => {
          const startTime = order.preparationStartTime as Date;
          const endTime = order.preparationEndTime as Date;
          const minutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          return acc + minutes;
        }, 0);

        return Math.round(totalMinutes / orders.length);
      }),
    ]);

    console.log('[KitchenService] İstatistik yanıtı:', {
      pendingCount,
      preparingCount,
      completedToday,
      averagePreparationTime
    });

    return {
      pendingCount,
      preparingCount,
      completedToday,
      averagePreparationTime,
    };
  }
}
