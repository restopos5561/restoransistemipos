import { PrismaClient, Permission } from '@prisma/client';

const prisma = new PrismaClient();

interface UserPermissionResponse {
  id: number;
  name: string;
  description: string | null;
  allowed: boolean;
}

export class UserPermissionsService {
  async getUserPermissions(userId: number): Promise<UserPermissionResponse[]> {
    console.log('Getting permissions for userId:', userId);

    const userPermissions = await prisma.userPermissions.findUnique({
      where: { userId },
      include: {
        permissions: true,
      },
    });

    console.log('Found user permissions:', userPermissions);

    // Tüm izinleri al
    const allPermissions = await prisma.permission.findMany();
    console.log('All permissions:', allPermissions);

    // Kullanıcının izinlerini al
    const userPermissionsList = userPermissions?.permissions ?? [];
    console.log('User permissions:', userPermissionsList);

    // İzinleri formatlayarak döndür
    const formattedPermissions = allPermissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      allowed: userPermissionsList.some((p) => p.id === permission.id),
    }));

    console.log('Formatted permissions:', formattedPermissions);
    return formattedPermissions;
  }

  async updateUserPermissions(
    userId: number,
    permissions: { permissionId: number; allowed: boolean }[]
  ) {
    console.log('Updating permissions for userId:', userId);
    console.log('New permissions:', permissions);

    let userPermissions = await prisma.userPermissions.findUnique({
      where: { userId },
    });

    if (!userPermissions) {
      userPermissions = await prisma.userPermissions.create({
        data: {
          userId,
          permissions: {
            connect: [],
          },
        },
      });
    }

    console.log('User permissions record:', userPermissions);

    // İzinleri güncelle
    const permissionUpdates = permissions.map(async ({ permissionId, allowed }) => {
      if (allowed) {
        return prisma.userPermissions.update({
          where: { id: userPermissions!.id },
          data: {
            permissions: {
              connect: { id: permissionId },
            },
          },
        });
      } else {
        return prisma.userPermissions.update({
          where: { id: userPermissions!.id },
          data: {
            permissions: {
              disconnect: { id: permissionId },
            },
          },
        });
      }
    });

    await Promise.all(permissionUpdates);
    return this.getUserPermissions(userId);
  }

  async deleteUserPermission(userId: number, permissionId: number) {
    console.log('Deleting permission for userId:', userId, 'permissionId:', permissionId);

    const userPermissions = await prisma.userPermissions.findUnique({
      where: { userId },
    });

    if (!userPermissions) {
      throw new Error('Kullanıcı izinleri bulunamadı');
    }

    await prisma.userPermissions.update({
      where: { id: userPermissions.id },
      data: {
        permissions: {
          disconnect: { id: permissionId },
        },
      },
    });
  }
}
