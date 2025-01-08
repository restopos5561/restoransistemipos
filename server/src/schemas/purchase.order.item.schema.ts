import { z } from 'zod';

export const PurchaseOrderItemSchema = {
  create: z.object({
    body: z.object({
      purchaseOrderId: z.number(),
      productId: z.number(),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      totalPrice: z.number().nonnegative(),
    }),
  }),

  update: z.object({
    body: z.object({
      quantity: z.number().positive().optional(),
      unitPrice: z.number().nonnegative().optional(),
      totalPrice: z.number().nonnegative().optional(),
    }),
  }),
};
