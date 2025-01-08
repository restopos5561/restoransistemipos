import { z } from 'zod';

export const BranchSchema = {
  create: z.object({
    body: z.object({
      name: z.string().min(2),
      address: z.string().optional(),
      isMainBranch: z.boolean().optional(),
      settings: z
        .object({
          currency: z.string().optional(),
          timezone: z.string().optional(),
          dailyCloseTime: z.string().optional(),
          workingHours: z.string().optional(),
        })
        .optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(2).optional(),
      address: z.string().optional(),
      isActive: z.boolean().optional(),
      isMainBranch: z.boolean().optional(),
      settings: z
        .object({
          currency: z.string().optional(),
          timezone: z.string().optional(),
          dailyCloseTime: z.string().optional(),
          workingHours: z.string().optional(),
        })
        .optional(),
    }),
  }),
};
