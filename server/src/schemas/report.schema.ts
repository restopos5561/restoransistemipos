import { z } from 'zod';
import { Role } from '@prisma/client';

export const ReportSchema = {
  dailySales: z.object({
    query: z.object({
      date: z
        .string()
        .transform((val) => new Date(val))
        .optional()
        .default(new Date().toISOString()),
      branchId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    }),
  }),

  monthlySales: z.object({
    query: z.object({
      month: z.coerce.number().int().min(1).max(12),
      year: z.coerce.number().int().min(2000),
      branchId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    }),
  }),

  productSales: z.object({
    query: z.object({
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().transform((val) => new Date(val)),
      productId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
      categoryId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
      branchId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    }),
  }),

  staffReport: z.object({
    query: z.object({
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().transform((val) => new Date(val)),
      branchId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
      role: z.nativeEnum(Role).optional(),
    }),
  }),

  yearlySales: z.object({
    query: z.object({
      year: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
      branchId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    }),
  }),

  tableReport: z.object({
    query: z.object({
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().transform((val) => new Date(val)),
      branchId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
      tableId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    }),
  }),
};
