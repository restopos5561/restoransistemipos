import { PrismaClient, Permission } from '@prisma/client';

const prisma = new PrismaClient();

export class PermissionsService {
  // Tüm izinleri listele
  async getAllPermissions() {
    const permissions = await prisma.permission.findMany();
    return permissions;
  }

  // Tekil izin getir
  async getPermissionById(id: number) {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    return permission;
  }

  // Yeni izin oluştur
  async createPermission(data: { name: string; description: string }) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name: data.name },
    });

    if (existingPermission) {
      throw new Error('Permission with this name already exists');
    }

    return await prisma.permission.create({
      data,
    });
  }

  // İzin güncelle
  async updatePermission(id: number, data: { name?: string; description?: string }) {
    const permission = await this.getPermissionById(id);

    if (data.name && data.name !== permission.name) {
      const existingPermission = await prisma.permission.findUnique({
        where: { name: data.name },
      });

      if (existingPermission) {
        throw new Error('Permission with this name already exists');
      }
    }

    return await prisma.permission.update({
      where: { id },
      data,
    });
  }

  // İzin sil
  async deletePermission(id: number) {
    await this.getPermissionById(id);
    await prisma.permission.delete({
      where: { id },
    });
  }
}
