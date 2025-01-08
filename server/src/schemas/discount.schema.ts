import { z } from 'zod';
import { DiscountType } from '@prisma/client';

export const DiscountSchema = {
  create: z.object({
    body: z.object({
      orderId: z.number().optional(),
      orderItemId: z.number().optional(),
      discountType: z.enum([
        DiscountType.PERCENTAGE,
        DiscountType.FIXED_AMOUNT,
        DiscountType.BUY_X_GET_Y_FREE,
      ]),
      discountAmount: z.number().min(0),
      note: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      discountType: z
        .enum([DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT, DiscountType.BUY_X_GET_Y_FREE])
        .optional(),
      discountAmount: z.number().min(0).optional(),
      note: z.string().optional(),
    }),
  }),
};
