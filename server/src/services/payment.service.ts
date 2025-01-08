import { Payment, PaymentMethod, CardPayment, Order } from '@prisma/client';
import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';

interface CreatePaymentInput {
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  cardPayment?: {
    lastFourDigits: string;
    cardType: string;
    transactionId?: string;
  };
}

interface PaymentFilters {
  orderId?: number;
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: PaymentMethod;
  branchId?: number;
  page?: number;
  limit?: number;
}

export class PaymentService {
  async createPayment(data: CreatePaymentInput): Promise<Payment> {
    // Siparişi kontrol et
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new BadRequestError('Sipariş bulunamadı');
    }

    if (order.payment) {
      throw new BadRequestError('Bu sipariş için zaten ödeme alınmış');
    }

    // Ödeme tutarı kontrolü
    if (data.amount > order.totalAmount) {
      throw new BadRequestError('Ödeme tutarı sipariş tutarından büyük olamaz');
    }

    // Transaction başlat
    return prisma.$transaction(async (tx) => {
      // Ödemeyi oluştur
      const payment = await tx.payment.create({
        data: {
          orderId: data.orderId,
          paymentMethod: data.paymentMethod,
          amount: data.amount,
          cardPayment: data.cardPayment
            ? {
                create: {
                  lastFourDigits: data.cardPayment.lastFourDigits,
                  cardType: data.cardPayment.cardType,
                  transactionId: data.cardPayment.transactionId || 'TX' + Date.now(),
                },
              }
            : undefined,
        },
        include: {
          cardPayment: true,
        },
      });

      // Sipariş durumunu güncelle
      if (data.amount === order.totalAmount) {
        await tx.order.update({
          where: { id: data.orderId },
          data: { status: 'COMPLETED' },
        });
      } else {
        await tx.order.update({
          where: { id: data.orderId },
          data: { status: 'PARTIALLY_PAID' },
        });
      }

      return payment;
    });
  }

  async getPayments(filters: {
    orderId?: number;
    restaurantId?: number;
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
    paymentMethod?: PaymentMethod;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.orderId && { orderId: filters.orderId }),
      ...(filters.restaurantId && {
        order: {
          restaurantId: filters.restaurantId,
        },
      }),
      ...(filters.branchId && {
        order: {
          branchId: filters.branchId,
        },
      }),
      ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(filters.startDate &&
        filters.endDate && {
          paymentTime: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              table: true,
            },
          },
          cardPayment: true,
        },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        orderBy: {
          paymentTime: 'desc',
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getPaymentById(id: number): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            table: true,
          },
        },
        cardPayment: true,
      },
    });
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { orderId },
      include: {
        cardPayment: true,
      },
    });
  }

  async getPaymentsByDate(date: string): Promise<Payment[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return prisma.payment.findMany({
      where: {
        paymentTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          include: {
            table: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
        cardPayment: true,
      },
      orderBy: {
        paymentTime: 'desc',
      },
    });
  }

  // Günlük özet raporu için yardımcı metod
  async getDailySummary(date: string) {
    const payments = await this.getPaymentsByDate(date);

    return {
      date,
      totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      paymentCount: payments.length,
      byMethod: payments.reduce(
        (acc, p) => {
          const method = p.paymentMethod;
          acc[method] = (acc[method] || 0) + Number(p.amount);
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  async getPaymentsByBranch(branchId: number): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: {
        order: {
          branchId,
        },
      },
      include: {
        order: true,
        cardPayment: true,
      },
    });
  }

  async getPaymentsByMethod(method: PaymentMethod): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: {
        paymentMethod: method,
      },
      include: {
        order: true,
        cardPayment: true,
      },
    });
  }
}
