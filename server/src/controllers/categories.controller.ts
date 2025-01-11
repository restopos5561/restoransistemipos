import { Request, Response } from 'express';
import { CategoriesService } from '../services/categories.service';
import { BadRequestError } from '../errors/bad-request-error';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async getCategories(req: Request, res: Response) {
    console.log('Categories Controller - Request Query:', req.query);
    console.log('Categories Controller - Restaurant ID:', req.query.restaurantId);

    const filters = {
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      search: req.query.search?.toString(),
    };

    console.log('Categories Controller - Filters:', filters);
    const categories = await categoriesService.getCategories(filters);
    console.log('Categories Controller - Response:', categories);

    res.json(categories);
  }

  getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoriesService.getCategoryById(Number(id));

    res.status(200).json({
      success: true,
      data: category,
    });
  };

  createCategory = async (req: Request, res: Response) => {
    const category = await categoriesService.createCategory(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  };

  updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoriesService.updateCategory(Number(id), req.body);

    res.status(200).json({
      success: true,
      data: category,
    });
  };

  deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    await categoriesService.deleteCategory(Number(id));
    res.status(204).send();
  };
}
