import { z } from 'zod';

export const RestaurantSchema = {
  create: z.object({
    body: z.object({
      name: z.string().min(2),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(2).optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      isActive: z.boolean().optional(),
    }),
  }),
};
