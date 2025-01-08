import { z } from 'zod';
import { PurchaseOrderStatus } from '@prisma/client';

export const PurchaseOrderSchema = {
  getPurchaseOrders: z.object({
    query: z.object({
      restaurantId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      branchId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      supplierId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      status: z.nativeEnum(PurchaseOrderStatus).optional(),
      page: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
    }),
  }),

  createPurchaseOrder: z.object({
    body: z.object({
      supplierId: z.number(),
      restaurantId: z.number(),
      branchId: z.number(),
      expectedDeliveryDate: z.string().optional(),
      notes: z.string().optional(),
      items: z
        .array(
          z.object({
            productId: z.number(),
            quantity: z.number().positive("Miktar 0'dan büyük olmalıdır"),
            unitPrice: z.number().positive("Birim fiyat 0'dan büyük olmalıdır"),
          })
        )
        .min(1, 'En az bir ürün eklenmelidir'),
    }),
  }),

  getById: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
    body: z.object({
      expectedDeliveryDate: z.string().optional(),
      notes: z.string().optional(),
      items: z
        .array(
          z.object({
            productId: z.number(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
          })
        )
        .optional(),
    }),
  }),

  updateStatus: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
    body: z.object({
      status: z.nativeEnum(PurchaseOrderStatus),
    }),
  }),

  getByStatus: z.object({
    params: z.object({
      status: z.nativeEnum(PurchaseOrderStatus),
    }),
  }),

  getByDateRange: z.object({
    query: z.object({
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().transform((val) => new Date(val)),
    }),
  }),

  getBySupplierId: z.object({
    params: z.object({
      supplierId: z.string().transform((val) => Number(val)),
    }),
  }),

  delete: z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  }),
};
