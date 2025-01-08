import { z } from 'zod';
import { OrderItemStatus, OrderItemType } from '@prisma/client';

export const OrderItemSchema = {
  create: z.object({
    body: z.object({
      orderId: z.number({
        required_error: 'Sipariş ID gereklidir',
      }),
      productId: z.number({
        required_error: 'Ürün ID gereklidir',
      }),
      quantity: z.number().min(1, 'Miktar en az 1 olmalıdır'),
      unitPrice: z.number().min(0, 'Birim fiyat 0 veya daha büyük olmalıdır'),
      totalPrice: z.number().min(0, 'Toplam fiyat 0 veya daha büyük olmalıdır').optional(),
      discount: z.number().min(0, 'İndirim 0 veya daha büyük olmalıdır').optional().default(0),
      isVoid: z.boolean().optional().default(false),
      type: z
        .nativeEnum(OrderItemType, {
          errorMap: () => ({ message: 'Geçersiz sipariş kalemi türü' }),
        })
        .default('SALE'),
      orderItemStatus: z
        .nativeEnum(OrderItemStatus, {
          errorMap: () => ({ message: 'Geçersiz sipariş kalemi durumu' }),
        })
        .default('PENDING'),
      preparationStartTime: z
        .string()
        .datetime({ message: 'Geçersiz tarih formatı' })
        .nullable()
        .optional(),
      preparationEndTime: z
        .string()
        .datetime({ message: 'Geçersiz tarih formatı' })
        .nullable()
        .optional(),
      selectedOptions: z
        .array(
          z.object({
            id: z.number({
              required_error: 'Seçenek ID gereklidir',
            }),
          })
        )
        .optional()
        .default([]),
    }),
  }),

  update: z.object({
    body: z.object({
      quantity: z.number().min(1, 'Miktar en az 1 olmalıdır').optional(),
      unitPrice: z.number().min(0, 'Birim fiyat 0 veya daha büyük olmalıdır').optional(),
      totalPrice: z.number().min(0, 'Toplam fiyat 0 veya daha büyük olmalıdır').optional(),
      discount: z.number().min(0, 'İndirim 0 veya daha büyük olmalıdır').optional(),
      isVoid: z.boolean().optional(),
      type: z
        .nativeEnum(OrderItemType, {
          errorMap: () => ({ message: 'Geçersiz sipariş kalemi türü' }),
        })
        .optional(),
      orderItemStatus: z
        .nativeEnum(OrderItemStatus, {
          errorMap: () => ({ message: 'Geçersiz sipariş kalemi durumu' }),
        })
        .optional(),
      preparationStartTime: z
        .string()
        .datetime({ message: 'Geçersiz tarih formatı' })
        .nullable()
        .optional(),
      preparationEndTime: z
        .string()
        .datetime({ message: 'Geçersiz tarih formatı' })
        .nullable()
        .optional(),
      selectedOptions: z
        .array(
          z.object({
            id: z.number({
              required_error: 'Seçenek ID gereklidir',
            }),
          })
        )
        .optional(),
    }),
  }),

  updateStatus: z.object({
    body: z.object({
      status: z.nativeEnum(OrderItemStatus, {
        errorMap: () => ({ message: 'Geçersiz sipariş kalemi durumu' }),
      }),
      preparationStartTime: z
        .string()
        .datetime({ message: 'Geçersiz tarih formatı' })
        .nullable()
        .optional(),
      preparationEndTime: z
        .string()
        .datetime({ message: 'Geçersiz tarih formatı' })
        .nullable()
        .optional(),
    }),
  }),

  void: z.object({
    body: z.object({
      isVoid: z.literal(true),
    }),
  }),
};
