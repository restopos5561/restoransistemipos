import { Request, Response } from 'express';
import { CategoriesService } from '../services/categories.service';

export class CategoriesController {
  private categoriesService: CategoriesService;

  constructor() {
    this.categoriesService = new CategoriesService();
  }

  getCategories = async (req: Request, res: Response) => {
    const filters = {
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.categoriesService.getCategories(filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await this.categoriesService.getCategoryById(Number(id));

    res.status(200).json({
      success: true,
      data: category,
    });
  };

  createCategory = async (req: Request, res: Response) => {
    const category = await this.categoriesService.createCategory(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  };

  updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await this.categoriesService.updateCategory(Number(id), req.body);

    res.status(200).json({
      success: true,
      data: category,
    });
  };

  deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.categoriesService.deleteCategory(Number(id));
    res.status(204).send();
  };
}
