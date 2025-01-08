import { z } from 'zod';

export const createCustomerSchema = z.object({
  restaurantId: z.number(),
  name: z.string().min(2),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
