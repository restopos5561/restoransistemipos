import { z } from 'zod';

export const ProductSupplierSchema = {
  create: z.object({
    body: z.object({
      productId: z.number(),
      supplierId: z.number(),
      isPrimary: z.boolean(),
      lastPurchasePrice: z.number().nonnegative().optional(),
      supplierProductCode: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      isPrimary: z.boolean().optional(),
      lastPurchasePrice: z.number().nonnegative().optional(),
      supplierProductCode: z.string().optional(),
    }),
  }),
};
