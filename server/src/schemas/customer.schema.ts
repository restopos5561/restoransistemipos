import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    restaurantId: z.number(),
    name: z.string().min(2),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  })
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  })
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body'];
