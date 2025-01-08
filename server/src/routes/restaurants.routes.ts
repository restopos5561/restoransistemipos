import { Router } from 'express';
import { RestaurantsController } from '../controllers/restaurants.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { RestaurantSchema } from '../schemas/restaurant.schema';

const router = Router();
const controller = new RestaurantsController();

router.get('/', requireAuth, controller.getRestaurants);
router.get('/:id', requireAuth, controller.getRestaurantById);
router.post(
  '/',
  requireAuth,
  validateRequest(RestaurantSchema.create),
  controller.createRestaurant
);
router.put(
  '/:id',
  requireAuth,
  validateRequest(RestaurantSchema.update),
  controller.updateRestaurant
);
router.delete('/:id', requireAuth, controller.deleteRestaurant);

export { router as restaurantsRouter };
