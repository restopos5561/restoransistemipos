import { z } from 'zod';

export const CardPaymentSchema = {
  create: z.object({
    body: z.object({
      paymentId: z.number({
        required_error: 'Ödeme ID gerekli',
        invalid_type_error: 'Ödeme ID sayı olmalı',
      }),
      cardType: z
        .string({
          required_error: 'Kart tipi gerekli',
        })
        .min(1, 'Kart tipi boş olamaz'),
      lastFourDigits: z
        .string({
          required_error: 'Son 4 hane gerekli',
        })
        .length(4, 'Son 4 hane 4 karakter olmalı'),
      transactionId: z
        .string({
          required_error: 'İşlem ID gerekli',
        })
        .min(1, 'İşlem ID boş olamaz'),
    }),
  }),

  filters: z.object({
    query: z.object({
      paymentId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      orderId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      startDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
      endDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
      cardType: z.string().optional(),
      page: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 10)),
    }),
  }),
};
