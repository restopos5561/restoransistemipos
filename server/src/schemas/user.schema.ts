import { z } from 'zod';
import { Role } from '@prisma/client';

export const UserSchema = {
  create: z.object({
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.nativeEnum(Role),
      branchId: z.number().optional(),
      restaurantId: z.number(),
      permissions: z.array(z.string()).optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      role: z.nativeEnum(Role).optional(),
      branchId: z.number().optional(),
      restaurantId: z.number().optional(),
    }),
  }),

  updatePermissions: z.object({
    body: z.object({
      permissions: z.array(z.string()),
    }),
  }),

  query: z.object({
    branchId: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    role: z.nativeEnum(Role).optional(),
    isActive: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    search: z.string().optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 10)),
    sort: z
      .string()
      .optional()
      .refine((val) => !val || /^[\w]+(:(asc|desc))?(,[\w]+(:(asc|desc))?)*$/.test(val), {
        message: 'Invalid sort format. Example: name:asc,createdAt:desc',
      }),
  }),

  batchCreate: z.object({
    body: z.object({
      users: z.array(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.nativeEnum(Role),
          branchId: z.number().optional(),
          restaurantId: z.number(),
          permissions: z.array(z.string()).optional(),
        })
      ),
    }),
  }),

  batchUpdate: z.object({
    body: z.object({
      users: z.array(
        z.object({
          id: z.number(),
          name: z.string().min(2).optional(),
          email: z.string().email().optional(),
          password: z.string().min(6).optional(),
          role: z.nativeEnum(Role).optional(),
          branchId: z.number().optional(),
          restaurantId: z.number().optional(),
        })
      ),
    }),
  }),

  batchDelete: z.object({
    body: z.object({
      ids: z.array(z.number()).min(1, 'At least one ID is required'),
    }),
  }),

  branchAssignment: z.object({
    body: z.object({
      userId: z.number().int().positive(),
      branchId: z.number().int().positive()
    })
  })
};
