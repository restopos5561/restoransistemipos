import { z } from 'zod';
import { OrderStatus, OrderSource, PaymentStatus } from '@prisma/client';

export const OrderSchema = {
  create: z.object({
    body: z.object({
      branchId: z.number({
        required_error: 'Şube ID gereklidir',
        invalid_type_error: 'Şube ID sayı olmalıdır'
      }),
      restaurantId: z.number({
        required_error: 'Restoran ID gereklidir',
        invalid_type_error: 'Restoran ID sayı olmalıdır'
      }),
      orderSource: z.nativeEnum(OrderSource, {
        required_error: 'Sipariş kaynağı gereklidir',
        invalid_type_error: 'Geçersiz sipariş kaynağı'
      }),
      tableId: z.number().nullable().optional(),
      customerId: z.number().nullable().optional(),
      customerCount: z.number().nullable().optional(),
      notes: z.string().optional(),
      status: z.nativeEnum(OrderStatus).optional(),
      paymentStatus: z.nativeEnum(PaymentStatus).optional(),
      items: z.array(
        z.object({
          productId: z.number({
            required_error: 'Ürün ID gereklidir',
            invalid_type_error: 'Ürün ID sayı olmalıdır'
          }),
          quantity: z.number({
            required_error: 'Miktar gereklidir',
            invalid_type_error: 'Miktar sayı olmalıdır'
          }).min(1, 'Miktar en az 1 olmalıdır'),
          notes: z.string().optional()
        })
      ).min(1, 'En az bir ürün eklenmelidir')
    })
  }),

  update: z.object({
    body: z.object({
      branchId: z.number().optional(),
      tableId: z.number().nullable().optional(),
      customerId: z.number().nullable().optional(),
      customerCount: z.number().optional(),
      notes: z.string().optional(),
      orderNotes: z.string().optional(),
      priority: z.boolean().optional(),
      status: z.nativeEnum(OrderStatus).optional(),
      discountAmount: z.number().optional(),
      discountType: z.string().nullable().optional(),
      paymentStatus: z.nativeEnum(PaymentStatus).optional(),
      items: z.array(
        z.object({
          id: z.number().optional(),
          productId: z.number(),
          quantity: z.number().min(1),
          notes: z.string().optional(),
          status: z.nativeEnum(OrderStatus).optional(),
          selectedOptions: z.array(z.number()).optional()
        })
      ).optional()
    })
  }),

  updateStatus: z.object({
    body: z.object({
      status: z.nativeEnum(OrderStatus),
    }),
    params: z.object({
      id: z.string({
        required_error: 'Sipariş ID gereklidir'
      })
    })
  }),

  print: z.object({
    orderIds: z.array(z.number()).min(1),
  }),

  addItems: z.object({
    items: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        selectedOptions: z.array(z.number()).optional()
      })
    ).min(1)
  }),

  updateNotes: z.object({
    body: z.object({
      notes: z.string({
        required_error: 'Not alanı gereklidir'
      })
    }),
    params: z.object({
      id: z.string({
        required_error: 'Sipariş ID gereklidir'
      })
    })
  }),

  bulkDelete: z.object({
    orderIds: z.array(z.number()).min(1, 'En az bir sipariş seçilmelidir')
  }),

  bulkUpdateStatus: z.object({
    orderIds: z.array(z.number()).min(1, 'En az bir sipariş seçilmelidir'),
    status: z.nativeEnum(OrderStatus, {
      required_error: 'Sipariş durumu gereklidir'
    })
  }),
};

export const OrderStatusSchema = {
  update: z.object({
    body: z.object({
      status: z.nativeEnum(OrderStatus),
    }),
    params: z.object({
      id: z.string({
        required_error: 'Sipariş ID gereklidir'
      })
    })
  }),
};

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
