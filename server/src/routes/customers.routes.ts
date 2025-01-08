import { Router } from 'express';
import { CustomersController } from '../controllers/customers.controller';
import { validateRequest } from '../middleware/validate-request';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema';

const router = Router();
const customersController = new CustomersController();

router.get('/', customersController.getCustomers.bind(customersController));
router.post(
  '/',
  validateRequest(createCustomerSchema),
  customersController.createCustomer.bind(customersController)
);
router.get('/:id', customersController.getCustomerById.bind(customersController));
router.put(
  '/:id',
  validateRequest(updateCustomerSchema),
  customersController.updateCustomer.bind(customersController)
);
router.delete('/:id', customersController.deleteCustomer.bind(customersController));
router.get('/:id/orders', customersController.getCustomerOrders.bind(customersController));

export default router;
