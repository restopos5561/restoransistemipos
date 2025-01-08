import { Request, Response } from 'express';
import { BranchesService } from '../services/branches.service';
import { BadRequestError } from '../errors/bad-request-error';

export class BranchesController {
  private branchesService: BranchesService;

  constructor() {
    this.branchesService = new BranchesService();
  }

  getBranches = async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const branches = await this.branchesService.getBranches(Number(restaurantId));
    res.status(200).json({
      success: true,
      data: branches,
    });
  };

  getBranchById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const branch = await this.branchesService.getBranchById(Number(id));

    if (!branch) {
      throw new BadRequestError('Branch not found');
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  };

  createBranch = async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const branch = await this.branchesService.createBranch({
      ...req.body,
      restaurantId: Number(restaurantId),
    });

    res.status(201).json({
      success: true,
      data: branch,
    });
  };

  updateBranch = async (req: Request, res: Response) => {
    const { id } = req.params;
    const branch = await this.branchesService.updateBranch(Number(id), req.body);

    res.status(200).json({
      success: true,
      data: branch,
    });
  };

  deleteBranch = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.branchesService.deleteBranch(Number(id));
    res.status(204).send();
  };
}
