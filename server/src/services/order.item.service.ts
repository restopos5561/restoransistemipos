import { PrismaClient, OrderItem, OrderItemStatus, OrderItemType, Prisma } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { OrderItemNotFoundError } from '../errors/order-item-not-found-error';

const prisma = new PrismaClient();

interface OrderItemFilters {
  orderId?: number;
  productId?: number;
  type?: OrderItemType;
  status?: OrderItemStatus;
  page?: number;
  limit?: number;
}

interface CreateOrderItemInput {
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  isVoid?: boolean;
  type?: OrderItemType;
  orderItemStatus?: OrderItemStatus;
  preparationStartTime?: Date | null;
  preparationEndTime?: Date | null;
  selectedOptions?: { id: number }[];
}

interface UpdateOrderItemInput {
  quantity?: number;
  unitPrice?: number;
  isVoid?: boolean;
  type?: OrderItemType;
  orderItemStatus?: OrderItemStatus;
  preparationStartTime?: Date | null;
  preparationEndTime?: Date | null;
  selectedOptions?: { id: number }[];
}

export class OrderItemService {
  async getOrderItems(filters: OrderItemFilters) {
    const { orderId, productId, type, status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderItemWhereInput = {
      ...(orderId && { orderId }),
      ...(productId && { productId }),
      ...(type && { type }),
      ...(status && { orderItemStatus: status }),
    };

    const [total, items] = await Promise.all([
      prisma.orderItem.count({ where }),
      prisma.orderItem.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
          selectedOptions: true,
          discounts: true,
        },
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
        },
      }),
    ]);

    return {
      orderItems: items.map((item) => ({
        ...item,
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
        discount: item.discounts?.reduce((sum, d) => sum + d.discountAmount, 0) ?? 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderItemById(id: number) {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        selectedOptions: true,
        discounts: true,
      },
    });

    if (!orderItem) {
      throw new OrderItemNotFoundError(id);
    }

    return {
      ...orderItem,
      totalPrice: Number(orderItem.quantity) * Number(orderItem.unitPrice),
      discount: orderItem.discounts?.reduce((sum, d) => sum + d.discountAmount, 0) ?? 0,
    };
  }

  async createOrderItem(data: CreateOrderItemInput) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new BadRequestError('Sipariş bulunamadı');
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        productOptions: true,
      },
    });

    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    if (data.selectedOptions && data.selectedOptions.length > 0) {
      const options = await prisma.productOption.findMany({
        where: {
          id: {
            in: data.selectedOptions.map((opt) => opt.id),
          },
        },
      });

      if (options.length !== data.selectedOptions.length) {
        throw new BadRequestError('Bir veya daha fazla seçenek bulunamadı');
      }
    }

    return prisma.orderItem.create({
      data: {
        orderId: data.orderId,
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        type: data.type || 'SALE',
        orderItemStatus: data.orderItemStatus || 'PENDING',
        preparationStartTime: data.preparationStartTime,
        preparationEndTime: data.preparationEndTime,
        selectedOptions: data.selectedOptions
          ? {
              connect: data.selectedOptions,
            }
          : undefined,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        selectedOptions: true,
      },
    });
  }

  async updateOrderItem(id: number, data: UpdateOrderItemInput) {
    const orderItem = await this.getOrderItemById(id);

    return prisma.orderItem.update({
      where: { id },
      data: {
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        isVoid: data.isVoid,
        type: data.type,
        orderItemStatus: data.orderItemStatus,
        preparationStartTime: data.preparationStartTime,
        preparationEndTime: data.preparationEndTime,
        selectedOptions: data.selectedOptions
          ? {
              set: data.selectedOptions,
            }
          : undefined,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        selectedOptions: true,
        discounts: true,
      },
    });
  }

  async updateOrderItemStatus(id: number, status: OrderItemStatus) {
    const orderItem = await this.getOrderItemById(id);

    const times = {
      ...(status === OrderItemStatus.PREPARING && {
        preparationStartTime: new Date(),
      }),
      ...(status === OrderItemStatus.READY && {
        preparationEndTime: new Date(),
      }),
    };

    return prisma.orderItem.update({
      where: { id },
      data: {
        orderItemStatus: status,
        ...times,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        selectedOptions: true,
      },
    });
  }

  async voidOrderItem(id: number) {
    const orderItem = await this.getOrderItemById(id);

    return prisma.orderItem.update({
      where: { id },
      data: {
        isVoid: true,
        type: OrderItemType.VOID,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        selectedOptions: true,
      },
    });
  }

  async deleteOrderItem(id: number) {
    await this.getOrderItemById(id);
    await prisma.orderItem.delete({ where: { id } });
    return true;
  }

  async getOrderItemsByOrderId(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestError('Sipariş bulunamadı');
    }

    return prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        selectedOptions: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async getOrderItemsByProductId(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    return prisma.orderItem.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        selectedOptions: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
}
