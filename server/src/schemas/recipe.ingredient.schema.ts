import { z } from 'zod';

export const RecipeIngredientSchema = {
  create: z.object({
    body: z.object({
      recipeId: z.number(),
      name: z.string().min(1),
      quantity: z.string().regex(/^\d+(\.\d+)?\s*[a-zA-Z]*$/, {
        message: "Miktar sayı ve birim formatında olmalıdır (örn: '250 gram')",
      }),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z.string().min(1).optional(),
      quantity: z
        .string()
        .regex(/^\d+(\.\d+)?\s*[a-zA-Z]*$/, {
          message: "Miktar sayı ve birim formatında olmalıdır (örn: '250 gram')",
        })
        .optional(),
    }),
  }),
};
