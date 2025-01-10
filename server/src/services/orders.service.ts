import { PrismaClient, Order, OrderStatus, OrderSource, OrderItemStatus, Prisma, PaymentStatus } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { OrderNotFoundError, OrderItemNotFoundError } from '../errors/order-errors';
import { SocketService } from '../socket/socket.service';
import { SOCKET_EVENTS } from '../socket/socket.events';

const prisma = new PrismaClient();

interface CreateOrderInput {
  restaurantId: number;
  branchId: number;
  tableId?: number;
  customerId?: number;
  waiterId?: number;
  customerCount?: number;
  orderSource: OrderSource;
  items: {
    productId: number;
    quantity: number;
    note?: string;
  }[];
  notes?: string;
}

interface UpdateOrderInput {
  tableId?: number | null;
  customerId?: number | null;
  waiterId?: number | null;
  orderNotes?: string;
  priority?: boolean;
  status?: OrderStatus;
  discountAmount?: number;
  discountType?: string | null;
  paymentStatus?: PaymentStatus;
  items?: {
    id?: number;
    productId: number;
    quantity: number;
    notes?: string;
    status?: OrderItemStatus;
    selectedOptions?: number[];
  }[];
}

interface AddOrderItemInput {
  productId: number;
  quantity: number;
  note?: string;
  status?: OrderItemStatus;
  selectedOptions?: number[];
}

