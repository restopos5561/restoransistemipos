import { z } from 'zod';

export const OptionGroupSchema = {
  create: z.object({
    body: z.object({
      productId: z.number({
        required_error: 'Ürün ID gereklidir',
      }),
      name: z
        .string({
          required_error: 'Seçenek grubu adı gereklidir',
        })
        .min(2, 'Seçenek grubu adı en az 2 karakter olmalıdır'),
      isRequired: z.boolean().default(false),
      minQuantity: z.number().min(0).optional().default(0),
      maxQuantity: z.number().min(1).optional().default(999),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(2, 'Seçenek grubu adı en az 2 karakter olmalıdır').optional(),
      isRequired: z.boolean().optional(),
      minQuantity: z.number().min(0).optional(),
      maxQuantity: z.number().min(1).optional(),
    }),
  }),
};
