import { z } from 'zod';

export const OptionGroupSchema = {
  create: z.object({
    body: z.object({
      productId: z.number().int().positive('Ürün ID gereklidir'),
      name: z.string().min(1, 'Seçenek grubu adı boş olamaz'),
      isRequired: z.boolean(),
      minQuantity: z.number().int().min(0, 'Minimum miktar 0 veya daha büyük olmalıdır'),
      maxQuantity: z.number().int().min(1, 'Maksimum miktar 1 veya daha büyük olmalıdır'),
    }).refine((data) => data.maxQuantity >= data.minQuantity, {
      message: 'Maksimum miktar minimum miktardan küçük olamaz',
      path: ['maxQuantity'],
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(1, 'Seçenek grubu adı boş olamaz').optional(),
      isRequired: z.boolean().optional(),
      minQuantity: z.number().int().min(0, 'Minimum miktar 0 veya daha büyük olmalıdır').optional(),
      maxQuantity: z.number().int().min(1, 'Maksimum miktar 1 veya daha büyük olmalıdır').optional(),
    }).refine((data) => {
      if (data.maxQuantity !== undefined && data.minQuantity !== undefined) {
        return data.maxQuantity >= data.minQuantity;
      }
      return true;
    }, {
      message: 'Maksimum miktar minimum miktardan küçük olamaz',
      path: ['maxQuantity'],
    }),
  }),
}; 