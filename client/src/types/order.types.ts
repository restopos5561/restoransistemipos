import { OrderStatus, OrderSource, PaymentStatus } from '../types/enums';

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

export interface OrderCreateParams {
  branchId: number;
  orderSource: OrderSource;
  tableId?: number | null;
  customerId?: number | null;
  customerCount?: number | null;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    notes?: string;
    status?: OrderStatus;
  }[];
}

export interface OrderUpdateParams {
  branchId?: number;
  orderSource?: OrderSource;
  tableId?: number | null;
  customerId?: number | null;
  customerCount?: number | null;
  notes?: string;
  priority?: boolean;
  discountAmount?: number;
  discountType?: string | null;
  paymentStatus?: PaymentStatus;
  items?: {
    id?: number;
    productId: number;
    quantity: number;
    notes?: string;
    status: OrderStatus;
  }[];
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  branchId: number;
  restaurantId: number;
  orderSource: OrderSource;
  status: OrderStatus;
  table?: {
    id: number;
    number: string;
  };
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  customerCount?: number;
  notes: string;
  items: Array<{
    id: number;
    productId: number;
    product: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
    notes: string;
    totalPrice: number;
    status: OrderStatus;
  }>;
  totalAmount: number;
  totalPriceBeforeDiscounts: number;
  orderTime: string;
  openingTime: string;
  closingTime?: string;
  completedAt?: string;
  tableId?: number;
  customerId?: number;
  waiterId?: number;
  orderNotes: string;
  discountAmount: number;
  discountType?: string | null;
  paymentStatus: PaymentStatus;
  priority: boolean;
}

export interface OrderListResponse {
  success: boolean;
  data: OrderDetail[];
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
} 