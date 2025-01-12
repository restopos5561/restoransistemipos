import { OrderSource, OrderStatus, PaymentStatus } from '@prisma/client';

export interface CreateOrderInput {
  branchId: number;
  restaurantId: number;
  customerId?: number;
  items: {
    productId: number;
    quantity: number;
    notes?: string;
  }[];
  orderSource: OrderSource;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalPriceBeforeDiscounts?: number;
  discountAmount?: number;
  discountType?: 'PERCENTAGE' | 'AMOUNT' | null;
  totalAmount?: number;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  branchId?: number;
  startDate?: string;
  endDate?: string;
} 