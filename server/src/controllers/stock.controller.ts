import { Request, Response } from 'express';
import { StockService } from '../services/stock.service';

export class StockController {
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService();
  }

  getStocks = async (req: Request, res: Response) => {
    const filters = {
      productId: req.query.productId ? Number(req.query.productId) : undefined,
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      lowStock: req.query.lowStock === 'true',
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.stockService.getStocks(filters);
    res.json({
      success: true,
      data: result,
    });
  };

  getStockById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const stock = await this.stockService.getStockById(Number(id));
    res.json({
      success: true,
      data: stock,
    });
  };

  updateStockQuantity = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity, type, notes } = req.body;

    const stock = await this.stockService.updateStockQuantity(Number(id), {
      quantity,
      type,
      notes,
    });

    res.json({
      success: true,
      data: {
        message: 'Stok Güncelleme İşlemi başarılı.',
        stock,
      },
    });
  };

  getStockHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const history = await this.stockService.getStockHistory(Number(id));
    res.json({
      success: true,
      data: history,
    });
  };

  getStockMovements = async (req: Request, res: Response) => {
    const filters = {
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      productId: req.query.productId ? Number(req.query.productId) : undefined,
      startDate: req.query.startDate?.toString(),
      endDate: req.query.endDate?.toString(),
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.stockService.getStockMovements(filters);
    res.json({
      success: true,
      data: result,
    });
  };

  getExpiringStock = async (req: Request, res: Response) => {
    const filters = {
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      daysToExpiration: Number(req.query.daysToExpiration),
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.stockService.getExpiringStock(filters);
    res.json({
      success: true,
      data: result,
    });
  };

  createTransaction = async (req: Request, res: Response) => {
    const result = await this.stockService.createTransaction(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  };

  updateThreshold = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.stockService.updateThreshold(Number(id), req.body);
    res.json({
      success: true,
      data: result,
    });
  };

  getBranchStock = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const result = await this.stockService.getBranchStock(Number(branchId));
    res.json({
      success: true,
      data: result,
    });
  };

  getThresholdAlerts = async (req: Request, res: Response) => {
    const filters = {
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.stockService.getThresholdAlerts(filters);
    res.json({
      success: true,
      data: result,
    });
  };

  transferStock = async (req: Request, res: Response) => {
    const result = await this.stockService.transferStock(req.body);
    res.json({
      success: true,
      data: result,
    });
  };

  createStockCount = async (req: Request, res: Response) => {
    const result = await this.stockService.createStockCount(req.body);
    res.json({
      success: true,
      data: result,
    });
  };

  getLowStock = async (req: Request, res: Response) => {
    const filters = {
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.stockService.getLowStock(filters);
    res.json({
      success: true,
      data: result,
    });
  };
}
