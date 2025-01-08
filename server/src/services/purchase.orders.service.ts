import { PrismaClient, PurchaseOrderStatus, PurchaseOrder } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface CreatePurchaseOrderInput {
  supplierId: number;
  restaurantId: number;
  branchId: number;
  expectedDeliveryDate?: Date;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

interface UpdatePurchaseOrderInput {
  expectedDeliveryDate?: string;
  notes?: string;
  items?: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

export class PurchaseOrdersService {
  async getPurchaseOrders(filters: {
    restaurantId?: number | string;
    branchId?: number | string;
    supplierId?: number | string;
    status?: PurchaseOrderStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number | string;
    limit?: number | string;
  }) {
    try {
      const where = {
        ...(filters.restaurantId && {
          restaurantId:
            typeof filters.restaurantId === 'string'
              ? parseInt(filters.restaurantId)
              : filters.restaurantId,
        }),
        ...(filters.branchId && {
          branchId:
            typeof filters.branchId === 'string' ? parseInt(filters.branchId) : filters.branchId,
        }),
        ...(filters.supplierId && {
          supplierId:
            typeof filters.supplierId === 'string'
              ? parseInt(filters.supplierId)
              : filters.supplierId,
        }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate &&
          filters.endDate && {
            orderDate: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      };

      const page = filters.page
        ? typeof filters.page === 'string'
          ? parseInt(filters.page)
          : filters.page
        : 1;
      const limit = filters.limit
        ? typeof filters.limit === 'string'
          ? parseInt(filters.limit)
          : filters.limit
        : 10;

      const [orders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            supplier: true,
            purchaseOrderItems: {
              include: { product: true },
            },
          },
          orderBy: { orderDate: 'desc' },
        }),
        prisma.purchaseOrder.count({ where }),
      ]);

      return {
        success: true,
        data: {
          purchaseOrders: orders,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Purchase Orders Error:', error);
      throw new BadRequestError('Satın alma siparişleri alınırken bir hata oluştu');
    }
  }

  async createPurchaseOrder(data: CreatePurchaseOrderInput) {
    return prisma.$transaction(async (tx) => {
      // Tedarikçi kontrolü
      const supplier = await tx.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier) throw new BadRequestError('Tedarikçi bulunamadı');

      // Toplam tutarı hesapla
      const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      // Siparişi oluştur
      const order = await tx.purchaseOrder.create({
        data: {
          supplierId: data.supplierId,
          restaurantId: data.restaurantId,
          branchId: data.branchId,
          expectedDeliveryDate: data.expectedDeliveryDate,
          notes: data.notes,
          totalAmount,
          status: PurchaseOrderStatus.PENDING,
          purchaseOrderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          supplier: true,
          purchaseOrderItems: {
            include: { product: true },
          },
        },
      });

      return order;
    });
  }

  async updateOrderStatus(id: number, status: PurchaseOrderStatus) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!order) throw new BadRequestError('Sipariş bulunamadı');

    return prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
        purchaseOrderItems: {
          include: { product: true },
        },
      },
    });
  }

  async getPurchaseOrderById(id: number) {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: id },
      include: {
        supplier: true,
        purchaseOrderItems: {
          include: { product: true },
        },
      },
    });

    if (!order) throw new BadRequestError('Sipariş bulunamadı');
    return order;
  }

  async updatePurchaseOrder(id: number, data: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { purchaseOrderItems: true },
      });

      if (!order) {
        throw new BadRequestError('Satın alma siparişi bulunamadı');
      }

      const updateData: any = {
        expectedDeliveryDate: data.expectedDeliveryDate,
        notes: data.notes,
      };

      if (data.items) {
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id },
        });

        const totalAmount = data.items.reduce(
          (sum: number, item) => sum + item.quantity * item.unitPrice,
          0
        );

        updateData.totalAmount = totalAmount;
        updateData.purchaseOrderItems = {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        };
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: updateData,
        include: {
          supplier: true,
          purchaseOrderItems: {
            include: { product: true },
          },
        },
      });
    });
  }

  async deletePurchaseOrder(id: number) {
    try {
      // Önce siparişin var olduğunu kontrol et
      const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
          purchaseOrderItems: true,
        },
      });

      if (!order) {
        throw new BadRequestError(`Satın alma siparişi bulunamadı: ${id}`);
      }

      // Transaction ile önce sipariş kalemlerini, sonra siparişi sil
      await prisma.$transaction(async (tx) => {
        // Önce sipariş kalemlerini sil
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id },
        });

        // Sonra siparişi sil
        await tx.purchaseOrder.delete({
          where: { id },
        });
      });

      return true;
    } catch (error) {
      console.error('Delete Purchase Order Error:', error);
      throw new BadRequestError('Satın alma siparişi silinirken bir hata oluştu');
    }
  }

  async getPurchaseOrdersBySupplier(supplierId: number) {
    const orders = await prisma.purchaseOrder.findMany({
      where: { supplierId },
      include: {
        supplier: true,
        purchaseOrderItems: {
          include: { product: true },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    return orders;
  }
}
