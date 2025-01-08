import { z } from 'zod';
import { OrderStatus, OrderSource } from '@prisma/client';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export const OrderSchema = {
  create: z.object({
    branchId: z.number(),
    restaurantId: z.number(),
    orderSource: z.nativeEnum(OrderSource),
    tableId: z.number().nullable().optional(),
    customerId: z.number().nullable().optional(),
    customerCount: z.number().nullable().optional(),
    notes: z.string().optional(),
    items: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        notes: z.string().optional()
      })
    ).min(1)
  }),

  update: z.object({
    branchId: z.number().optional(),
    orderSource: z.nativeEnum(OrderSource).optional(),
    tableId: z.number().nullable().optional(),
    customerId: z.number().nullable().optional(),
    customerCount: z.number().nullable().optional(),
    notes: z.string().optional(),
    priority: z.boolean().optional(),
    discountAmount: z.number().optional(),
    discountType: z.string().nullable().optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    items: z.array(
      z.object({
        id: z.number().optional(),
        productId: z.number(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
        status: z.nativeEnum(OrderStatus),
      })
    ).optional(),
  }),

  updateStatus: z.object({
    status: z.nativeEnum(OrderStatus),
  }),

  updateNotes: z.object({
    orderNotes: z.string(),
  }),

  bulkDelete: z.object({
    orderIds: z.array(z.number()).min(1),
  }),

  bulkUpdateStatus: z.object({
    orderIds: z.array(z.number()).min(1),
    status: z.nativeEnum(OrderStatus),
  }),

  print: z.object({
    orderIds: z.array(z.number()).min(1),
  }),

  addItems: z.object({
    items: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        note: z.string().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        selectedOptions: z.array(z.number()).optional()
      })
    ).min(1)
  }),
};

export const OrderStatusSchema = {
  update: z.object({
    body: z.object({
      status: z.nativeEnum(OrderStatus),
    }),
  }),
};

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
