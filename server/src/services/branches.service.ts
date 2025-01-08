import { PrismaClient, Branch } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface CreateBranchInput {
  restaurantId: number;
  name: string;
  address?: string;
  isMainBranch?: boolean;
  settings?: {
    currency?: string;
    timezone?: string;
    dailyCloseTime?: string;
    workingHours?: string;
  };
}

interface UpdateBranchInput {
  name?: string;
  address?: string;
  isActive?: boolean;
  isMainBranch?: boolean;
  settings?: {
    currency?: string;
    timezone?: string;
    dailyCloseTime?: string;
    workingHours?: string;
  };
}

export class BranchesService {
  async getBranches(restaurantId: number): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: { restaurantId },
      include: {
        settings: true,
      },
    });
  }

  async getBranchById(id: number): Promise<Branch | null> {
    try {
      const branchId = Number(id);
      if (isNaN(branchId)) {
        throw new BadRequestError('Geçersiz şube ID');
      }

      return prisma.branch.findUnique({
        where: { 
          id: branchId
        },
        include: {
          settings: true,
          restaurant: true
        }
      });
    } catch (error) {
      console.error('getBranchById error:', error);
      throw error;
    }
  }

  async createBranch(data: CreateBranchInput): Promise<Branch> {
    if (data.isMainBranch) {
      // Mevcut ana şubeyi bul
      const existingMainBranch = await prisma.branch.findFirst({
        where: {
          restaurantId: data.restaurantId,
          isMainBranch: true,
        },
      });

      if (existingMainBranch) {
        // Mevcut ana şubeyi normal şube yap
        await prisma.branch.update({
          where: { id: existingMainBranch.id },
          data: { isMainBranch: false },
        });
      }
    }

    // Yeni şubeyi oluştur
    return prisma.branch.create({
      data: {
        ...data,
        settings: data.settings
          ? {
              create: data.settings,
            }
          : undefined,
      },
      include: {
        settings: true,
      },
    });
  }

  async updateBranch(id: number, data: UpdateBranchInput): Promise<Branch> {
    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new BadRequestError('Branch not found');
    }

    if (data.isMainBranch) {
      // Mevcut ana şubeyi bul
      const existingMainBranch = await prisma.branch.findFirst({
        where: {
          restaurantId: branch.restaurantId,
          isMainBranch: true,
          id: { not: id },
        },
      });

      if (existingMainBranch) {
        // Mevcut ana şubeyi normal şube yap
        await prisma.branch.update({
          where: { id: existingMainBranch.id },
          data: { isMainBranch: false },
        });
      }
    }

    return prisma.branch.update({
      where: { id },
      data: {
        ...data,
        settings: data.settings
          ? {
              upsert: {
                create: data.settings,
                update: data.settings,
              },
            }
          : undefined,
      },
      include: {
        settings: true,
      },
    });
  }

  async deleteBranch(id: number): Promise<void> {
    await prisma.$transaction([
      // Önce şube ayarlarını sil
      prisma.branchSettings.deleteMany({
        where: { branchId: id },
      }),
      // Stok geçmişini sil
      prisma.stockHistory.deleteMany({
        where: {
          stock: {
            branchId: id,
          },
        },
      }),
      // Stokları sil
      prisma.stock.deleteMany({
        where: { branchId: id },
      }),
      // Satın alma siparişi ürünlerini sil
      prisma.purchaseOrderItem.deleteMany({
        where: {
          purchaseOrder: {
            branchId: id,
          },
        },
      }),
      // Satın alma siparişlerini sil
      prisma.purchaseOrder.deleteMany({
        where: { branchId: id },
      }),
      // En son şubeyi sil
      prisma.branch.delete({
        where: { id },
      }),
    ]);
  }
}
