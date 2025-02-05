import { Request, Response, NextFunction } from 'express';
import { OrdersService } from '../services/orders.service';
import { BadRequestError } from '../errors/bad-request-error';
import { OrderStatus } from '@prisma/client';
import { OrderSchema } from '../schemas/order.schema';

export class OrdersController {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }

  getOrders = async (req: Request, res: Response) => {
    const filters = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    const result = await this.ordersService.getOrders(filters);
    res.json(result);
  };

  getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await this.ordersService.getOrderById(parseInt(id));
    res.json({ success: true, data: order });
  };

  createOrder = async (req: Request, res: Response) => {
    try {
      const order = await this.ordersService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: error.message || 'An unexpected error occurred'
        }
      });
    }
  };

  updateOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Order ID is required');
      }

      console.log('Sipariş güncelleme isteği:', {
        orderId: id,
        data: req.body
      });

      const order = await this.ordersService.updateOrder(parseInt(id), req.body);
      res.json({ success: true, data: order });
    } catch (error: any) {
      console.error('Update order error:', error);
      res.status(500).json({
        success: false,
        message: 'Sipariş güncellenirken bir hata oluştu',
        error: error.message
      });
    }
  };

  deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.ordersService.deleteOrder(parseInt(id));
    res.status(204).send();
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await this.ordersService.updateOrderStatus(parseInt(id), status);
    res.json({ success: true, data: order });
  };

  cancelOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await this.ordersService.updateOrderStatus(parseInt(id), OrderStatus.CANCELLED);
    res.json({ success: true, data: order });
  };

  updateOrderNotes = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { orderNotes } = req.body;
    const order = await this.ordersService.updateOrderNotes(parseInt(id), orderNotes);
    res.json({ success: true, data: order });
  };

  getOrdersByTable = async (req: Request, res: Response) => {
    const { tableId } = req.params;
    const orders = await this.ordersService.getOrdersByTable(parseInt(tableId));
    res.json({ success: true, data: orders });
  };

  getOrdersByWaiter = async (req: Request, res: Response) => {
    const { waiterId } = req.params;
    const orders = await this.ordersService.getOrdersByWaiter(parseInt(waiterId));
    res.json({ success: true, data: orders });
  };

  getOrdersByCustomer = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const orders = await this.ordersService.getOrdersByCustomer(parseInt(customerId));
    res.json({ success: true, data: orders });
  };

  getOrdersByBranch = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const orders = await this.ordersService.getOrdersByBranch(parseInt(branchId));
    res.json({ success: true, data: orders });
  };

  getOrdersByStatus = async (req: Request, res: Response) => {
    const { status } = req.params;
    const orders = await this.ordersService.getOrdersByStatus(status as OrderStatus);
    res.json({ success: true, data: orders });
  };

  getOrdersByDateRange = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new BadRequestError('Başlangıç ve bitiş tarihi belirtilmelidir');
    }
    const orders = await this.ordersService.getOrdersByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json({ success: true, data: orders });
  };

  bulkDeleteOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('[Orders] Gelen istek:', {
        body: req.body,
        orderIds: req.body.orderIds
      });

      const { orderIds } = req.body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        throw new BadRequestError('Geçerli sipariş ID\'leri gönderilmedi');
      }

      // orderIds'leri number'a çevir
      const numericOrderIds = orderIds.map((id: any) => {
        const numId = Number(id);
        if (isNaN(numId)) {
          throw new BadRequestError(`Geçersiz sipariş ID formatı: ${id}`);
        }
        return numId;
      });

      const result = await this.ordersService.bulkDeleteOrders(numericOrderIds);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('[Orders] Controller hatası:', {
        body: req.body,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
      next(error);
    }
  };

  bulkUpdateOrderStatus = async (req: Request, res: Response) => {
    const { orderIds, status } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new BadRequestError('Geçerli sipariş ID\'leri belirtilmelidir');
    }
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestError('Geçerli bir sipariş durumu belirtilmelidir');
    }
    await this.ordersService.bulkUpdateOrderStatus(orderIds, status);
    res.json({ success: true, message: 'Siparişlerin durumu başarıyla güncellendi' });
  };

  getOrdersForPrinting = async (req: Request, res: Response) => {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new BadRequestError('Geçerli sipariş ID\'leri belirtilmelidir');
    }
    const orders = await this.ordersService.getOrdersForPrinting(orderIds);
    res.json({ success: true, data: orders });
  };

  addOrderItems = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { items } = req.body;
    const order = await this.ordersService.addOrderItems(parseInt(id), items);
    res.json({ success: true, data: order });
  };
}
