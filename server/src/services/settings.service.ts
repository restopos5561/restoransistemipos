import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';

export class SettingsService {
  async getSettings(filters: { restaurantId?: number; page?: number; limit?: number }) {
    const where: any = {
      ...(filters.restaurantId && { restaurantId: filters.restaurantId }),
    };

    const [settings, total] = await Promise.all([
      prisma.settings.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 25),
        take: filters.limit || 25,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.settings.count({ where }),
    ]);

    return {
      settings,
      total,
      page: filters.page || 1,
      limit: filters.limit || 25,
      totalPages: Math.ceil(total / (filters.limit || 25)),
    };
  }

  async createSettings(data: {
    restaurantId: number;
    appName?: string;
    appLogoUrl?: string;
    currency: string;
    timezone: string;
    dailyCloseTime?: string;
    workingHours?: string;
  }) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant) {
      throw new BadRequestError('Restoran bulunamadı');
    }

    const existingSettings = await prisma.settings.findFirst({
      where: { restaurantId: data.restaurantId },
    });

    if (existingSettings) {
      throw new BadRequestError('Bu restoran için zaten ayarlar mevcut');
    }

    return prisma.settings.create({
      data,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getSettingsById(id: number) {
    const settings = await prisma.settings.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!settings) {
      throw new BadRequestError('Ayarlar bulunamadı');
    }

    return settings;
  }

  async updateSettings(
    id: number,
    data: {
      appName?: string;
      appLogoUrl?: string;
      currency?: string;
      timezone?: string;
      dailyCloseTime?: string;
      workingHours?: string;
    }
  ) {
    await this.getSettingsById(id);

    return prisma.settings.update({
      where: { id },
      data,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteSettings(id: number) {
    await this.getSettingsById(id);
    return prisma.settings.delete({ where: { id } });
  }

  async getSettingsByRestaurantId(restaurantId: number) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new BadRequestError('Restoran bulunamadı');
    }

    const settings = await prisma.settings.findFirst({
      where: { restaurantId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!settings) {
      throw new BadRequestError('Restoran ayarları bulunamadı');
    }

    return settings;
  }
}
