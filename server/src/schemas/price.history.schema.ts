import { z } from 'zod';

export const PriceHistorySchema = {
  create: z.object({
    body: z.object({
      productId: z.number(),
      oldPrice: z.number().nonnegative(),
      newPrice: z.number().nonnegative(),
      startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Geçerli bir tarih formatı olmalıdır',
      }),
    }),
  }),
};
