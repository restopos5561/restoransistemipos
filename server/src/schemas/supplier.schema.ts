import { z } from 'zod';

export const SupplierSchema = {
  getSuppliers: z.object({
    query: z.object({
      restaurantId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      search: z.string().optional(),
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

  getSupplierById: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
  }),

  createSupplier: z.object({
    body: z.object({
      restaurantId: z.number(),
      name: z.string().min(1, 'Tedarikçi adı zorunludur'),
      contactName: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email('Geçersiz email formatı').optional(),
    }),
  }),

  updateSupplier: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
    body: z.object({
      name: z.string().min(1, 'Tedarikçi adı zorunludur').optional(),
      contactName: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email('Geçersiz email formatı').optional(),
    }),
  }),

  deleteSupplier: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
  }),

  addProduct: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
    body: z.object({
      productId: z.number(),
      isPrimary: z.boolean().optional(),
      lastPurchasePrice: z.number().optional(),
      supplierProductCode: z.string().optional(),
    }),
  }),

  getByProduct: z.object({
    params: z.object({
      productId: z.string().transform((val) => Number(val)),
    }),
  }),
};
