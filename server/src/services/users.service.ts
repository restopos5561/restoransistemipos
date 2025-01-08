import { PrismaClient, User, Role } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  branchId?: number;
  restaurantId: number;
  permissions?: string[];
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  branchId?: number;
  restaurantId?: number;
}

interface GetUsersOptions {
  branchId?: number;
  role?: Role;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export class UsersService {
  async getUsers(options: GetUsersOptions = {}): Promise<GetUsersResponse> {
    const { branchId, role, isActive, search, page = 1, limit = 10, sort } = options;

    const where = {
      ...(branchId && { branchId }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Parse sort parameter
    const orderBy = sort?.split(',').reduce((acc: any, item) => {
      const [field, direction] = item.split(':');
      return { ...acc, [field]: direction.toLowerCase() };
    }, {});

    const users = await prisma.user.findMany({
      where,
      include: {
        branch: true,
        permissions: {
          include: {
            permissions: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      total,
      page,
      totalPages,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
        permissions: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    return prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          branchId: data.branchId,
          restaurantId: data.restaurantId,
        },
      });

      // If permissions provided, create them
      if (data.permissions && data.permissions.length > 0) {
        await prisma.userPermissions.create({
          data: {
            userId: user.id,
            permissions: {
              connect: data.permissions.map((name) => ({ name })),
            },
          },
        });
      }

      return user;
    });
  }

  async updateUser(id: number, data: UpdateUserInput): Promise<User | null> {
    // Check if email is being updated and is already in use
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new BadRequestError('Email already in use');
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      include: {
        branch: true,
        permissions: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async deleteUser(id: number): Promise<void> {
    // Önce kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Kullanıcı varsa sil
    await prisma.$transaction([
      prisma.userPermissions.deleteMany({
        where: { userId: id },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId: id },
      }),
      prisma.user.deleteMany({
        where: { id },
      }),
    ]);
  }

  async updateUserPermissions(id: number, permissions: string[]): Promise<User | null> {
    return prisma.$transaction(async (prisma) => {
      // Delete existing permissions
      await prisma.userPermissions.deleteMany({
        where: { userId: id },
      });

      // Create new permissions
      await prisma.userPermissions.create({
        data: {
          userId: id,
          permissions: {
            connect: permissions.map((name) => ({ name })),
          },
        },
      });

      // Return updated user
      return prisma.user.findUnique({
        where: { id },
        include: {
          branch: true,
          permissions: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });
  }

  async batchCreateUsers(users: CreateUserInput[]): Promise<User[]> {
    return prisma.$transaction(async (prisma) => {
      const createdUsers = [];

      for (const userData of users) {
        const user = await this.createUser(userData);
        createdUsers.push(user);
      }

      return createdUsers;
    });
  }

  async batchUpdateUsers(updates: Array<{ id: number } & UpdateUserInput>): Promise<User[]> {
    return prisma.$transaction(async (prisma) => {
      const updatedUsers = [];

      for (const { id, ...data } of updates) {
        const user = await this.updateUser(id, data);
        if (user) updatedUsers.push(user);
      }

      return updatedUsers;
    });
  }

  async batchDeleteUsers(ids: number[]): Promise<void> {
    try {
      console.log('Attempting to delete users:', ids); // Debug için
      await prisma.$transaction([
        prisma.userPermissions.deleteMany({
          where: { userId: { in: ids } },
        }),
        prisma.refreshToken.deleteMany({
          where: { userId: { in: ids } },
        }),
        prisma.user.deleteMany({
          where: { id: { in: ids } },
        }),
      ]);
    } catch (error) {
      console.error('Error in batchDeleteUsers:', error);
      throw error;
    }
  }

  async getUserBranches(userId: number) {
    return prisma.userBranch.findMany({
      where: { userId },
      include: {
        branch: true
      }
    });
  }

  async addUserToBranch(userId: number, branchId: number) {
    return prisma.userBranch.create({
      data: {
        userId,
        branchId
      },
      include: {
        branch: true,
        user: true
      }
    });
  }
}
