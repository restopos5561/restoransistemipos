import { Request, Response, NextFunction } from 'express';
import { AccountTransactionService } from '../services/account.transaction.service';
import { BadRequestError } from '../errors/bad-request-error';
import { PrismaClient } from '@prisma/client';

const accountTransactionService = new AccountTransactionService();
const prisma = new PrismaClient();

export class AccountTransactionController {
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        accountId: req.query.accountId ? parseInt(req.query.accountId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        transactionType: req.query.transactionType as any,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await accountTransactionService.getTransactions(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await accountTransactionService.createTransaction(req.body);
      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz işlem ID');
      }

      const transaction = await accountTransactionService.getTransactionById(id);
      if (!transaction) {
        throw new BadRequestError('İşlem bulunamadı');
      }

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionsByAccountId(req: Request, res: Response, next: NextFunction) {
    try {
      const accountId = parseInt(req.params.accountId);
      if (isNaN(accountId)) {
        throw new BadRequestError('Geçersiz hesap ID');
      }

      const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined;
      if (!restaurantId) {
        throw new BadRequestError('Restaurant ID gerekli');
      }

      // Önce hesabın restaurantId'sini kontrol et
      const account = await prisma.account.findFirst({
        where: { 
          id: accountId,
          restaurantId
        }
      });

      if (!account) {
        throw new BadRequestError('Hesap bulunamadı');
      }

      const transactions = await accountTransactionService.getTransactionsByAccountId(accountId);
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}
