import { PrismaClient, Restaurant } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface CreateRestaurantInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface UpdateRestaurantInput {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export class RestaurantsService {
  async getRestaurants(): Promise<Restaurant[]> {
    return prisma.restaurant.findMany({
      include: {
        branches: true,
      },
    });
  }

  async getRestaurantById(id: number): Promise<Restaurant | null> {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        branches: true,
      },
    });
  }

  async createRestaurant(data: CreateRestaurantInput): Promise<Restaurant> {
    return prisma.restaurant.create({
      data: {
        name: data.name,
        ...(data.address && { address: data.address }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
      },
      include: {
        branches: true,
      },
    });
  }

  async updateRestaurant(id: number, data: UpdateRestaurantInput): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new BadRequestError('Restaurant not found');
    }

    return prisma.restaurant.update({
      where: { id },
      data,
      include: {
        branches: true,
      },
    });
  }

  async deleteRestaurant(id: number): Promise<void> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        branches: {
          include: {
            userBranches: true,
            settings: true,
          },
        },
        users: true,
      },
    });

    if (!restaurant) {
      throw new BadRequestError('Restaurant not found');
    }

    // Tüm ilişkili verileri transaction içinde sil
    await prisma.$transaction([
      // 1. Kullanıcı-şube ilişkilerini sil
      prisma.userBranch.deleteMany({
        where: {
          branch: {
            restaurantId: id
          }
        }
      }),

      // 2. Kullanıcı izinlerini sil
      prisma.userPermissions.deleteMany({
        where: {
          user: {
            restaurantId: id,
          },
        },
      }),

      // 3. Kullanıcı refresh tokenlarını sil
      prisma.refreshToken.deleteMany({
        where: {
          user: {
            restaurantId: id,
          },
        },
      }),

      // 4. Şube ayarlarını sil
      prisma.branchSettings.deleteMany({
        where: {
          branch: {
            restaurantId: id,
          },
        },
      }),

      // 5. Kullanıcıları sil
      prisma.user.deleteMany({
        where: { restaurantId: id },
      }),

      // 6. Şubeleri sil
      prisma.branch.deleteMany({
        where: { restaurantId: id },
      }),

      // 7. En son restoranı sil
      prisma.restaurant.delete({
        where: { id },
      }),
    ]);
  }
}
