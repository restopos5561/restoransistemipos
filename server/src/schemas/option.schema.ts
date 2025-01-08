import { z } from 'zod';

export const OptionSchema = {
  create: z.object({
    body: z.object({
      optionGroupId: z.number({
        required_error: 'Seçenek grubu ID gereklidir',
      }),
      name: z
        .string({
          required_error: 'Seçenek adı gereklidir',
        })
        .min(2, 'Seçenek adı en az 2 karakter olmalıdır'),
      priceAdjustment: z
        .number()
        .min(0, 'Fiyat ayarlaması 0 veya daha büyük olmalıdır')
        .optional()
        .default(0),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(2, 'Seçenek adı en az 2 karakter olmalıdır').optional(),
      priceAdjustment: z.number().min(0, 'Fiyat ayarlaması 0 veya daha büyük olmalıdır').optional(),
    }),
  }),
};
