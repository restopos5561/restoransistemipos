import { Request, Response, NextFunction } from 'express';
import { RecipeIngredientsService } from '../services/recipe.ingredients.service';
import { BadRequestError } from '../errors/bad-request-error';

const recipeIngredientsService = new RecipeIngredientsService();

export class RecipeIngredientsController {
  async getRecipeIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        recipeId: req.query.recipeId ? parseInt(req.query.recipeId as string) : undefined,
        productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await recipeIngredientsService.getRecipeIngredients(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipeIngredientById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const ingredient = await recipeIngredientsService.getRecipeIngredientById(id);
      res.json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRecipeIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredient = await recipeIngredientsService.createRecipeIngredient(req.body);
      res.status(201).json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRecipeIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const ingredient = await recipeIngredientsService.updateRecipeIngredient(id, req.body);
      res.json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecipeIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      await recipeIngredientsService.deleteRecipeIngredient(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getIngredientsByRecipeId(req: Request, res: Response, next: NextFunction) {
    try {
      const recipeId = parseInt(req.params.recipeId);
      if (isNaN(recipeId)) {
        throw new BadRequestError('Geçersiz reçete ID formatı');
      }

      const ingredients = await recipeIngredientsService.getIngredientsByRecipeId(recipeId);
      res.json({
        success: true,
        data: ingredients,
      });
    } catch (error) {
      next(error);
    }
  }
}
