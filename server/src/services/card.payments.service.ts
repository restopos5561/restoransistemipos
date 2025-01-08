import { prisma } from '../app';
import { BadRequestError } from '../errors/bad-request-error';

export class CardPaymentsService {
  async getCardPayments(filters: {
    paymentId?: number;
    orderId?: number;
    startDate?: Date;
    endDate?: Date;
    cardType?: string;
    page?: number;
    limit?: number;
  }) {
    const { paymentId, orderId, startDate, endDate, cardType, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      payment: {
        ...(orderId && { orderId }),
        paymentMethod: 'CREDIT_CARD',
        ...((startDate || endDate) && {
          paymentTime: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }),
      },
      ...(paymentId && { paymentId }),
      ...(cardType && { cardType }),
    };

    const [cardPayments, total] = await Promise.all([
      prisma.cardPayment.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          payment: {
            select: {
              id: true,
              paymentMethod: true,
              amount: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      }),
      prisma.cardPayment.count({ where: whereClause }),
    ]);

    return {
      cardPayments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createCardPayment(data: {
    paymentId: number;
    cardType: string;
    lastFourDigits: string;
    transactionId: string;
  }) {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
    });

    if (!payment) {
      throw new BadRequestError('Ödeme bulunamadı');
    }

    if (payment.paymentMethod !== 'CREDIT_CARD' && payment.paymentMethod !== 'DEBIT_CARD') {
      throw new BadRequestError('Bu ödeme kartlı ödeme değil');
    }

    return prisma.cardPayment.create({
      data,
      include: {
        payment: true,
      },
    });
  }

  async getCardPaymentById(id: number) {
    const cardPayment = await prisma.cardPayment.findUnique({
      where: { id },
      include: {
        payment: true,
      },
    });

    if (!cardPayment) {
      throw new BadRequestError('Kart ödemesi bulunamadı');
    }

    return cardPayment;
  }

  async getCardPaymentByPaymentId(paymentId: number) {
    const cardPayment = await prisma.cardPayment.findUnique({
      where: { paymentId },
      include: {
        payment: true,
      },
    });

    if (!cardPayment) {
      throw new BadRequestError('Kart ödemesi bulunamadı');
    }

    return cardPayment;
  }
}
