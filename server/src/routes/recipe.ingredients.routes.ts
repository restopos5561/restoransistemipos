import express from 'express';
import { RecipeIngredientsController } from '../controllers/recipe.ingredients.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate-request';
import { RecipeIngredientSchema } from '../schemas/recipe.ingredient.schema';

const router = express.Router();
const controller = new RecipeIngredientsController();

// Spesifik route'lar üstte
router.get('/recipe/:recipeId', requireAuth, controller.getIngredientsByRecipeId);

// Genel route'lar altta
router.get('/', requireAuth, controller.getRecipeIngredients);
router.post(
  '/',
  requireAuth,
  validateRequest(RecipeIngredientSchema.create),
  controller.createRecipeIngredient
);
router.get('/:id', requireAuth, controller.getRecipeIngredientById);
router.put(
  '/:id',
  requireAuth,
  validateRequest(RecipeIngredientSchema.update),
  controller.updateRecipeIngredient
);
router.delete('/:id', requireAuth, controller.deleteRecipeIngredient);

export { router as recipeIngredientsRouter };
