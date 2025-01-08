import { Request, Response } from 'express';
import { PrinterService } from '../services/printer.service';
import { PrinterType } from '@prisma/client';

export class PrinterController {
  private printerService: PrinterService;

  constructor() {
    this.printerService = new PrinterService();
  }

  getPrinters = async (req: Request, res: Response) => {
    const { restaurantId, branchId, type, isActive, page, limit } = req.query;

    const printers = await this.printerService.getPrinters({
      restaurantId: Number(restaurantId),
      branchId: branchId ? Number(branchId) : undefined,
      type: type as string,
      isActive: isActive === 'true',
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    res.json({ success: true, data: printers });
  };

  getPrinterById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const printer = await this.printerService.getPrinterById(Number(id));
    res.json({ success: true, data: printer });
  };

  createPrinter = async (req: Request, res: Response) => {
    const data = req.body;

    if (!data.name || !data.type || !data.restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (!Object.values(PrinterType).includes(data.type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid printer type',
      });
    }

    const printer = await this.printerService.createPrinter(data);
    res.status(201).json({ success: true, data: printer });
  };

  updatePrinter = async (req: Request, res: Response) => {
    const { id } = req.params;
    const printer = await this.printerService.updatePrinter(Number(id), req.body);
    res.json({ success: true, data: printer });
  };

  deletePrinter = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.printerService.deletePrinter(Number(id));
    res.status(204).send();
  };

  printTest = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, orderId } = req.body;
    await this.printerService.print(Number(id), { content, orderId });
    res.json({ success: true, message: 'Print job sent successfully' });
  };

  getPrintersByBranch = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const printers = await this.printerService.getPrintersByBranch(Number(branchId));
    res.json({ success: true, data: printers });
  };
}
