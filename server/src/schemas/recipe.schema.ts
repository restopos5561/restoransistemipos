import { z } from 'zod';

export const createRecipeSchema = z.object({
  productId: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      cost: z.number().nonnegative(),
      waste: z.number().min(0).max(100),
    })
  ),
});

export const updateRecipeSchema = z.object({
  ingredients: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      cost: z.number().nonnegative(),
      waste: z.number().min(0).max(100),
    })
  ),
});

export const duplicateRecipeSchema = z.object({
  newProductId: z.number(),
});

export const bulkUpdateIngredientsSchema = z.object({
  ingredients: z.array(
    z.object({
      id: z.number(),
      quantity: z.number().positive(),
      cost: z.number().nonnegative(),
      waste: z.number().min(0).max(100),
    })
  ),
});
