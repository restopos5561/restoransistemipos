import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { BadRequestError } from '../errors/bad-request-error';
import { hashPassword } from '../utils/auth.utils';
import { Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  getUsers = async (req: Request, res: Response) => {
    const { branchId, role, isActive, search, page, limit, sort } = req.query;

    const result = await this.usersService.getUsers({
      branchId: branchId ? Number(branchId) : undefined,
      role: role as Role,
      isActive: isActive ? isActive === 'true' : undefined,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort: sort as string,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.usersService.getUserById(Number(id));

    if (!user) {
      throw new BadRequestError('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  };

  createUser = async (req: Request, res: Response) => {
    const { name, email, password, role, branchId, restaurantId, permissions } = req.body;

    // Hash password
    const hashedPassword = await hashPassword(password);

    const user = await this.usersService.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      branchId,
      restaurantId,
      permissions,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  };

  updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const user = await this.usersService.updateUser(Number(id), updateData);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  };

  deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.usersService.deleteUser(Number(id));
    res.status(204).send();
  };

  updateUserPermissions = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permissions } = req.body;

    const user = await this.usersService.updateUserPermissions(Number(id), permissions);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  };

  batchCreateUsers = async (req: Request, res: Response) => {
    const { users } = req.body;

    // Hash all passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (userData: any) => ({
        ...userData,
        password: await hashPassword(userData.password),
      }))
    );

    const createdUsers = await this.usersService.batchCreateUsers(usersWithHashedPasswords);

    res.status(201).json({
      success: true,
      data: createdUsers,
    });
  };

  batchUpdateUsers = async (req: Request, res: Response) => {
    const { users } = req.body;

    // Hash passwords if provided
    const updates = await Promise.all(
      users.map(async (userData: any) => ({
        ...userData,
        password: userData.password ? await hashPassword(userData.password) : undefined,
      }))
    );

    const updatedUsers = await this.usersService.batchUpdateUsers(updates);

    res.status(200).json({
      success: true,
      data: updatedUsers,
    });
  };

  batchDeleteUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        throw new BadRequestError('ids must be an array');
      }

      console.log('Attempting batch delete with ids:', ids);
      await this.usersService.batchDeleteUsers(ids);

      res.status(204).send();
    } catch (error) {
      console.error('Error in batchDeleteUsers:', error);
      throw error;
    }
  };

  async addUserToBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, branchId } = req.body;

      // Kullanıcı ve şubenin aynı restaurant'a ait olduğunu kontrol et
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        include: {
          branch: true,
          userBranches: {
            include: {
              branch: true
            }
          }
        }
      });

      const branch = await prisma.branch.findUnique({
        where: { id: Number(branchId) }
      });

      if (!user || !branch) {
        throw new BadRequestError('Kullanıcı veya şube bulunamadı');
      }

      if (user.restaurantId !== branch.restaurantId) {
        throw new BadRequestError('Kullanıcı ve şube aynı restorana ait olmalıdır');
      }

      // Kullanıcıyı şubeye ekle
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          userBranches: {
            create: {
              branchId: branch.id
            }
          }
        },
        include: {
          userBranches: {
            include: {
              branch: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: updatedUser
      });

    } catch (error) {
      next(error);
    }
  }
}
