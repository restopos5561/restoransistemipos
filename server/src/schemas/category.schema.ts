import { z } from 'zod';

export const CategorySchema = {
  create: z.object({
    body: z.object({
      restaurantId: z.number().int().positive(),
      name: z.string().min(1, 'Kategori adı boş olamaz'),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(1, 'Kategori adı boş olamaz'),
    }),
  }),
};
