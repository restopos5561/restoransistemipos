import { Router } from 'express';
import { AccountTransactionController } from '../controllers/account.transaction.controller';

const router = Router();
const controller = new AccountTransactionController();

// GET /accounts/transactions - Tüm hesap hareketlerini listele
router.get('/', controller.getTransactions);

// POST /accounts/transactions - Yeni hesap hareketi oluştur
router.post('/', controller.createTransaction);

// GET /accounts/transactions/:id - Hesap hareketi detayı getir
router.get('/:id', controller.getTransactionById);

// GET /accounts/transactions/account/:accountId - Hesaba ait hareketleri getir
router.get('/account/:accountId', controller.getTransactionsByAccountId);

export default router;
