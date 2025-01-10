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

    if (!filters.branchId) {
      throw new BadRequestError('Şube ID\'si gereklidir.');
    }

    const where: Prisma.OrderWhereInput = {
      branchId: filters.branchId,
      ...(filters.status && { 
        status: { 
          in: Array.isArray(filters.status) 
            ? filters.status 
            : typeof filters.status === 'string'
              ? filters.status.split(',') as OrderStatus[]
              : [filters.status]
        } 
      }),
      ...(filters.priority === true && { priority: true }),
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
        orderBy: [
          { priority: 'desc' },
          { orderTime: 'asc' }
        ],
      }),
      prisma.order.count({ where }),
    ]);

    console.log('[KitchenService] Backend yanıtı:', {
      orders: orders.map(order => ({
        id: order.id,
        items: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name
          },
          notes: item.note || ''
        }))
      })),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10))
    });

    return {
      orders: orders.map(order => ({
        ...order,
        table: order.table ? {
          id: order.table.id,
          number: order.table.tableNumber
        } : null,
        items: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name
          },
          notes: item.note || ''
        }))
      })),
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

  async getQueue(branchId: number) {
    if (!branchId) {
      throw new BadRequestError('Şube ID\'si gereklidir.');
    }

    return this.getOrders({
      status: ['PENDING', 'PREPARING'],
      limit: 50,
      branchId
    });
  }

  async getStats(branchId: number) {
    if (!branchId) {
      throw new BadRequestError('Şube ID\'si gereklidir.');
    }

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const [
      averagePreparationTime,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday
    ] = await Promise.all([
      // Ortalama hazırlama süresi
      prisma.order.findMany({
        where: {
          branchId,
          preparationStartTime: { not: null },
          preparationEndTime: { not: null }
        },
        select: {
          preparationStartTime: true,
          preparationEndTime: true
        }
      }),
      // Bekleyen siparişler
      prisma.order.count({
        where: {
          branchId,
          status: OrderStatus.PENDING
        }
      }),
      // Hazırlanan siparişler
      prisma.order.count({
        where: {
          branchId,
          status: OrderStatus.PREPARING
        }
      }),
      // Hazır siparişler
      prisma.order.count({
        where: {
          branchId,
          status: OrderStatus.READY
        }
      }),
      // Bugün tamamlanan siparişler
      prisma.order.count({
        where: {
          branchId,
          status: OrderStatus.COMPLETED,
          completedAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      })
    ]);

    // Ortalama hazırlama süresini hesapla
    const avgPrepTime = averagePreparationTime.reduce((acc, order) => {
      if (order.preparationStartTime && order.preparationEndTime) {
        return acc + (order.preparationEndTime.getTime() - order.preparationStartTime.getTime());
      }
      return acc;
    }, 0) / (averagePreparationTime.length || 1);

    return {
      averagePreparationTime: Math.round(avgPrepTime / 60000), // Dakika cinsinden
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday
    };
  }
}
