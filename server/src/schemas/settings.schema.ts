import { z } from 'zod';

export const SettingsSchema = {
  create: z.object({
    body: z.object({
      restaurantId: z.number(),
      appName: z.string().optional(),
      appLogoUrl: z.string().url().nullable().optional(),
      currency: z.string(),
      timezone: z.string(),
      dailyCloseTime: z.string().optional(),
      workingHours: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      appName: z.string().optional(),
      appLogoUrl: z.string().url().nullable().optional(),
      currency: z.string().optional(),
      timezone: z.string().optional(),
      dailyCloseTime: z.string().optional(),
      workingHours: z.string().optional(),
    }),
  }),
};
