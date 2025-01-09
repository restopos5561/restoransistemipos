import { Router } from 'express';
import { BranchesController } from '../controllers/branches.controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/auth.middleware';
import { BranchSchema } from '../schemas/branch.schema';

const router = Router();
const controller = new BranchesController();

router.get('/current', requireAuth, controller.getCurrentBranch);

router.get('/', requireAuth, controller.getBranches);
router.get('/:id', requireAuth, controller.getBranchById);
router.post(
  '/restaurant/:restaurantId',
  requireAuth,
  validateRequest(BranchSchema.create),
  controller.createBranch
);
router.put('/:id', requireAuth, validateRequest(BranchSchema.update), controller.updateBranch);
router.delete('/:id', requireAuth, controller.deleteBranch);

export { router as branchesRouter };
