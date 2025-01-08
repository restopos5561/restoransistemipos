import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/account.service';
import { BadRequestError } from '../errors/bad-request-error';

const accountService = new AccountService();

export class AccountController {
  async getAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        accountType: req.query.accountType as any,
        supplierId: req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined,
        customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
        restaurantId: req.query.restaurantId
          ? parseInt(req.query.restaurantId as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await accountService.getAccounts(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await accountService.createAccount(req.body);
      res.status(201).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz hesap ID');
      }

      const account = await accountService.getAccountById(id);
      if (!account) {
        throw new BadRequestError('Hesap bulunamadı');
      }

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz hesap ID');
      }

      const account = await accountService.updateAccount(id, req.body);
      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz hesap ID');
      }

      await accountService.deleteAccount(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getAccountBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        id: req.query.id ? parseInt(req.query.id as string) : undefined,
        accountType: req.query.accountType as any,
        supplierId: req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined,
        customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
        restaurantId: req.query.restaurantId
          ? parseInt(req.query.restaurantId as string)
          : undefined,
      };

      const result = await accountService.getAccountBalance(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
