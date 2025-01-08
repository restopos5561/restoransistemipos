import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';
import { BadRequestError } from '../errors/bad-request-error';

const settingsService = new SettingsService();

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        restaurantId: req.query.restaurantId
          ? parseInt(req.query.restaurantId as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await settingsService.getSettings(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.createSettings(req.body);
      res.status(201).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettingsById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const settings = await settingsService.getSettingsById(id);
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const settings = await settingsService.updateSettings(id, req.body);
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      await settingsService.deleteSettings(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getSettingsByRestaurantId(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) {
        throw new BadRequestError('Geçersiz restoran ID formatı');
      }

      const settings = await settingsService.getSettingsByRestaurantId(restaurantId);
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }
}
