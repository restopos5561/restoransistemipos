import { z } from 'zod';
import { TableStatus } from '@prisma/client';

export const TableSchema = {
  create: z.object({
    body: z.object({
      branchId: z.number().int().positive(),
      tableNumber: z.string().min(1),
      capacity: z.number().int().positive().optional(),
      location: z.string().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.coerce.number({
        required_error: 'Masa ID gereklidir'
      })
    }),
    body: z.object({
      tableNumber: z.string().min(1).optional(),
      capacity: z.number().int().positive().optional(),
      location: z.string().optional(),
      isActive: z.boolean().optional(),
      positionX: z.number().optional(),
      positionY: z.number().optional(),
    }),
  }),

  updateStatus: z.object({
    params: z.object({
      id: z.coerce.number({
        required_error: 'Masa ID gereklidir'
      })
    }),
    body: z.object({
      status: z.nativeEnum(TableStatus),
    }),
  }),

  updatePosition: z.object({
    params: z.object({
      id: z.coerce.number({
        required_error: 'Masa ID gereklidir'
      })
    }),
    body: z.object({
      x: z.number(),
      y: z.number()
    }),
  }),

  merge: z.object({
    body: z.object({
      mainTableId: z.number().int().positive(),
      tableIdsToMerge: z.array(z.number().int().positive()).min(1, 'En az bir masa seçilmelidir'),
    }),
  }),

  transfer: z.object({
    body: z.object({
      fromTableId: z.number().int().positive(),
      toTableId: z.number().int().positive(),
    }),
  }),

  split: z.object({
    body: z.object({
      newCapacity: z.number().min(1).max(99),
    }),
    params: z.object({
      id: z.string(),
    }),
  }),
};
