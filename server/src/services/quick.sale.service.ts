import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PaymentService } from './payment.service';
import { StockService } from './stock.service';

interface QuickSaleItem {
  productId: number;
  quantity: number;
  note?: string;
}

interface QuickSaleInput {
  branchId: number;
  restaurantId: number;
  items: QuickSaleItem[];
  customerId?: number;
  paymentMethod: PaymentMethod;
  receivedAmount?: number;
  cardPayment?: {
    cardType: string;
    lastFourDigits: string;
    transactionId?: string;
  };
}

export class QuickSaleService {
  private ordersService: OrdersService;
  private paymentService: PaymentService;
  private stockService: StockService;

  constructor() {
    this.ordersService = new OrdersService();
    this.paymentService = new PaymentService();
    this.stockService = new StockService();
  }

  async processQuickSale(data: QuickSaleInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Sipariş oluştur
      const order = await this.ordersService.createOrder({
        branchId: data.branchId,
        restaurantId: data.restaurantId,
        customerId: data.customerId,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.note
        })),
        orderSource: 'IN_STORE',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING
      });

      // 2. Ödeme işlemini gerçekleştir
      const payment = await this.paymentService.createPayment({
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod: data.paymentMethod,
        cardPayment: data.cardPayment
      });

      // 3. Stok düşme işlemini gerçekleştir
      await this.stockService.handleOrderCompletion(order.id);

      // 4. Siparişi tamamlandı olarak işaretle
      const updatedOrder = await this.ordersService.updateOrderStatus(
        order.id,
        OrderStatus.COMPLETED
      );

      return {
        order: updatedOrder,
        payment
      };
    });
  }

  async searchProducts(query: string, branchId: number) {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { barcode: { equals: query } }
        ],
        AND: [
          { isActive: true }
        ]
      },
      include: {
        stocks: {
          where: { branchId }
        },
        category: true
      }
    });
  }

  async getPopularProducts(branchId: number, limit: number = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Son 30 günün popüler ürünleri

    const popularProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          branchId,
          orderTime: {
            gte: startDate
          }
        }
      },
      _count: {
        productId: true
      },
      orderBy: {
        _count: {
          productId: 'desc'
        }
      },
      take: limit
    });

    return prisma.product.findMany({
      where: {
        id: {
          in: popularProducts.map(p => p.productId)
        }
      },
      include: {
        stocks: {
          where: { branchId }
        },
        category: true
      }
    });
  }

  async validateBarcode(barcode: string) {
    const product = await prisma.product.findFirst({
      where: { barcode },
      include: {
        category: true,
        stocks: true
      }
    });

    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    return product;
  }
} 