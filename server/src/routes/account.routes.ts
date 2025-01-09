import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';

const router = Router();
const controller = new AccountController();

// Özel route'ları önce tanımla
router.get('/balance', controller.getAccountBalance);

// Genel route'ları sonra tanımla
router.get('/', controller.getAccounts);
router.get('/:id', controller.getAccountById);
router.post('/', controller.createAccount);
router.put('/:id', controller.updateAccount);
router.delete('/:id', controller.deleteAccount);

export default router;
