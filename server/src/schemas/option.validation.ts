import { z } from 'zod';

export const OptionSchema = {
  create: z.object({
    body: z.object({
      optionGroupId: z.number().int().positive('Seçenek grubu ID gereklidir'),
      name: z.string().min(1, 'Seçenek adı boş olamaz'),
      priceAdjustment: z.number().min(0, 'Fiyat farkı 0 veya daha büyük olmalıdır'),
      productId: z.number().int().positive('Ürün ID gereklidir'),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(1, 'Seçenek adı boş olamaz').optional(),
      priceAdjustment: z.number().min(0, 'Fiyat farkı 0 veya daha büyük olmalıdır').optional(),
    }),
  }),
}; 