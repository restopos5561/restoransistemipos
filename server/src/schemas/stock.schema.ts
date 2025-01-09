import { z } from 'zod';
import { StockTransactionType } from '@prisma/client';

export const StockSchema = {
  getStocks: z.object({
    query: z.object({
      productId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      restaurantId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      branchId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      lowStock: z
        .string()
        .optional()
        .transform((val) => val === 'true'),
      page: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 10)),
      search: z.string().optional(),
    }),
  }),

  getStockById: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
  }),

  getStockHistory: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
  }),

  updateQuantity: z.object({
    params: z.object({
      id: z.string().transform((val) => Number(val)),
    }),
    body: z.object({
      quantity: z.number().int().positive(),
      type: z.nativeEnum(StockTransactionType),
      notes: z.string().optional(),
    }),
  }),

  getMovements: z.object({
    query: z.object({
      restaurantId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      branchId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      productId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
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

  getExpiring: z.object({
    query: z.object({
      restaurantId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      branchId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      daysToExpiration: z.string().transform((val) => Number(val)),
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

  transferStock: z.object({
    body: z.object({
      fromBranchId: z.number(),
      toBranchId: z.number(),
      productId: z.number(),
      quantity: z.number(),
      transferBy: z.number(),
      notes: z.string().optional(),
    }),
  }),

  stockCount: z.object({
    body: z.object({
      branchId: z.number(),
      countedBy: z.number(),
      countedDate: z.string(),
      products: z.array(
        z.object({
          productId: z.number(),
          countedQuantity: z.number(),
          countedStockId: z.number(),
        })
      ),
    }),
  }),

  getLowStock: z.object({
    query: z.object({
      branchId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
      restaurantId: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
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
