import { Router } from 'express';
import { RecipesController } from '../controllers/recipes.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const recipesController = new RecipesController();

router.use(requireAuth);

// Spesifik route'ları öne al
router.get('/compare', recipesController.compareRecipes);
router.get('/product/:productId', recipesController.getRecipeByProductId);

// Dinamik parametreli route'lar
router.get('/:id/cost', recipesController.calculateRecipeCost);
router.get('/:id/versions', recipesController.getRecipeVersionHistory);
router.post('/:id/duplicate', recipesController.duplicateRecipe);
router.patch('/:id/ingredients', recipesController.bulkUpdateIngredients);
router.get('/:id', recipesController.getRecipeById);
router.put('/:id', recipesController.updateRecipe);
router.delete('/:id', recipesController.deleteRecipe);

// Genel route'lar
router.get('/', recipesController.getAllRecipes);
router.post('/', recipesController.createRecipe);

export { router as recipesRouter };
