import { Router } from 'express';
import {
  getProductOptions,
  addOptionGroup,
  addOption,
  updateOption,
  deleteOption,
} from '../controllers/options.controller';
import { validateRequest } from '../middleware/validate-request';
import { OptionGroupSchema } from '../schemas/option.group.validation';
import { OptionSchema } from '../schemas/option.validation';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Tüm route'lar için auth middleware'i
router.use(requireAuth);

router.get('/products/:productId/options', getProductOptions);
router.post('/products/:productId/options/groups', validateRequest(OptionGroupSchema.create), addOptionGroup);
router.post('/products/:productId/options', validateRequest(OptionSchema.create), addOption);
router.put('/products/:productId/options/:optionId', validateRequest(OptionSchema.update), updateOption);
router.delete('/products/:productId/options/:optionId', deleteOption);

export default router; 