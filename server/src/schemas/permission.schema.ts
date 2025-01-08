import { z } from 'zod';

export const PermissionSchema = {
  create: z.object({
    body: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }),
  }),

  updateUserPermissions: z.object({
    body: z.object({
      permissions: z.array(
        z.object({
          permissionId: z.number(),
          allowed: z.boolean(),
        })
      ),
    }),
  }),
};
