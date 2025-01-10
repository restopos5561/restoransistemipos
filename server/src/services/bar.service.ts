import { PrismaClient, OrderStatus, CategoryType } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { startOfDay, endOfDay } from 'date-fns';

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
    console.log('[BarService] Siparişler isteniyor:', {
      endpoint: '/api/bar/orders',
      params: filters
    });

    if (!filters.branchId) {
      throw new BadRequestError('Şube ID\'si gereklidir.');
    }

    const where = {
      branchId: filters.branchId,
      ...(filters.status && { status: { in: filters.status } }),
      ...(filters.priority === true && { priority: true }),
      ...(filters.onlyBeverages && {
        orderItems: {
          some: {
            product: {
              category: {
                type: CategoryType.BEVERAGE
              }
            }
          }
        }
      }),
    };

    console.log('[BarService] Sorgu parametreleri:', {
      where,
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10
    });

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

    console.log('[BarService] Backend yanıtı:', {
      orderCount: orders.length,
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        orderSource: order.orderSource,
        table: order.table ? {
          id: order.table.id,
          number: order.table.tableNumber
        } : null,
        itemCount: order.orderItems.length,
        items: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            category: item.product.category ? {
              id: item.product.category.id,
              name: item.product.category.name,
              type: item.product.category.type
            } : null
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
            name: item.product.name,
            price: item.product.price,
            category: item.product.category ? {
              id: item.product.category.id,
              name: item.product.category.name,
              type: item.product.category.type
            } : null
          },
          totalPrice: item.quantity * item.product.price,
          notes: item.note || ''
        })),
        totalAmount: order.orderItems.reduce((total, item) => 
          total + (item.quantity * item.product.price), 0)
      })),
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

  async getStats(branchId: number) {
    const today = new Date();
    const whereBase = {
      branchId,
      orderItems: {
        some: {
          product: {
            categoryId: {
              equals: 2, // İçecekler kategorisi
            },
          },
        },
      },
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

    return {
      pendingCount,
      preparingCount,
      completedToday,
      averagePreparationTime
    };
  }
}
