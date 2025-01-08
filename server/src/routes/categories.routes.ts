import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { CategorySchema } from '../schemas/category.schema';

const router = Router();
const controller = new CategoriesController();

router.get('/', requireAuth, controller.getCategories);
router.get('/:id', requireAuth, controller.getCategoryById);
router.post('/', requireAuth, validateRequest(CategorySchema.create), controller.createCategory);
router.put('/:id', requireAuth, validateRequest(CategorySchema.update), controller.updateCategory);
router.delete('/:id', requireAuth, controller.deleteCategory);

export { router as categoriesRouter };
