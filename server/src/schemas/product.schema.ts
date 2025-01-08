import { z } from 'zod';

export const ProductSchema = {
  create: z.object({
    body: z.object({
      restaurantId: z.number().int().positive(),
      categoryId: z.number().int().positive(),
      name: z.string().min(1, 'Ürün adı boş olamaz'),
      description: z.string().optional(),
      price: z.number().positive("Fiyat 0'dan büyük olmalıdır"),
      image: z.string().url().optional(),
      isActive: z.boolean().optional(),
      preparationTime: z.number().int().min(0).optional(),
      stockTracking: z.boolean().optional(),
      stockQuantity: z.number().int().min(0).optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      categoryId: z.number().int().positive().optional(),
      name: z.string().min(1, 'Ürün adı boş olamaz').optional(),
      description: z.string().optional(),
      price: z.number().positive("Fiyat 0'dan büyük olmalıdır").optional(),
      image: z.string().url().optional(),
      isActive: z.boolean().optional(),
      preparationTime: z.number().int().min(0).optional(),
      stockTracking: z.boolean().optional(),
      stockQuantity: z.number().int().min(0).optional(),
    }),
  }),

  variant: z.object({
    body: z.object({
      name: z.string().min(1, 'Varyant adı boş olamaz'),
      value: z.string().min(1, 'Varyant değeri boş olamaz'),
      priceAdjustment: z.number().optional(),
    }),
  }),

  optionGroup: z.object({
    body: z
      .object({
        name: z.string().min(1, 'Seçenek grubu adı boş olamaz'),
        isRequired: z.boolean(),
        minQuantity: z.number().int().min(0),
        maxQuantity: z.number().int().min(1),
      })
      .refine((data) => data.maxQuantity >= data.minQuantity, {
        message: 'Maksimum miktar minimum miktardan küçük olamaz',
      }),
  }),

  option: z.object({
    body: z.object({
      optionGroupId: z.number().int().positive(),
      name: z.string().min(1, 'Seçenek adı boş olamaz'),
      priceAdjustment: z.number(),
    }),
  }),

  price: z.object({
    body: z.object({
      newPrice: z.number().positive("Yeni fiyat 0'dan büyük olmalıdır"),
    }),
  }),
};
