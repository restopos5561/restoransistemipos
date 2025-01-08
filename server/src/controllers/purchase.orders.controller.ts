import { Request, Response } from 'express';
import { PurchaseOrdersService } from '../services/purchase.orders.service';
import { PurchaseOrderStatus } from '@prisma/client';

export class PurchaseOrdersController {
  private purchaseOrdersService: PurchaseOrdersService;

  constructor() {
    this.purchaseOrdersService = new PurchaseOrdersService();
  }

  getPurchaseOrders = async (req: Request, res: Response) => {
    const filters = {
      restaurantId: req.query.restaurantId ? Number(req.query.restaurantId) : undefined,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      supplierId: req.query.supplierId ? Number(req.query.supplierId) : undefined,
      status: req.query.status as PurchaseOrderStatus | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.purchaseOrdersService.getPurchaseOrders(filters);
    res.json({ success: true, data: result });
  };

  createPurchaseOrder = async (req: Request, res: Response) => {
    const result = await this.purchaseOrdersService.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data: result });
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    const result = await this.purchaseOrdersService.updateOrderStatus(
      Number(req.params.id),
      req.body.status
    );
    res.json({ success: true, data: result });
  };

  getPurchaseOrderById = async (req: Request, res: Response) => {
    const result = await this.purchaseOrdersService.getPurchaseOrderById(Number(req.params.id));
    res.json({ success: true, data: result });
  };

  updatePurchaseOrder = async (req: Request, res: Response) => {
    const result = await this.purchaseOrdersService.updatePurchaseOrder(
      Number(req.params.id),
      req.body
    );
    res.json({ success: true, data: result });
  };

  deletePurchaseOrder = async (req: Request, res: Response) => {
    await this.purchaseOrdersService.deletePurchaseOrder(Number(req.params.id));
    res.status(204).send();
  };

  getPurchaseOrdersBySupplierId = async (req: Request, res: Response) => {
    const result = await this.purchaseOrdersService.getPurchaseOrders({
      supplierId: Number(req.params.supplierId),
    });
    res.json({ success: true, data: result });
  };

  getPurchaseOrdersByStatus = async (req: Request, res: Response) => {
    const result = await this.purchaseOrdersService.getPurchaseOrders({
      status: req.params.status as PurchaseOrderStatus,
    });
    res.json({ success: true, data: result });
  };

  getPurchaseOrdersByDateRange = async (req: Request, res: Response) => {
    const result = await this.purchaseOrdersService.getPurchaseOrders({
      startDate: new Date(req.query.startDate as string),
      endDate: new Date(req.query.endDate as string),
    });
    res.json({ success: true, data: result });
  };
}
