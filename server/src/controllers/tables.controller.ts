import { Request, Response } from 'express';
import { TablesService } from '../services/tables.service';
import { TableStatus } from '@prisma/client';

export class TablesController {
  private tablesService: TablesService;

  constructor() {
    this.tablesService = new TablesService();
  }

  getTables = async (req: Request, res: Response) => {
    const filters = {
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      status: req.query.status as TableStatus,
      location: req.query.location as string,
      capacity: req.query.capacity ? Number(req.query.capacity) : undefined,
      active: req.query.isActive ? req.query.isActive === 'true' : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await this.tablesService.getTables(filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getTableById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const table = await this.tablesService.getTableById(Number(id));

    res.status(200).json({
      success: true,
      data: table,
    });
  };

  createTable = async (req: Request, res: Response) => {
    const table = await this.tablesService.createTable(req.body);

    res.status(201).json({
      success: true,
      data: table,
    });
  };

  updateTable = async (req: Request, res: Response) => {
    const { id } = req.params;
    const table = await this.tablesService.updateTable(Number(id), req.body);

    res.status(200).json({
      success: true,
      data: table,
    });
  };

  updateTableStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const table = await this.tablesService.updateTableStatus(Number(id), status);

    res.status(200).json({
      success: true,
      data: table,
    });
  };

  mergeTables = async (req: Request, res: Response) => {
    const { mainTableId, tableIdsToMerge } = req.body;

    const table = await this.tablesService.mergeTables(mainTableId, tableIdsToMerge);

    res.status(200).json({
      success: true,
      data: table,
    });
  };

  transferTable = async (req: Request, res: Response) => {
    const { fromTableId, toTableId } = req.body;

    const table = await this.tablesService.transferTable(fromTableId, toTableId);

    res.status(200).json({
      success: true,
      data: table,
    });
  };

  deleteTable = async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.tablesService.deleteTable(Number(id));

    res.status(204).send();
  };
}