export class OrdersService {
  async getOrders(filters: {
    restaurantId?: number;
    branchId?: number;
    status?: OrderStatus;
    tableId?: number;
    waiterId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.restaurantId && { restaurantId: Number(filters.restaurantId) }),
      ...(filters.branchId && { branchId: Number(filters.branchId) }),
      ...(filters.status && { status: filters.status }),
      ...(filters.tableId && { tableId: Number(filters.tableId) }),
      ...(filters.waiterId && { waiterId: Number(filters.waiterId) }),
      ...(filters.startDate && filters.endDate && {
        OR: [
          { orderTime: { gte: filters.startDate + 'T00:00:00.000Z', lte: filters.endDate + 'T23:59:59.999Z' } },
          { openingTime: { gte: filters.startDate + 'T00:00:00.000Z', lte: filters.endDate + 'T23:59:59.999Z' } }
        ]
      }),
      ...(filters.search && {
        OR: [
          { orderNumber: { contains: filters.search } },
          { 
            table: { 
              tableNumber: { contains: filters.search } 
            } 
          },
          {
            customer: {
              name: { contains: filters.search }
            }
          }
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        include: {
          table: true,
          customer: true,
          waiter: true,
          orderItems: {
            include: {
              product: true,
            },
          },
          payment: {
            include: {
              cardPayment: true,
            },
          },
        },
        orderBy: {
          orderTime: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Siparişleri formatla
    const formattedOrders = orders.map(order => {
      const totalAmount = order.orderItems.reduce((sum, item) => 
        sum + (item.quantity * Number(item.unitPrice)), 0);

      return {
        id: order.id,
        orderNumber: order.id.toString().padStart(6, '0'),
        branchId: order.branchId,
        restaurantId: order.restaurantId,
        orderSource: order.orderSource,
        status: order.status,
        table: order.table ? {
          id: order.table.id,
          number: order.table.tableNumber
        } : undefined,
        customer: order.customer ? {
          id: order.customer.id,
          firstName: order.customer.name.split(' ')[0],
          lastName: order.customer.name.split(' ').slice(1).join(' ')
        } : undefined,
        customerCount: order.customerCount,
        notes: order.orderNotes || '',
        items: order.orderItems.map(item => ({
          id: item.id,
          productId: item.productId,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: Number(item.unitPrice)
          },
          quantity: item.quantity,
          notes: item.note || '',
          totalPrice: item.quantity * Number(item.unitPrice),
          status: order.status
        })),
        totalAmount,
        totalPriceBeforeDiscounts: order.totalPriceBeforeDiscounts || totalAmount,
        orderTime: order.orderTime,
        openingTime: order.openingTime || order.orderTime,
        closingTime: order.closingTime,
        completedAt: order.completedAt,
        tableId: order.tableId,
        customerId: order.customerId,
        waiterId: order.waiterId,
        orderNotes: order.orderNotes || '',
        discountAmount: order.discountAmount || 0,
        discountType: order.discountType || null,
        paymentStatus: order.paymentStatus || 'PENDING',
        priority: order.priority || false,
        payment: order.payment ? {
          paymentMethod: order.payment.paymentMethod,
          amount: Number(order.payment.amount)
        } : undefined
      };
    });

    return {
      success: true,
      data: formattedOrders,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10))
    };
  }

  async getOrderById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    // Toplam tutarı hesapla
    const totalAmount = order.orderItems.reduce((sum, item) => {
      return sum + (item.quantity * Number(item.unitPrice));
    }, 0);

    // Response formatını düzenle
    const formattedOrder = {
      id: order.id,
      orderNumber: order.id.toString().padStart(6, '0'),
      branchId: order.branchId,
      restaurantId: order.restaurantId,
      orderSource: order.orderSource,
      status: order.status,
      table: order.table ? {
        id: order.table.id,
        number: order.table.tableNumber
      } : undefined,
      customer: order.customer ? {
        id: order.customer.id,
        firstName: order.customer.name.split(' ')[0],
        lastName: order.customer.name.split(' ').slice(1).join(' ')
      } : undefined,
      customerCount: order.customerCount,
      notes: order.orderNotes || '',
      items: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.unitPrice)
        },
        quantity: item.quantity,
        notes: item.note || '',
        totalPrice: item.quantity * Number(item.unitPrice),
        status: order.status
      })),
      totalAmount,
      totalPriceBeforeDiscounts: order.totalPriceBeforeDiscounts || totalAmount,
      orderTime: order.orderTime,
      openingTime: order.openingTime || order.orderTime,
      closingTime: order.closingTime,
      completedAt: order.completedAt,
      tableId: order.tableId,
      customerId: order.customerId,
      waiterId: order.waiterId,
      orderNotes: order.orderNotes || '',
      discountAmount: order.discountAmount || 0,
      discountType: order.discountType || null,
      paymentStatus: order.paymentStatus || 'PENDING',
      priority: order.priority || false,
      preparationStartTime: order.preparationStartTime,
      preparationEndTime: order.preparationEndTime
    };

    return formattedOrder;
  }

  async createOrder(data: CreateOrderInput): Promise<Order> {
    try {
      console.log('[Orders] Yeni sipariş oluşturma başladı:', {
        restaurantId: data.restaurantId,
        branchId: data.branchId,
        source: data.orderSource,
        items: data.items.length
      });

      return prisma.$transaction(async (tx) => {
        // Önce ürünleri al
        const products = await tx.product.findMany({
          where: {
            id: {
              in: data.items.map(item => item.productId)
            }
          }
        });

        console.log('[Orders] Ürünler bulundu:', {
          requested: data.items.length,
          found: products.length
        });

        // Ürünlerin varlığını kontrol et
        const missingProducts = data.items
          .filter(item => !products.find(p => p.id === item.productId))
          .map(item => item.productId);

        if (missingProducts.length > 0) {
          console.error('[Orders] Eksik ürünler:', missingProducts);
          throw new Error(`Ürünler bulunamadı: ${missingProducts.join(', ')}`);
        }

        // Ürün fiyatlarını al ve toplam tutarı hesapla
        const orderItems = data.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (!product) {
            throw new Error(`Ürün bulunamadı: ${item.productId}`);
          }

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            note: item.note || '',
          };
        });

        const totalAmount = orderItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );

        console.log('[Orders] Sipariş detayları hazırlandı:', {
          items: orderItems.length,
          totalAmount
        });

        // Siparişi oluştur
        const order = await tx.order.create({
          data: {
            branchId: data.branchId,
            restaurantId: data.restaurantId,
            orderSource: data.orderSource,
            tableId: data.tableId || null,
            customerId: data.customerId || null,
            customerCount: data.customerCount || 1,
            orderNotes: data.notes || '',
            totalAmount,
            status: OrderStatus.PENDING,
            orderItems: {
              create: orderItems
            }
          },
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            table: true,
            customer: true,
            branch: true,
          }
        });

        console.log('[Orders] Sipariş başarıyla oluşturuldu:', {
          orderId: order.id,
          status: order.status,
          items: order.orderItems.length
        });

        // Socket.IO event'ini gönder
        console.log('[Socket.IO] Sipariş event\'i gönderiliyor:', SOCKET_EVENTS.ORDER_CREATED);
        SocketService.emit(SOCKET_EVENTS.ORDER_CREATED, {
          orderId: order.id,
          order: order
        });

        return order;
      });
    } catch (error) {
      console.error('[Orders] Sipariş oluşturma hatası:', {
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        error
      });
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id },
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

    if (!order) {
      throw new BadRequestError('Sipariş bulunamadı');
    }

    if (!this.canUpdateStatus(order.status, status)) {
      throw new BadRequestError('Bu durum güncellemesi yapılamaz');
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === OrderStatus.PREPARING && {
          preparationStartTime: new Date(),
        }),
        ...(status === OrderStatus.READY && {
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

    // Socket.IO event'lerini gönder
    SocketService.emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, {
      orderId: id,
      status,
      order: updatedOrder
    });

    // Eğer masa varsa, masanın durumunu da broadcast et
    if (updatedOrder.table) {
      SocketService.emit(SOCKET_EVENTS.TABLE_UPDATED, {
        tableId: updatedOrder.table.id,
        order: updatedOrder
      });
    }

    return updatedOrder;
  }

  private canUpdateStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    // Sipariş durumu güncelleme kuralları
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
      ITEM_ISSUE: ['PENDING', 'CANCELLED'],
      PARTIALLY_PAID: ['COMPLETED'],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  async updateOrder(id: number, data: UpdateOrderInput) {
    try {
      const existingOrder = await this.getOrderById(id);

      // Sipariş DELIVERED veya COMPLETED ise güncellemeye izin verme
      if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'COMPLETED') {
        throw new BadRequestError('Tamamlanmış siparişler güncellenemez');
      }

      return prisma.$transaction(async (tx) => {
        // Sipariş güncellemesi
        const updateData: Prisma.OrderUpdateInput = {
          ...(data.tableId !== undefined && { tableId: data.tableId }),
          ...(data.customerId !== undefined && { customerId: data.customerId }),
          ...(data.waiterId !== undefined && { waiterId: data.waiterId }),
          ...(data.orderNotes !== undefined && { orderNotes: data.orderNotes }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
          ...(data.discountAmount !== undefined && { discountAmount: data.discountAmount }),
          ...(data.discountType !== undefined && { discountType: data.discountType }),
        };

        if (data.items?.length) {
          // Mevcut kalemleri sil
          await tx.orderItem.deleteMany({
            where: { orderId: id },
          });

          // Ürünleri kontrol et ve fiyatlarını al
          const products = await Promise.all(
            data.items.map((item) =>
              tx.product.findFirst({
                where: {
                  id: item.productId,
                  restaurantId: existingOrder.restaurantId,
                },
              })
            )
          );

          // Ürünlerin varlığını kontrol et
          const missingProducts = products
            .map((product, index) => (!product ? data.items![index].productId : null))
            .filter((id): id is number => id !== null);

          if (missingProducts.length > 0) {
            throw new BadRequestError(
              `Bu ürünler bulunamadı: ${missingProducts.join(', ')}`
            );
          }

          // OrderItem'ları oluştur
          const orderItems = data.items.map((item, index) => ({
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
            note: item.notes || '',
            unitPrice: products[index]!.price,
            orderItemStatus: item.status || OrderItemStatus.PENDING,
          }));

          await tx.orderItem.createMany({
            data: orderItems,
          });

          // Toplam tutarı hesapla
          const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.quantity * Number(item.unitPrice),
            0
          );

          // İndirim öncesi toplam tutarı güncelle
          updateData.totalPriceBeforeDiscounts = totalAmount;
          
          // İndirim sonrası toplam tutarı güncelle
          const discountAmount = data.discountAmount || 0;
          updateData.totalAmount = totalAmount - discountAmount;
        }

        // Siparişi güncelle
        const updatedOrder = await tx.order.update({
          where: { id },
          data: updateData,
          include: {
            table: true,
            customer: true,
            waiter: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });

        // Socket üzerinden güncellemeyi bildir
        SocketService.emit(SOCKET_EVENTS.ORDER_UPDATED, {
          orderId: updatedOrder.id,
          status: updatedOrder.status,
          data: updatedOrder
        });

        return updatedOrder;
      });
    } catch (error) {
      console.error('Update Order Error:', error);
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new Error('Sipariş güncellenirken bir hata oluştu');
    }
  }

  async deleteOrder(id: number): Promise<void> {
    await this.getOrderById(id); // Sipariş var mı kontrol et
    
    // Transaction içinde ilişkili kayıtları sil
    await prisma.$transaction(async (tx) => {
      // 1. Önce kart ödeme kayıtlarını sil
      await tx.cardPayment.deleteMany({
        where: {
          payment: {
            orderId: id
          }
        }
      });

      // 2. Sonra ödeme kayıtlarını sil
      await tx.payment.deleteMany({
        where: {
          orderId: id
        }
      });

      // 3. Sipariş kalemlerini sil
      await tx.orderItem.deleteMany({
        where: {
          orderId: id
        }
      });

      // 4. En son siparişi sil
      await tx.order.delete({
        where: {
          id
        }
      });
    });
  }

  async addOrderItems(orderId: number, items: AddOrderItemInput[]) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    // Fetch all products first to get their prices
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    // Create a map of product prices
    const productPrices = new Map(products.map(p => [p.id, p.price]));

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderItems: {
          create: items.map(item => {
            const unitPrice = productPrices.get(item.productId);
            if (!unitPrice) {
              throw new Error(`Product with id ${item.productId} not found`);
            }
            return {
              quantity: item.quantity,
              notes: item.note || null,
              orderItemStatus: item.status || OrderItemStatus.PENDING,
              unitPrice: unitPrice,
              product: {
                connect: { id: item.productId }
              },
              ...(item.selectedOptions && item.selectedOptions.length > 0 && {
                selectedOptions: {
                  connect: item.selectedOptions.map(optionId => ({ id: optionId }))
                }
              })
            };
          })
        }
      },
      include: {
        orderItems: {
          include: {
            product: true,
            selectedOptions: true
          }
        },
        table: true,
        customer: true,
        waiter: true,
        payment: true
      }
    });

    return updatedOrder;
  }

  async updateOrderItem(
    orderId: number,
    itemId: number,
    data: {
      quantity?: number;
      note?: string;
      selectedOptions?: number[];
    }
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId,
        order: {
          restaurantId: order.restaurantId, // Aynı restorana ait olmalı
        },
      },
    });

    if (!orderItem) {
      throw new OrderItemNotFoundError(itemId);
    }

    // Seçili opsiyonları kontrol et (eğer varsa)
    if (data.selectedOptions?.length) {
      const options = await prisma.productOption.findMany({
        where: {
          id: { in: data.selectedOptions },
          optionGroup: {
            product: {
              restaurantId: order.restaurantId,
            },
          },
        },
      });

      const missingOptions = data.selectedOptions.filter(
        (id) => !options.some((opt) => opt.id === id)
      );

      if (missingOptions.length > 0) {
        throw new BadRequestError(
          `Options with ids ${missingOptions.join(', ')} not found in this restaurant`
        );
      }
    }

    await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        quantity: data.quantity,
        note: data.note,
        selectedOptions: data.selectedOptions
          ? {
              set: data.selectedOptions.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    return this.getOrderById(orderId);
  }

  async deleteOrderItem(orderId: number, itemId: number): Promise<Order> {
    const order = await this.getOrderById(orderId);

    await prisma.orderItem.delete({
      where: {
        id: itemId,
        orderId,
      },
    });

    return this.getOrderById(orderId);
  }

  async getOrdersByTable(tableId: number): Promise<Order[]> {
    return prisma.order.findMany({
      where: { tableId },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderTime: 'desc',
      },
    });
  }

  async getOrdersByWaiter(waiterId: number): Promise<Order[]> {
    return prisma.order.findMany({
      where: { waiterId },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderTime: 'desc',
      },
    });
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderTime: 'desc',
      },
    });
  }

  async getOrdersByBranch(branchId: number): Promise<Order[]> {
    return prisma.order.findMany({
      where: { branchId },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderTime: 'desc',
      },
    });
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return prisma.order.findMany({
      where: { status },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderTime: 'desc',
      },
    });
  }

  async updateOrderNotes(id: number, notes: string): Promise<Order> {
    const order = await this.getOrderById(id);

    return prisma.order.update({
      where: { id },
      data: { orderNotes: notes },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return prisma.order.findMany({
      where: {
        orderTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderTime: 'desc',
      },
    });
  }

  async bulkDeleteOrders(orderIds: number[]) {
    try {
      console.log('[Orders] Toplu sipariş silme başladı:', {
        orderIds,
        count: orderIds.length
      });

      const result = await prisma.$transaction(async (tx) => {
        // Önce siparişlerin var olduğunu kontrol et
        const orders = await tx.order.findMany({
          where: {
            id: {
              in: orderIds
            }
          },
          include: {
            orderItems: true,
            payment: {
              include: {
                cardPayment: true
              }
            }
          }
        });

        console.log('[Orders] Silinecek siparişler bulundu:', {
          requested: orderIds.length,
          found: orders.length
        });

        // Eksik siparişleri kontrol et
        const missingOrders = orderIds.filter(id => !orders.find(o => o.id === id));
        if (missingOrders.length > 0) {
          console.error('[Orders] Bazı siparişler bulunamadı:', missingOrders);
          throw new Error(`Siparişler bulunamadı: ${missingOrders.join(', ')}`);
        }

        // Her sipariş için ilişkili kayıtları sil
        for (const order of orders) {
          try {
            // 1. Stok geçmişi kayıtlarını sil
            await tx.stockHistory.deleteMany({
              where: {
                orderId: order.id
              }
            });

            // 2. Kart ödeme kayıtlarını sil
            if (order.payment?.cardPayment) {
              await tx.cardPayment.delete({
                where: {
                  id: order.payment.cardPayment.id
                }
              });
            }

            // 3. Ödeme kayıtlarını sil
            if (order.payment) {
              await tx.payment.delete({
                where: {
                  id: order.payment.id
                }
              });
            }

            // 4. Sipariş kalemlerini sil
            await tx.orderItem.deleteMany({
              where: {
                orderId: order.id
              }
            });

            console.log(`[Orders] Sipariş #${order.id} ilişkili kayıtları silindi`);
          } catch (error) {
            console.error(`[Orders] Sipariş #${order.id} ilişkili kayıtları silinirken hata:`, error);
            throw error;
          }
        }

        // 5. En son siparişleri sil
        const deleteResult = await tx.order.deleteMany({
          where: {
            id: {
              in: orderIds
            }
          }
        });

        console.log('[Orders] Siparişler ve ilişkili kayıtlar başarıyla silindi:', {
          count: deleteResult.count
        });

        return deleteResult;
      });

      return result;
    } catch (error) {
      console.error('[Orders] Toplu sipariş silme hatası:', {
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        error
      });
      throw error;
    }
  }

  async bulkUpdateOrderStatus(orderIds: number[], status: OrderStatus): Promise<void> {
    await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        status
      }
    });
  }

  async getOrdersForPrinting(orderIds: number[]) {
    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: orderIds
        }
      },
      include: {
        table: true,
        customer: true,
        waiter: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: {
          include: {
            cardPayment: true,
          },
        },
      },
    });

    return orders.map(order => {
      const totalAmount = order.orderItems.reduce((sum, item) => 
        sum + (item.quantity * Number(item.unitPrice)), 0);

      return {
        id: order.id,
        orderNumber: order.id.toString().padStart(6, '0'),
        orderTime: order.orderTime,
        table: order.table?.tableNumber,
        customer: order.customer?.name,
        waiter: order.waiter?.name,
        items: order.orderItems.map(item => ({
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: item.quantity * Number(item.unitPrice),
          notes: item.note || ''
        })),
        totalAmount,
        paymentMethod: order.payment?.paymentMethod || 'Ödeme Bekliyor',
        notes: order.orderNotes || ''
      };
    });
  }
}
